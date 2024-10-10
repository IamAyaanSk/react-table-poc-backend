import { DateTime } from "luxon";

export const timestampToIstDate = (timestamp: number) => {
  return DateTime.fromMillis(timestamp, {
    zone: "Asia/Kolkata",
  });
};
