import * as React from 'react';
import { FlatList, Pressable, View } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

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
import { ArrowLeft, ArrowRight, ArrowUp, Check, CheckCheck, CheckCircle, CheckCircle2, CheckIcon } from 'lucide-react-native';
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
  const todayTasks = tasks.filtered('repeats.period == $0 || repeats.period == $1',"Daily","one-time").filter((a) => a.showToday(date));
  const weekTasks = tasks.filtered('repeats.period == $0',"Weekly").filter((a) => a.showToday(date));
  return (
    <SafeAreaView>
    <View className='h-[100vh] bg-secondary/50'>
      {HeaderCard(date,todayTasks,weekTasks,setDate)}
  
      <View className='p-6 flex flex-col gap-4'>
          <Section title="Today" tasks={todayTasks} date={date} realm={realm}/>
          <Section title="Week" tasks={weekTasks} date={date} realm={realm}/>
          {tasks.length == 0 &&
            <AddTasks />}
          {/* <Section title="Upcoming" tasks={upComing} date={date} realm={realm}/> */}
      </View>
    </View>
    </SafeAreaView>
  );
}
function HeaderCard(date: Date,daily: Task[],weekly: Task[],setDate: React.Dispatch<React.SetStateAction<Date>>) {

  
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
          <Text className='text-xl font-semibold'>{daily.filter(a => a.isCompleted(date)).length} / {daily.length}</Text>
        </View>
        <View className='items-center'>
          <Text className='text-sm text-muted-foreground'>Weekly</Text>
          <Text className='text-xl font-semibold'>{weekly.filter(a => a.isCompleted(date)).length} / {weekly.length}</Text>
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

function Section(props:{title:String,tasks: Task[],date: Date,realm: Realm}){
  const {title,tasks,date,realm} = props;
  const [open, setOpen] = React.useState(tasks.length != 0);
 
  const finished = tasks.filter(a => a.isCompleted(date));
  const unfinished = tasks.filter(a => !a.isCompleted(date)); 
  if (tasks.length == 0)
    return null;
  return  <Collapsible open={open && tasks.length != 0} > 
    <CollapsibleTrigger onPress={()=> {setOpen(!open)}} >
    <CardTitle>{title}</CardTitle>
    </CollapsibleTrigger>
    <CollapsibleContent className='pt-3'>
    {unfinished.length != 0 && <FlatList data={unfinished}
  renderItem={({item}) => <TaskContent date={date} item={item} realm={realm}/>}/>}
  {finished.length != 0 &&
      <Collapsible  > 
        <CollapsibleTrigger  asChild>
        <Button size="sm" variant={"ghost"}>
        <Text className='ml-2 text-muted-foreground'>Completed</Text>
     
        </Button>
       
        </CollapsibleTrigger>
        <CollapsibleContent className='pt-3'>
        <FlatList data={finished}
      renderItem={({item}) => <TaskContent date={date} item={item} realm={realm}/>}/>
        </CollapsibleContent>
      </Collapsible>
      }
    </CollapsibleContent>
  </Collapsible>
}



function TaskContent(props:{item: Task,realm: Realm,date: Date}) {
  const {item,realm,date} = props;
  
  const completable = date <= new Date(Date.now());

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
      <Pressable disabled={item.isCompleted(date) }  onPress={() => {
        console.log("pressed")
        
        const today = new Date(date);
        date.setHours(today.getHours(),today.getMinutes(),today.getSeconds(),0);
        realm.write(() => {
          item.completed.push({completedAt: date} as Completed);
        });
      }}>
        {
          item.isCompleted(date) && <CheckCircle2 size={24} color={"#10B981"} />
        }
        {
          !item.isCompleted(date) && <CheckCircle2 size={24} color={"#D1D5DB"} />
        }
      </Pressable>
    </View>}
  </View>;
}

