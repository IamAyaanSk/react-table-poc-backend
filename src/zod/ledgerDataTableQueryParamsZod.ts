import { z } from "zod";
import { createDataTableQueryParamsZodSchema } from "./common.js";

const walletLedgerSortFields = ["amount", "openingBalance", "closingBalance"];
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
