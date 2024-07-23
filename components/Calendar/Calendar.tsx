import { Pressable, View, VirtualizedList } from "react-native";
import { Text } from "../ui/text";

import {
  addDays,
  differenceInCalendarWeeks,
  format,
  startOfWeek,
} from "date-fns";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { Task } from "~/lib/states/task";
import { useQuery } from "@realm/react";
import { Results } from "realm";
import { ExplosionContext } from "~/app";

export function CalendarSection(props: {
  date: Date;
  setDate: (date: Date) => void;
}) {
  const { date, setDate } = props;
  const LENGTH = 100;
  const HALF = 50;
  const ref = useRef<View>(null);

  const flatlistRef = useRef<VirtualizedList<Date[]>>(null);
  const [index, setIndex] = useState(HALF);
  const [width, setWidth] = useState(0);
  const tasks = useQuery(Task);

  useEffect(() => {
    flatlistRef.current?.scrollToIndex({ index: HALF, animated: false });
  }, [date]);
  const getWeek = (index: number) => {
    const a = index - HALF;
    const weekStart = startOfWeek(addDays(date, a * 7));
    return Array.from({ length: 7 }, (_, i) => {
      let a = addDays(weekStart, i);
      a.setHours(12, 0, 0, 0);
      return a;
    });
  };
  const referenceText = useCallback(() => {
    let diff = differenceInCalendarWeeks(Date.now(), getWeek(index)[3]);
    if (diff == 0) {
      return null;
    }
    return (
      <Text>
        {format(getWeek(index)[3], "MMMM")}, {Math.abs(diff)} week
        {Math.abs(diff) == 1 ? "" : "s"} {diff > 0 ? "ago" : "ahead"}
      </Text>
    );
  }, []);

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
          setIndex(info.changed[0].index ?? index);
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
        initialNumToRender={1}
        getItemCount={(data) => LENGTH}
        getItem={(_data, index) => getWeek(index)}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item[0].toISOString()}
        renderItem={({ item }) => {
          return (
            <Week
              tasks={tasks}
              width={width}
              dates={item}
              currentDate={date}
              setDate={(a) => {
                setIndex(HALF);
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
  tasks: Results<Task>;
  width: number;
  dates: Date[];
  currentDate: Date;
  setDate: (date: Date) => void;
}) {
  const { dates, width, currentDate, tasks, setDate } = props;
  return (
    <View
      className={`flex flex-row justify-evenly items-start `}
      style={{
        width: width,
      }}
    >
      {Array.from(dates, (date, i) => (
        <View key={i} className="flex flex-col justify-start">
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
            {Array.from(
              tasks.filter(
                (a) =>
                  a.showToday(date) &&
                  !(
                    a.repeats.period == "Weekly" &&
                    !a.getCompleted(date)?.isCompleted()
                  )
              ),
              (task, i) => (
                <View
                  key={task._id.toString()}
                  style={{
                    backgroundColor: `${task.color}`,
                    opacity: task.getCompleted(date)?.isCompleted() ? 1.0 : 0.3,
                    height: 5,
                  }}
                />
              )
            )}
          </View>
        </View>
      ))}
    </View>
  );
}
