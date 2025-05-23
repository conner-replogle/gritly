import { Pressable, View, VirtualizedList } from "react-native";
import { Text } from "../ui/text";

import {
  addDays,
  differenceInCalendarWeeks,
  format,
  isSameDay,
  startOfWeek,
} from "date-fns";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import useHabits, { useHabitsWithCompleted } from "~/lib/hooks/Habits";
import { Habit } from "~/models/Habit";
import { DateContext } from "~/lib/config";

export function CalendarSection() {
  const { date, setDate } = useContext(DateContext);
  const today = new Date(Date.now());
  const LENGTH = 24;
  const HALF = 12;
  const ref = useRef<View>(null);

  const flatlistRef = useRef<VirtualizedList<Date[]>>(null);
  const [indexG, setIndexG] = useState(HALF);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (isSameDay(today, date)) {
      flatlistRef.current?.scrollToIndex({ index: HALF, animated: false });
    }
  }, [date]);

  const getWeek = (index: number) => {
    const a = index - HALF;
    const weekStart = startOfWeek(addDays(today, a * 7));
    return Array.from({ length: 7 }, (_, i) => {
      let a = addDays(weekStart, i);
      a.setHours(12, 0, 0, 0);
      return a;
    });
  };

  return (
    <View
      onLayout={(a) => {
        setWidth(a.nativeEvent.layout.width);
      }}
      className="w-full  flex flex-col items-end"
    >
      {/*<View className="flex flex-row justify-end w-full h-6">*/}
      {/*  {referenceText()}*/}
      {/*</View>*/}
      <VirtualizedList<Date[]>
        ref={flatlistRef}
        onScrollToIndexFailed={(info) => {}}
        horizontal={true}
        decelerationRate={0}
        snapToInterval={width}
        snapToAlignment={"center"}
        initialScrollIndex={HALF}
        onViewableItemsChanged={(info) => {
          setIndexG(info.changed[0].index ?? indexG);
        }}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 90,
        }}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        // WHY THE FUCK DOES IT RENDER EVERYTHING
        initialNumToRender={2}
        windowSize={3}
        maxToRenderPerBatch={1}
        getItemCount={(data) => LENGTH}
        getItem={(_data, index) => getWeek(index)}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item[0].toISOString()}
        renderItem={({ item, index }) => {
          return (
            <Week
              width={width}
              dates={item}
              currentDate={date}
              setDate={(a) => {
                setIndexG(HALF);
                setDate(a);
              }}
            />
          );
        }}
      />
    </View>
  );
}

function Week(props: {
  width: number;
  dates: Date[];
  currentDate: Date;
  setDate: (date: Date) => void;
}) {
  const { dates, width, currentDate, setDate } = props;

  return (
    <View
      className={"flex flex-row justify-evenly items-start "}
      style={{
        width: width,
      }}
    >
      {Array.from(dates, (date, i) => (
        <Day
          key={`${date.getDay()}${i}`}
          date={date}
          currentDate={currentDate}
          setDate={setDate}
        />
      ))}
    </View>
  );
}

const Day = ({
  date,
  currentDate,
  setDate,
}: {
  date: Date;
  currentDate: Date;
  setDate: (date: Date) => void;
}) => {
  const habits = useHabitsWithCompleted(date);
  const showBar = (habit: Habit, date: Date) => {};
  return (
    <View className="flex flex-col justify-start">
      <Pressable
        className={
          date.getDate() == currentDate.getDate() &&
          date.getMonth() == currentDate.getMonth()
            ? "w-[30px] border-2 border-primary rounded-lg"
            : "w-[30px] p-[2px]"
        }
        onPress={() => setDate(date)}
      >
        <View>
          <Text className=" text-center text-lg font-bold">
            {format(date, "EEEEE")}
          </Text>
          <Text className="text-muted-foreground text-center text-xs font-semibold">
            {date.getDate()}
          </Text>
        </View>
      </Pressable>
      <View className="flex flex-col mt-4 gap-1">
        {Array.from(habits, ({ habit, completed }, i) => {
          //NEED TO CHECK IF COMPLETED CONTAINS TODAY
          if (habit.repeats.period == "Weekly") {
            if (
              !completed ||
              completed.completed_times.find((a) => isSameDay(a.date, date)) ==
                undefined
            ) {
              return null;
            }
          }
          return (
            <HabitBar
              key={`${habit.id}`}
              habit={habit}
              completed={completed?.isCompleted ?? false}
            />
          );
        })}
      </View>
    </View>
  );
};

const HabitBar = ({
  habit,
  completed,
}: {
  habit: Habit;
  completed: boolean;
}) => {
  return (
    <View
      style={{
        backgroundColor: `${habit.color}`,

        opacity: completed ? 1.0 : 0.3,
        height: completed ? 5 : 3,
      }}
    />
  );
};
