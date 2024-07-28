import { Realm, RealmProvider, useRealm, useQuery } from "@realm/react";
import { ObjectSchema } from "realm";
import {
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  differenceInDays,
} from "date-fns";
import { RealmSet } from "realm/dist/Set";
export const CALENDAR = ["S", "M", "T", "W", "Th", "F", "Sa"];

const UNITS = [
  {
    name: "Custom",
    value: "custom",
    type: "count",
  },
  {
    name: "Minutes",
    value: "minutes",
    type: "time",
  },
  {
    name: "Hours",
    value: "hours",
    type: "time",
  },
  {
    name: "Yards",
    value: "yards",
    type: "length",
  },
  {
    name: "Miles",
    value: "miles",
    type: "length",
  },
  {
    name: "Count",
    value: "count",
    type: "count",
  },
];

class Repeat extends Realm.Object {
  period!: string;

  specific_weekday?: Realm.Set<number> | number[];
  specific_days?: Realm.Set<number> | number[];
  every_n?: number;

  static schema: Realm.ObjectSchema = {
    name: "Repeat",
    embedded: true,
    properties: {
      period: "string",
      specific_weekday: "int<>", // Set of integers
      specific_days: "int<>",
      every_n: "int?",
    },
  };
}
class Completed extends Realm.Object {
  _id!: Realm.BSON.ObjectId;
  completedAt!: Realm.List<Date>;
  amount: number = 0;

  goal!: Goal;
  isCompleted(): boolean {
    return this.amount >= this.goal.amount;
  }

  static schema: Realm.ObjectSchema = {
    name: "Completed",
    properties: {
      _id: "objectId",
      completedAt: "date<>",
      amount: "int",
      goal: "Goal",
    },
    primaryKey: "_id",
  };
}

class Goal extends Realm.Object {
  amount!: number;
  unit!: string;
  steps!: number;
  customName?: string;

  static schema: Realm.ObjectSchema = {
    name: "Goal",
    embedded: true,
    properties: {
      amount: "int",
      unit: "string",
      customName: "string?",
      steps: "int",
    },
  };
}
class Task extends Realm.Object {
  _id!: Realm.BSON.ObjectId;
  title!: string;
  repeats!: Repeat;
  description!: string;
  color!: string;
  completed!: Realm.List<Completed>;
  createdAt!: Date;
  startsOn!: Date;
  goal!: Goal;

  static generate(
    title: string,
    description: string,
    color: string,
    repeats?: Repeat,
    goal?: Goal
  ): Task {
    let startsOn = new Date(Date.now());
    startsOn.setHours(0, 0, 0, 0);
    return {
      _id: new Realm.BSON.ObjectId(),
      title,
      description,
      completed: [],
      repeats:
        repeats ??
        ({
          period: "Daily",
          specific_weekday: [0, 1, 2, 3, 4, 5, 6],
          every_n: 1,
        } as Repeat),
      color,
      goal:
        goal ??
        ({
          amount: 1,
          unit: "count",
          steps: 1,
        } as Goal),
      createdAt: new Date(Date.now()),
      startsOn: startsOn,
    } as unknown as Task;
  }

  showToday(date: Date): boolean {
    if (date < this.startsOn) {
      return false;
    }
    if (this.repeats.period == "Daily") {
      if (
        this.repeats.specific_days &&
        this.repeats.specific_days.includes(date.getDate())
      )
        return true;
      if (
        this.repeats.every_n &&
        differenceInDays(this.startsOn, date) % this.repeats.every_n == 0
      )
        return true;
      if (
        this.repeats.specific_weekday &&
        this.repeats.specific_weekday.includes(date.getDay())
      )
        return true;
    } else if (this.repeats.period == "Weekly") {
      if (
        this.repeats.every_n &&
        differenceInCalendarWeeks(date, this.startsOn) % this.repeats.every_n ==
          0
      )
        return true;
    } else if (this.repeats.period == "Monthly") {
      if (
        this.repeats.every_n &&
        differenceInCalendarMonths(date, this.startsOn) %
          this.repeats.every_n ==
          0
      )
        return true;
    }
    return false;
  }

  getStreak(startDate: Date) {
    let streak = this.getCompleted(startDate)?.isCompleted() ? 1 : 0;
    let date = new Date(startDate);
    date.setHours(0, 0, 0, 0);
    const back = this.repeats.period == "Weekly" ? 7 : 1;
    date.setDate(date.getDate() - back);

    while (date > this.startsOn && !this.showToday(date)) {
      date.setDate(date.getDate() - back);
    }
    while (this.getCompleted(date)?.isCompleted()) {
      streak++;
      date.setDate(date.getDate() - back);
      while (date > this.startsOn && !this.showToday(date)) {
        date.setDate(date.getDate() - back);
      }
    }
    return streak;
  }

  getCompleted(date: Date): Completed | undefined {
    const beginning = new Date(date);
    const end = new Date(date);
    const MorningStart = 8;
    const WeekStart = 0; // Monday

    if (this.repeats.period == "Weekly") {
      const currentDay = beginning.getDay();
      const difference = (currentDay - WeekStart + 7) % 7;

      beginning.setDate(beginning.getDate() - difference);
      end.setDate(end.getDate() + (6 - difference));
    }
    beginning.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 0);

    for (let i = this.completed.length - 1; i >= 0; i--) {
      if (
        this.completed[i].completedAt[0] >= beginning &&
        this.completed[i].completedAt[
          this.completed[i].completedAt.length - 1
        ] <= end
      )
        return this.completed[i];
    }
    return undefined;
  }

  static schema = {
    name: "Task",
    primaryKey: "_id",
    properties: {
      _id: "objectId",
      title: "string",
      description: "string",
      completed: "Completed[]",
      repeats: "Repeat",
      goal: "Goal",
      color: "string",
      createdAt: "date",
      startsOn: "date",
    },
  } as ObjectSchema;
}
export { Task, Repeat, Completed, Goal, UNITS };
