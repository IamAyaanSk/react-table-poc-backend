import dotenv from "dotenv";
dotenv.config();
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { PrismaClient } from "@prisma/client";

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
  const pageSize = req.query.pageSize
    ? parseInt(req.query.pageSize as string)
    : 10;

  try {
    const [ledgerRecords, totalRecords] = await Promise.all([
      prisma.ledger.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.ledger.count(),
    ]);

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
