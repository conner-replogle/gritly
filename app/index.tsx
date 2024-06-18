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
const DateContext = React.createContext(new Date(Date.now()));


export default function Screen() {
  const [date, setDate] = React.useState(new Date(Date.now()))
  
  const realm = useRealm();
  const tasks = useQuery(Task).filtered('startsOn <= $0',date);
  console.log(`User Realm User file location: ${realm.path}`)
  console.log(`Current Date ${date}`)
  const todayTasks = tasks.filter(a => a.showToday(date));
  return (
    <SafeAreaView>
    <View className='h-[100vh] bg-secondary/50'>
      {HeaderCard(date,todayTasks,setDate)}
  
      <View className='p-6 flex flex-col gap-4'>
          <FlatList data={todayTasks} renderItem={(item) => <TaskContent date={date} item={item.item}  />} />
          {tasks.length == 0 &&
            <AddTasks />}
          {/* <Section title="Upcoming" tasks={upComing} date={date} realm={realm}/> */}
      </View>
    </View>
    </SafeAreaView>
  );
}
function HeaderCard(date: Date,tasks: Task[],setDate: React.Dispatch<React.SetStateAction<Date>>) {

  const daily = tasks.filter(a => a.repeats.period == "daily");
  const weekly = tasks.filter(a => a.repeats.period == "weekly");
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
      <AddTasks dense />
      

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
          <Text className='text-xl font-semibold'>{daily.filter(a => a.getCompleted(date)?.isCompleted()).length} / {weekly.length}</Text>
        </View>
        <View className='items-center'>
          <Text className='text-sm text-muted-foreground'>Up Next</Text>
          <Text className='text-xl font-semibold'>14</Text>
        </View>
      </View>
    </CardContent>
    <CardFooter>
      <CalendarSection date={date} setDate={setDate} />
    </CardFooter>
  </View>;
}




function TaskContent(props:{item: Task,date: Date}) {
  const realm = useRealm();
  const {item,date} = props;
  
  const completable = date <= new Date(Date.now());
  const completed = item.getCompleted(date);
  console.log(completed)
  console.log(item)

  return <View className="min-w-full p-5 mb-2 flex flex-row justify-between bg-background rounded-lg">
      <View className='text-start flex flex-col justify-start items-start'>
        <CardTitle >{item.title }</CardTitle>
        
        <CardDescription className='ml-1'>{
          item.repeats.period == "one-time" && 
          `Created on the ${item.createdAt.getDate()}th`
          
        }{
          item.repeats.period != "one-time" && 
          item.description
          
        } </CardDescription>

      </View>
      
    {completable && <View className='flex flex-col items-center justify-center'>
      <Pressable disabled={completed?.isCompleted()}   onPress={() => {
        console.log("pressed")
        
        const today = new Date(date);
        date.setHours(today.getHours(),today.getMinutes(),today.getSeconds(),0);
       
        realm.write(() => {
          if (completed){
            let index = item.completed.findIndex(a =>  a.id== completed?.id);
            if (index == -1){
              console.log("Error")
              console.log(completed.completedAt)
              return;
            }
            item.completed[index].amount += item.goal?.steps;
          }else{
            item.completed.push({id:uuid.v4(),completedAt: date,amount:item.goal.steps,goal:{
              ...item.goal
            }} as Completed);
          }
          
        });//completed={item.completed[item.completed.length].goal} 
      }}>
        <CompleteIcon completed={completed} />
      </Pressable>
    </View>}
  </View>;
}


function CompleteIcon({completed}:{completed:Completed | undefined}) {
 
  const isCompleted = completed?.isCompleted();
  const color = isCompleted ? "green" : "#3498db";
  return (
    <View>
      <Svg className='absolute' width={36} height={36}  viewBox="0 0 24 24" fill="none">
        { !isCompleted && <CirclePath radius={10} color={color} strokeWidth={3} percentage={completed? (completed!.amount / completed!.goal.amount)*100 : 0} />}
      </Svg>
      <View className='absolute flex-row items-center justify-center w-full h-full'>
        { isCompleted && 
          <CheckIcon size={24} strokeWidth={3} color={color} />}
        { !isCompleted && 
        <PlusIcon size={24} strokeWidth={3} color={color} />}
      </View>
    </View>
  );
}
const CirclePath = ({ radius, strokeWidth,color, percentage }:{radius:number,color:string, strokeWidth:number, percentage:number}) => {
  if (percentage == 0) {
    return null;
  }
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
  const strokeDasharray2 = `${((percentage-50) / 100) * circumference} ${circumference}`;
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
  `

  return (
    <Svg height={radius * 2 + strokeWidth} width={radius * 2 + strokeWidth}>
      <Path
        d={path}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap='round'
        strokeDasharray={strokeDasharray}
      />
      {percentage> 50 && <Path
        d={path2}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeLinecap='round'
        strokeDasharray={strokeDasharray2}
      />}
    </Svg>
  );
};