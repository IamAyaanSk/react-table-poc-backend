import dotenv from "dotenv";
dotenv.config();
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import getOrderByArray from "./utils/getOrderByArray";

const server = express();
const port = 1337;
const prisma = new PrismaClient();

server.use(helmet());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    optionsSuccessStatus: 200,
  })
);

server.get("/ledgers", async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const pageSize = req.query.page_size
    ? parseInt(req.query.page_size as string)
    : 10;

  const sortBy = req.query.sort_by?.toString() || "";
  const orderByArray = getOrderByArray(sortBy);

  const purpose = req.query.purpose?.toString() || "";
  const type = req.query.type?.toString() || "";
  const referenceId = req.query.referenceId?.toString() || "";

  const fromDate = req.query.from_date
    ? new Date(req.query.from_date.toString())
    : new Date();
  const toDate = req.query.to_date
    ? new Date(req.query.to_date.toString())
    : new Date();

  // Generate where clause
  const whereClause: Record<
    string,
    Record<string, string[] | string | Date>
  > = {};
  if (purpose) {
    whereClause.purpose = { in: purpose.split(",") };
  }
  if (type) {
    whereClause.type = { in: type.split(",") };
  }

  if (referenceId) {
    whereClause.referenceId = { contains: referenceId };
  }

  whereClause.dateTime = {
    gte: fromDate,
    lte: toDate,
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
    console.log(fromDate.toISOString(), toDate.toISOString());

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
