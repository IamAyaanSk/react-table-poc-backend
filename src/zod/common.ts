import { z } from "zod";

const sortDirections = ["asc", "desc"];

const createDateSchema = (areDatesOptional: boolean) => {
  const dateSchema = z
    .string()
    .regex(/^\d+$/, { message: "Must be a valid timestamp format" })
    .refine(
      (ts) => {
        const date = new Date(parseInt(ts));
        return !isNaN(date.getTime());
      },
      {
        message: "Invalid timestamp",
      }
    )
    .transform(Number);

  return areDatesOptional ? dateSchema.optional() : dateSchema;
};

export const createDataTableQueryParamsZodSchema = <T extends z.ZodRawShape>({
  filterSchema,
  sortFields,
  pageSizes = ["100", "200", "300", "400", "500", "1000"],
  areDatesOptional = false,
}: {
  filterSchema: T;
  sortFields: string[];
  pageSizes?: string[];
  areDatesOptional?: boolean;
}) => {
  const baseSchema = z.object({
    page: z
      .string()
      .regex(/^\d+$/, "Page must be a positive integer")
      .transform(Number),

    pageSize: z
      .string()
      .refine((size) => pageSizes.includes(size), {
        message: "Invalid page size",
      })
      .transform(Number),

    search: z.string().optional(),
    sort: z
      .array(
        z.string().refine(
          (val) => {
            const [field, direction] = val.split("-");
            return (
              sortFields.includes(field) && sortDirections.includes(direction)
            );
          },
          {
            message: "Invalid sort filters",
          }
        )
      )
      .optional(),

    startDate: createDateSchema(areDatesOptional),
    endDate: createDateSchema(areDatesOptional),
  });

  return baseSchema.extend(filterSchema);
};
