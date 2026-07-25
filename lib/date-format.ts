const MONTH_DAY_WITH_COLON = /^(January|February|March|April|May|June|July|August|September|October|November|December):\s*(\d{1,2})(?=,|\b)/i;
const LEADING_DATE = /^(January|February|March|April|May|June|July|August|September|October|November|December) (\d{1,2}), (\d{4})(?:\s*[:—–-]\s*)?(.*)$/i;

export function normalizeMonthDateFormatting(value: string) {
  const repairedMonthDay = value.replace(MONTH_DAY_WITH_COLON, "$1 $2");
  const match = repairedMonthDay.match(LEADING_DATE);

  if (!match) return repairedMonthDay;
  const [, month, day, year, event] = match;
  const date = `${month} ${day}, ${year}`;
  return event ? `${date}: ${event}` : date;
}
