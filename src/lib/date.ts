import { format } from "date-fns";
import { enGB } from "date-fns/locale";

export function formatUkDate(value: Date | string) {
  return format(new Date(value), "dd/MM/yyyy", { locale: enGB });
}
