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
import useTasks, { useTasksWithCompleted } from "~/components/hooks/Tasks";
import { Task } from "~/models/Task";
import { log } from "~/lib/config";
import { withObservables } from "@nozbe/watermelondb/react";
import { of as of$ } from "rxjs";
import { TaskCard } from "~/components/Task/taskCard";
import { CompletedResult } from "~/models/CompletedResult";

export function CalendarSection(props: {
  date: Date;
  setDate: (date: Date) => void;
}) {
  const { date, setDate } = props;
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
      className={`flex flex-row justify-evenly items-start `}
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
  const tasks = useTasksWithCompleted(date);
  const showBar = (task: Task, date: Date) => {};
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
        {Array.from(tasks, (task, i) => {
          //NEED TO CHECK IF COMPLETED CONTAINS TODAY

          return (
            <TaskBar
              key={`${task.task.id}`}
              task={task.task}
              completed={task.completed?.isCompleted ?? false}
            />
          );
        })}
      </View>
    </View>
  );
};

const TaskBar = ({ task, completed }: { task: Task; completed: boolean }) => {
  return (
    <View
      style={{
        backgroundColor: `${task.color}`,

        opacity: completed ? 1.0 : 0.3,
        height: completed ? 5 : 3,
      }}
    />
  );
};
