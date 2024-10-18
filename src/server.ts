import dotenv from "dotenv";
dotenv.config();
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { Prisma, PrismaClient } from "@prisma/client";
import getOrderByArray from "./utils/getOrderByArray.js";
import qs from "qs";
import { walletLedgerSchema } from "./zod/ledgerDataTableQueryParamsZod.js";
import { isValidDateRange } from "./utils/isValidDateRange.js";

const server = express();
server.set("query parser", function (str: string) {
  return qs.parse(str, { comma: true });
});

const port = 1337;
const prisma = new PrismaClient();

server.use(helmet());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use(
  cors({
    origin: "*",
    optionsSuccessStatus: 200,
  })
);

server.get("/ledgers", async (req, res) => {
  const validatedqueryParams = walletLedgerSchema.safeParse(req.query);

  if (validatedqueryParams.error)
    return res.status(400).json({
      error: validatedqueryParams.error.errors[0].message,
    });

  const startDateTimeStamp = validatedqueryParams.data.startDate;
  const endDateTimeStamp = validatedqueryParams.data.endDate;

  if (startDateTimeStamp && endDateTimeStamp) {
    const isDateRangeValid = isValidDateRange({
      startDate: startDateTimeStamp,
      endDate: endDateTimeStamp,
    });

    if (!isDateRangeValid)
      return res.status(400).json({
        error: "Invlid date range",
      });
  }

  const page = validatedqueryParams.data.page;
  const pageSize = validatedqueryParams.data.pageSize;

  const sortBy = validatedqueryParams.data.sort;
  const orderByArray = sortBy && getOrderByArray(sortBy);

  const purpose = validatedqueryParams.data.purpose;
  const type = validatedqueryParams.data.type;

  const searchQuery = validatedqueryParams.data.search;

  // Generate where clause
  const whereClause: Prisma.LedgerWhereInput = {};
  if (purpose && purpose.length > 0) {
    whereClause.purpose = { in: purpose };
  }
  if (type && type.length > 0) {
    whereClause.type = { in: type };
  }

  if (searchQuery) {
    whereClause.OR = [
      {
        referenceId: {
          contains: searchQuery,
          mode: "insensitive",
        },
      },
      {
        service: {
          contains: searchQuery,
          mode: "insensitive",
        },
      },
    ];
  }

  if (startDateTimeStamp && endDateTimeStamp) {
    const startDate = new Date(startDateTimeStamp);
    const endDate = new Date(endDateTimeStamp);
    whereClause.dateTime = {
      gte: startDate,
      lte: endDate,
    };
  }

  try {
    const [ledgerRecords, totalRecords, totalAmount] = await Promise.all([
      prisma.ledger.findMany({
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: orderByArray,
        where: whereClause,
      }),
      prisma.ledger.count({
        where: whereClause,
      }),
      prisma.ledger.aggregate({
        _sum: {
          amount: true,
        },
        where: whereClause,
      }),
    ]);

    console.log("Total Amount", totalAmount._sum.amount);

    res.json({
      data: ledgerRecords,
      totalRecords,
      totalAmount: totalAmount._sum.amount,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
