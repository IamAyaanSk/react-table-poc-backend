import { z } from "zod";
import { createDataTableQueryParamsZodSchema } from "./common.js";

// List available sort filters for the route
const walletLedgerSortFields = [
  "amount",
  "openingBalance",
  "closingBalance",
  "dateTime",
];

// Define filter schemas here
const walletLedgerFilterSchema = {
  type: z
    .array(
      z.enum(["CREDIT", "DEBIT"], {
        message: "Must be a valid filter",
      })
    )
    .optional(),
  purpose: z
    .array(
      z.enum(
        [
          "WALLET",
          "SURCHARGE",
          "FUND_REQUEST",
          "SERVICE",
          "COMMISION",
          "REFUND",
        ],
        {
          message: "Must be a valid filter",
        }
      )
    )
    .optional(),
};

// Create the walletLedgerSchema
export const walletLedgerSchema = createDataTableQueryParamsZodSchema<
  typeof walletLedgerFilterSchema
>({
  filterSchema: walletLedgerFilterSchema,
  sortFields: walletLedgerSortFields,
});
