import { format } from "date-fns";

export function formatTimestamp(isoString: string | number | Date) {
  return format(new Date(isoString), "dd-MMM-yyyy hh:mm a");
}