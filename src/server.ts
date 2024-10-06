import dotenv from "dotenv";
dotenv.config();
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import getOrderByArray from "./utils/getOrderByArray.js";

const server = express();
const port = 1337;
const prisma = new PrismaClient();

server.use(helmet());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    optionsSuccessStatus: 200,
  })
);

server.get("/ledgers", async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const pageSize = req.query.pageSize
    ? parseInt(req.query.pageSize as string)
    : 10;

  const sortBy = req.query.sortBy?.toString() || "";
  const orderByArray = getOrderByArray(sortBy);

  const purpose = req.query.purpose?.toString() || "";
  const type = req.query.type?.toString() || "";
  const searchQuery = req.query.search;
  console.log(type, purpose);

  const startDate = req.query.startDate
    ? new Date(parseInt(req.query.startDate.toString()))
    : new Date();
  const endDate = req.query.endDate
    ? new Date(parseInt(req.query.endDate.toString()))
    : new Date();

  // Generate where clause
  const whereClause: any = {};
  if (purpose) {
    whereClause.purpose = { in: purpose.split(",") };
  }
  if (type) {
    whereClause.type = { in: type.split(",") };
  }

  if (searchQuery) {
    whereClause.OR = [
      {
        referenceId: {
          contains: searchQuery.toString(),
          mode: "insensitive",
        },
      },
      {
        service: {
          contains: searchQuery.toString(),
          mode: "insensitive",
        },
      },
    ];
  }

  whereClause.dateTime = {
    gte: startDate,
    lte: endDate,
  };

  try {
    const [ledgerRecords, totalRecords] = await Promise.all([
      prisma.ledger.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: orderByArray,
        where: whereClause,
      }),
      prisma.ledger.count({
        where: whereClause,
      }),
    ]);

    console.log("Where clause", whereClause);
    console.log(startDate.toISOString(), endDate.toISOString());

    console.log("Endpoint hit for", page, pageSize);

    res.json({
      data: ledgerRecords,
      totalRecords,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
