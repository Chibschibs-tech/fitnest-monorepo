/** D-058: business dates and ISO weeks use the server instant in Casablanca.
 * Callers must obtain the instant from their server/database clock, never a request
 * body. This pure module also runs in clients for display, which grants no authority.
 */
export const BUSINESS_TIME_ZONE = "Africa/Casablanca" as const;

const formatter = new Intl.DateTimeFormat("en-GB-u-ca-iso8601-nu-latn", {
  timeZone: BUSINESS_TIME_ZONE,
  year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
});

type CalendarParts = { year: number; month: number; day: number; hour: number; minute: number; second: number };

function parts(instant: Date): CalendarParts {
  if (!(instant instanceof Date) || !Number.isFinite(instant.getTime())) {
    throw new RangeError("A valid server instant is required");
  }
  const values = Object.fromEntries(formatter.formatToParts(instant).map(p => [p.type, p.value]));
  const result = {
    year: Number(values.year), month: Number(values.month), day: Number(values.day),
    hour: Number(values.hour), minute: Number(values.minute), second: Number(values.second),
  };
  if (instant.getUTCFullYear() < 1 || result.year > 9998) {
    throw new RangeError("Server instant is outside the supported calendar range");
  }
  return result;
}

// Calendar arithmetic only; this value is NOT a business midnight instant.
function calendarDate(year: number, month: number, day: number): Date {
  const value = new Date(0);
  value.setUTCFullYear(year, month - 1, day);
  value.setUTCHours(0, 0, 0, 0);
  return value;
}

function dateLabel(p: Pick<CalendarParts, "year" | "month" | "day">): string {
  return `${String(p.year).padStart(4, "0")}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

/** Resolve each local midnight separately; never assume a week is 168 hours. */
function midnight(calendar: Date): Date {
  const target = calendar.getTime();
  let candidate = target;
  for (let tries = 0; tries < 4; tries++) {
    const p = parts(new Date(candidate));
    const wall = calendarDate(p.year, p.month, p.day).getTime()
      + p.hour * 3_600_000 + p.minute * 60_000 + p.second * 1000;
    if (wall === target) return new Date(candidate);
    candidate += target - wall;
  }
  throw new RangeError("Business midnight cannot be resolved unambiguously");
}

export function businessDate(serverInstant: Date): string {
  return dateLabel(parts(serverInstant));
}

export interface BusinessIsoWeek {
  readonly year: number;
  readonly week: number;
  readonly key: string;
  readonly startDate: string;
  /** SQL comparisons use >= startInclusive AND < endExclusive. */
  readonly startInclusive: string;
  readonly endExclusive: string;
}

export function businessIsoWeek(serverInstant: Date): BusinessIsoWeek {
  const p = parts(serverInstant);
  const monday = calendarDate(p.year, p.month, p.day);
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  const thursday = new Date(monday);
  thursday.setUTCDate(thursday.getUTCDate() + 3);
  const year = thursday.getUTCFullYear();
  const january4 = calendarDate(year, 1, 4);
  january4.setUTCDate(january4.getUTCDate() - ((january4.getUTCDay() + 6) % 7));
  const week = 1 + Math.round((monday.getTime() - january4.getTime()) / 604_800_000);
  const nextMonday = new Date(monday);
  nextMonday.setUTCDate(nextMonday.getUTCDate() + 7);
  return {
    year, week, key: `${String(year).padStart(4, "0")}-W${String(week).padStart(2, "0")}`,
    startDate: dateLabel({year: monday.getUTCFullYear(), month: monday.getUTCMonth() + 1, day: monday.getUTCDate()}),
    startInclusive: midnight(monday).toISOString(),
    endExclusive: midnight(nextMonday).toISOString(),
  };
}
