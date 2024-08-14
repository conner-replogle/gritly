export enum Period {
  Daily = "Daily",
  Weekly = "Weekly",
  Monthly = "Monthly",
}

export enum Frequency {
  specific_weekday = "specific_weekday",
  specific_days = "specific_days",
  every_n = "every_n",
}

export interface Repeats {
  period: Period;
  selected_frequency: Frequency;
  specific_weekday: number[];
  specific_days: number[];
  every_n: number;
}

export interface Goal {
  amount: number;
  unit: string;
  steps: number;
  customName?: string;
}

export type IconProp = {
  family: string;
  name: string;
};

export interface Analytics {
  streaks: { dates: Date[] }[];
}
