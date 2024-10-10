import { z } from "zod";

const sortDirections = ["asc", "desc"];

export const createDataTableQueryParamsZodSchema = <T extends z.ZodRawShape>({
  filterSchema,
  sortFields,
  pageSizes = ["100", "200", "500", "1000"],
}: {
  filterSchema: T;
  sortFields: string[];
  pageSizes?: string[];
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
    startDate: z
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
      .transform(Number),
    endDate: z
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
      .transform(Number),
  });

  return baseSchema.extend(filterSchema);
};
