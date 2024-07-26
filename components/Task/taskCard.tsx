import { Completed, Task } from "~/lib/states/task";
import { Pressable, View } from "react-native";
import { CardDescription, CardTitle } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import Svg, { Path } from "react-native-svg";
import { CheckIcon, PlusIcon } from "lucide-react-native";
import * as React from "react";

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
  completed: Completed | undefined;
  streak: number;
}) {
  return (
    <View
      style={{ borderColor: task.color, borderWidth: 2 }}
      className=" p-5 mb-2 flex flex-row justify-between bg-background rounded-lg"
    >
      <View className="text-start flex flex-col justify-start items-start">
        <CardTitle>
          {task.title} {streak > 1 ? ` 🔥${streak}` : ""}{" "}
        </CardTitle>

        <CardDescription className="ml-1"></CardDescription>
      </View>

      {completable && (
        <View className="flex flex-col items-center justify-center">
          <Pressable
            onLongPress={onCompleteLongPress}
            onPress={() => {
              onCompletePress();
            }}
          >
            <CompleteIcon completed={completed} />
          </Pressable>
          <Text className="text-xs font-semibold">
            {completed?.amount ?? 0} /{" "}
            {completed?.goal.amount ?? task.goal.amount}
          </Text>
        </View>
      )}
    </View>
  );
}

function CompleteIcon({ completed }: { completed: Completed | undefined }) {
  const isCompleted = completed?.isCompleted();
  const color = isCompleted ? "green" : "#3498db";
  return (
    <View>
      <Svg
        className="absolute"
        width={36}
        height={36}
        viewBox="0 0 24 24"
        fill="none"
      >
        {!isCompleted && (
          <CirclePath
            radius={10}
            color={color}
            strokeWidth={3}
            percentage={
              completed ? (completed!.amount / completed!.goal.amount) * 100 : 0
            }
          />
        )}
      </Svg>
      <View className="absolute flex-row items-center justify-center w-full h-full">
        {isCompleted && <CheckIcon size={24} strokeWidth={3} color={color} />}
        {!isCompleted && <PlusIcon size={24} strokeWidth={3} color={color} />}
      </View>
    </View>
  );
}
const CirclePath = ({
  radius,
  strokeWidth,
  color,
  percentage,
}: {
  radius: number;
  color: string;
  strokeWidth: number;
  percentage: number;
}) => {
  if (percentage == 0) {
    return null;
  }
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${
    (percentage / 100) * circumference
  } ${circumference}`;
  const strokeDasharray2 = `${
    ((percentage - 50) / 100) * circumference
  } ${circumference}`;
  // Calculate start and end points of the circle
  const startX = radius + strokeWidth / 2;
  const startY = strokeWidth / 2;
  const endX = radius + strokeWidth / 2;
  const endY = radius * 2 + strokeWidth / 2;

  // Calculate path to create an arc that can extend to full circle
  const largeArcFlag = percentage > 50 ? 1 : 0;
  const sweepFlag = 1; // Always sweep in the same direction
  const path = `
        M ${startX}, ${startY}
        A ${radius},${radius} 0 ${largeArcFlag},${sweepFlag} ${endX},${endY}
    `;
  const path2 = `
        M ${endX}, ${endY}
        A ${radius},${radius} 0 ${largeArcFlag},${sweepFlag} ${startX},${startY}
    `;

  return (
    <Svg height={radius * 2 + strokeWidth} width={radius * 2 + strokeWidth}>
      <Path
        d={path}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={strokeDasharray}
      />
      {percentage > 50 && (
        <Path
          d={path2}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray2}
        />
      )}
    </Svg>
  );
};
