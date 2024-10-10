import { DateTime } from "luxon";
import { timestampToIstDate } from "./timestampToIstDate.js";

export const isValidDateRange = (dateRange: {
  startDate: number;
  endDate: number;
}) => {
  // start date should be smaller than end date
  const startDate = DateTime.fromMillis(dateRange.startDate);
  const endDate = DateTime.fromMillis(dateRange.endDate);

  if (startDate > endDate) return false;

  // the difference should be only of 1 month
  const diffInMonths = endDate.diff(startDate, "months");
  if (diffInMonths.months > 1) return false;

  // no data prior to 3 months can be accessed
  const currentIstTime = timestampToIstDate(Date.now());
  const dataPermittedUptoDate = currentIstTime
    .minus({ months: 3 })
    .startOf("day");
  if (startDate < dataPermittedUptoDate) return false;

  return true;
};
