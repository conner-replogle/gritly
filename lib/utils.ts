import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { addDays, addMonths, addWeeks, startOfDay } from "date-fns";
import { CALENDAR } from "~/models/schema";
import { SWATCHES_COLORS } from "~/components/Habit/EditHabitScreen/SelectColor";
import { EditableHabit } from "~/models/Habit";
import { Frequency, Goal, Period, Repeats } from "~/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPrevDate(repeats: Repeats, currentDate: Date): Date {
  let nextDate = new Date(currentDate);

  switch (repeats.period) {
    case Period.Daily:
      if (repeats.selected_frequency == Frequency.specific_weekday) {
        const currentDay = currentDate.getDay(); // 0 (Sunday) - 6 (Saturday)
        const nextWeekdays = repeats.specific_weekday
          .map((day) => (day > currentDay ? day : day + 7))
          .sort((a, b) => a - b);

        nextDate.setDate(
          currentDate.getDate() + (nextWeekdays[0] - currentDay)
        );
      } else if (repeats.selected_frequency == Frequency.every_n) {
        nextDate = addDays(nextDate, -repeats.every_n);
      }
      break;

    case Period.Weekly:
      if (repeats.selected_frequency == Frequency.every_n) {
        nextDate = addWeeks(nextDate, -(repeats.every_n * 7));
      } else {
        throw new Error("Invalid frequency");
      }
      break;

    case Period.Monthly:
      if (repeats.selected_frequency == Frequency.specific_days) {
        const currentMonthDay = currentDate.getDate();
        const nextMonthDays = repeats.specific_days
          .filter((day) => day > currentMonthDay)
          .sort((a, b) => a - b);

        if (nextMonthDays.length > 0) {
          nextDate.setDate(nextMonthDays[0]);
        } else {
          nextDate.setMonth(nextDate.getMonth() + repeats.every_n);
          nextDate.setDate(repeats.specific_days[0]);
        }
      } else if (repeats.selected_frequency == Frequency.every_n) {
        nextDate = addMonths(nextDate, -repeats.every_n);
      } else {
        throw new Error("Invalid frequency");
      }
      break;

    default:
      throw new Error("Invalid period");
  }

  return nextDate;
}

export function getNextDate(repeats: Repeats, currentDate: Date): Date {
  let nextDate = new Date(currentDate);

  switch (repeats.period) {
    case Period.Daily:
      if (repeats.selected_frequency == Frequency.specific_weekday) {
        const currentDay = currentDate.getDay(); // 0 (Sunday) - 6 (Saturday)
        const nextWeekdays = repeats.specific_weekday
          .map((day) => (day > currentDay ? day : day + 7))
          .sort((a, b) => a - b);

        nextDate.setDate(
          currentDate.getDate() + (nextWeekdays[0] - currentDay)
        );
      } else if (repeats.selected_frequency == Frequency.every_n) {
        nextDate = addDays(nextDate, repeats.every_n);
      }
      break;

    case Period.Weekly:
      if (repeats.selected_frequency == Frequency.every_n) {
        nextDate = addDays(nextDate, repeats.every_n * 7);
      } else {
        throw new Error("Invalid frequency");
      }
      break;

    case Period.Monthly:
      if (repeats.selected_frequency == Frequency.specific_days) {
        const currentMonthDay = currentDate.getDate();
        const nextMonthDays = repeats.specific_days
          .filter((day) => day > currentMonthDay)
          .sort((a, b) => a - b);

        if (nextMonthDays.length > 0) {
          nextDate.setDate(nextMonthDays[0]);
        } else {
          nextDate.setMonth(nextDate.getMonth() + repeats.every_n);
          nextDate.setDate(repeats.specific_days[0]);
        }
      } else if (repeats.selected_frequency == Frequency.every_n) {
        nextDate = addMonths(nextDate, repeats.every_n);
      } else {
        throw new Error("Invalid frequency");
      }
      break;

    default:
      throw new Error("Invalid period");
  }

  return nextDate;
}

export function repeatsToString(goal: Goal, repeats: Repeats) {
  let prefix = "";
  if (repeats.period == "Daily") {
    if (repeats.specific_weekday) {
      prefix += `Every ${repeats.specific_weekday
        .map((a) => CALENDAR[a])
        .join(", ")} `;
    } else if (repeats.every_n) {
      prefix += `Every ${repeats.every_n} days `;
    }
  } else if (repeats.period == "Weekly") {
    if (repeats.every_n) {
      prefix += `Every ${repeats.every_n} weeks `;
    }
  } else if (repeats.period == "Monthly") {
  } else {
  }

  prefix += `for ${goal.amount} ${goal.unit}`;
  return prefix;
}

function getRandomBrightColor(): string {
  return SWATCHES_COLORS[Math.floor(Math.random() * SWATCHES_COLORS.length)];
}

export function GenerateHabit(): EditableHabit {
  return {
    title: "New Habit",
    description: "",
    icon: undefined,
    createdAt: new Date(Date.now()),
    startsOn: startOfDay(new Date(Date.now())),
    color: getRandomBrightColor(),
    repeats: {
      period: Period.Daily,
      specific_weekday: [] as number[],
      every_n: 1,
      selected_frequency: Frequency.every_n,
    } as Repeats,
    goal: {
      amount: 1,
      steps: 1,
      unit: "count",
    } as Goal,
  } as EditableHabit;
}
