import * as React from 'react';
import { FlatList, Pressable, View } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import uuid from 'react-native-uuid';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Progress } from '~/components/ui/progress';
import { Text } from '~/components/ui/text';
import { Tooltip, TooltipContent, TooltipTrigger } from '~/components/ui/tooltip';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, ArrowUp, Check, CheckCheck, CheckCircle, CheckCircle2, CheckIcon, PlusIcon } from 'lucide-react-native';
import { AddTasks } from '~/components/AddTask/AddTasks';
import { useQuery, useRealm } from '@realm/react';
import { Completed, Task } from '~/lib/states/task';
import { Button } from '~/components/ui/button';
import Svg, { Circle, Path } from 'react-native-svg';
import { Results } from 'realm';
import { CalendarSection } from '~/components/Calendar/Calendar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible';
import TaskContent from '~/components/Task/task';

const DateContext = React.createContext(new Date(Date.now()));
export default function Screen() {
  const [date, setInnerDate] = React.useState(new Date(Date.now()))
  const setDate = (date: Date) => {
    date.setHours(6,0,0,0);
    setInnerDate(date);
  }
  const realm = useRealm();
  const tasks = useQuery(Task);
  console.log(`User Realm User file location: ${realm.path}`)
  console.log(`Current Date ${date}`)
  const todayTasks = tasks.filter(a => a.showToday(date));
  console.log(tasks)
  return (
    <SafeAreaView>
    <View className='h-[100vh] bg-secondary/50'>
      {HeaderCard(date,tasks.map((a)=>a),setDate)}
  
      <View className='p-6 flex flex-col gap-4 h-full'>
        
          <FlatList ListFooterComponent={AddTasks} data={todayTasks} renderItem={(item) => <TaskContent date={date} item={item.item}  />} />
      </View>
    </View>
    </SafeAreaView>
  );
}
function HeaderCard(date: Date,tasks: Task[],setDate: (date: Date) => void) {
  const todayTasks = tasks.filter(a => a.showToday(date));

  const daily = todayTasks.filter(a => a.repeats.period == "Daily");
  const weekly = todayTasks.filter(a => a.repeats.period == "Weekly");
  return <View className="bg-background">
    <CardHeader className='flex flex-row justify-between items-center'>
      <View>
        <CardTitle className='text-start'>{date.toLocaleString('en-US', { year: '2-digit', month: 'long', day: 'numeric' })}</CardTitle>
        <CardDescription className='text-base font-semibold'>{date.toLocaleString('en-US', { weekday: 'long' })}</CardDescription>
        
      </View>
      <View className='flex flex-row items-center'>
      <Button variant={"outline"} size="sm" onPress={()=> {
        setDate(new Date(Date.now()));

      }}><Text>Today</Text></Button>
      </View>
      
    </CardHeader>
    <CardContent>
      <View className='flex-row justify-around gap-3'>
        <View className='items-center'>
          <Text className='text-sm text-muted-foreground'>Daily</Text>
          <Text className='text-xl font-semibold'>{daily.filter(a => a.getCompleted(date)?.isCompleted()).length} / {daily.length}</Text>
        </View>
        <View className='items-center'>
          <Text className='text-sm text-muted-foreground'>Weekly</Text>
          <Text className='text-xl font-semibold'>{weekly.filter(a => a.getCompleted(date)?.isCompleted()).length} / {weekly.length}</Text>
        </View>
        <View className='items-center'>
          <Text className='text-sm text-muted-foreground'>Up Next</Text>
          <Text className='text-xl font-semibold'>14</Text>
        </View>
      </View>
    </CardContent>
    <CardFooter>
      <CalendarSection tasks={tasks} date={date} setDate={setDate} />
    </CardFooter>
  </View>
}


