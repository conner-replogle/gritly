import { Pressable, View } from "react-native";
import { CardDescription, CardTitle } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import Svg, { Path } from "react-native-svg";
import { CheckIcon, PlusIcon } from "lucide-react-native";
import * as React from "react";
import {
  CompletedResult,
  EditableTask,
  repeatsToString,
  Task,
} from "~/models/Task";
import { Completed } from "~/models/Completed";
import { useTheme } from "@react-navigation/native";
import Animated, {
  useAnimatedProps,
  useAnimatedRef,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useEffect, useRef } from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export function TaskCard({
  task,
  streak,
  onCompletePress,
  onCompleteLongPress,
  completable,
  completed,
}: {
  completable: boolean;
  onCompletePress: () => void;
  onCompleteLongPress: () => void;
  task: Task;
  completed: CompletedResult;
  streak: number;
}) {
  return (
    <View className=" p-3 mb-2 flex flex-row justify-start border-secondary border-2 items-center bg-background rounded-3xl h-24 ">
      <View className="aspect-square w-16 flex items-center justify-center">
        <CirclePath
          radius={18}
          color={"#3498db"}
          strokeWidth={3}
          percent={(completed.total / task.goal.amount) * 100}
        />
        <View
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <FontAwesome name="map" size={16} />
        </View>
      </View>
      <View className="text-start border-primary flex-1 flex flex-col justify-evenly items-start">
        <Text className="text-lg font-semibold">
          {task.title} {streak > 1 ? ` 🔥${streak}` : ""}{" "}
        </Text>

        <CardDescription>
          {completed.total}/{task.goal.amount} {task.goal.unit.toUpperCase()}{" "}
        </CardDescription>
      </View>

      {completable && (
        <View className="flex flex-col items-center justify-center">
          <Pressable
            onLongPress={onCompleteLongPress}
            onPress={() => {
              onCompletePress();
            }}
          >
            <CompleteIcon
              completed={completed ?? undefined}
              goal={task.goal.amount}
            />
          </Pressable>
        </View>
      )}
    </View>
  );
}

function CompleteIcon({
  completed,
  goal,
}: {
  completed: CompletedResult;
  goal: number;
}) {
  const isCompleted = completed.isCompleted;
  const color = isCompleted ? "green" : "#3498db";
  return (
    <View className=" flex-row items-center justify-center aspect-square mr-3">
      {isCompleted && <CheckIcon size={24} strokeWidth={3} color={color} />}
      {!isCompleted && <PlusIcon size={24} strokeWidth={3} color={color} />}
    </View>
  );
}
const AnimatedPath = Animated.createAnimatedComponent(Path);

const CirclePath = ({
  radius,
  strokeWidth,
  color,
  percent,
}: {
  radius: number;
  color: string;
  strokeWidth: number;
  percent: number;
}) => {
  const percentage = useSharedValue<number>(0);
  useEffect(() => {
    percentage.value = withSpring(percent);
  }, [percent]);

  const circumference = 2 * Math.PI * radius;

  // Calculate start and end points of the circle
  const startX = radius + strokeWidth / 2;
  const startY = strokeWidth / 2;
  const endX = radius + strokeWidth / 2;
  const endY = radius * 2 + strokeWidth / 2;

  // Calculate path to create an arc that can extend to full circle
  const largeArcFlag = percent > 50 ? 1 : 0;
  const sweepFlag = 1; // Always sweep in the same direction
  const path = `
        M ${startX}, ${startY}
        A ${radius},${radius} 0 ${percent > 50 ? 1 : 0},${1} ${endX},${endY}
        A ${radius},${radius} 0 ${percent > 50 ? 1 : 0},${1} ${startX},${startY}
    `;

  const backgroundCircle = `
        M ${startX}, ${startY}
        A ${radius},${radius} 0 ${largeArcFlag},${sweepFlag} ${endX},${endY}
        
        M ${endX}, ${endY}
        A ${radius},${radius} 0 ${largeArcFlag},${sweepFlag} ${startX},${startY}
    `;

  const animatedProps = useAnimatedProps(() => ({
    strokeDasharray: `${
      (percentage.value / 100) * circumference
    } ${circumference}`,
  }));

  return (
    <Svg height={radius * 2 + strokeWidth} width={radius * 2 + strokeWidth}>
      <Path
        d={backgroundCircle}
        stroke={"#f0f0f0"}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
      />
      {percent > 0 && (
        <AnimatedPath
          d={path}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          animatedProps={animatedProps}
        />
      )}
    </Svg>
  );
};
