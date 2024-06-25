
import { FlatList, Pressable, ScrollView, useWindowDimensions, View, VirtualizedList } from "react-native";
import { Text } from "../ui/text";

import { startOfWeek, addDays, format, add, addWeeks, set, getWeekYear, differenceInCalendarWeeks,  } from "date-fns";
import { Gesture, GestureDetector, HandlerStateChangeEvent, Swipeable } from "react-native-gesture-handler";
import { useCallback, useEffect, useRef, useState } from "react";
import { Task } from "~/lib/states/task";



export function CalendarSection(props: { date: Date,setDate: (date: Date) => void,tasks: Task[]}) {
    const { date,setDate,tasks } = props;
    const LENGTH = 100;
    const HALF = 50;
    const ref = useRef<View>(null);
    const [index, setIndex] = useState(HALF);
    const [width, setWidth] = useState(0);
    useEffect(() => {
        ref.current?.measure((x, y, w, h) => {
            setWidth(w);
        });
    }, [ref]);
    const flatlistRef = useRef<VirtualizedList<Date[]>>(null);
    const getWeek = (index:number) => {
        const a = index - HALF;
        const weekStart = startOfWeek(addDays(date, a * 7));
        const weekDates = Array.from({ length: 7 }, (_, i) =>{
            let a = addDays(weekStart, i)
            a.setHours(12,0,0,0)
            return a;
        }
        );
        return weekDates;
    }
    const refrenceText = () => {
        let diff = differenceInCalendarWeeks(Date.now(),getWeek(index)[3]);
        if (diff == 0){
            return null
        }
        return <Text>
                {format(getWeek(index)[3],"MMMM")}, {Math.abs(diff)} week
                {Math.abs(diff) == 1 ? "":"s"} {diff > 0 ? "ago":"ahead"}</Text>

    }
    useEffect(() => {
        flatlistRef.current?.scrollToIndex({index: HALF, animated: false});


    }, [date]);
    return (
        <View ref={ref} className="w-full flex flex-col items-end">
            <View className="flex flex-row justify-end w-full h-6">
                {refrenceText()}
            </View>
            <VirtualizedList<Date[]> 
                ref={flatlistRef}
                onScrollToIndexFailed={(info) => {}}
                horizontal= {true}
                decelerationRate={0}
                snapToInterval={width}
                snapToAlignment={"center"}
                initialScrollIndex={HALF}
                onViewableItemsChanged={(info) => {
                    setIndex(info.changed[0].index ?? index);
                }}
                viewabilityConfig={
                    {
                    
                        itemVisiblePercentThreshold: 90
                    }
                }
                getItemLayout={(data, index) => ({
                    length: width,
                    offset: width * index,
                    index
                })}
                // WHY THE FUCK DOES IT RENDER EVERYTHING
                initialNumToRender={1}
                
                getItemCount={(data) => LENGTH}
                getItem={(_data, index) => 
                    getWeek(index)
                }

                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item[0].toISOString()}
                renderItem={({ item}) => {
                    return <Week  tasks={tasks} width={width} dates={item} currentDate={date} setDate={(a) =>{
                        setIndex(HALF)
                        setDate(a)
                    }} />;
                }}
            />
          
    </View>
  
    );
}


function Week(props:{tasks:Task[],width:number,dates: Date[],currentDate: Date,setDate: (date: Date) => void}){

    const {dates,width,currentDate,tasks,setDate} = props;
    return <View className={`flex flex-row justify-evenly items-start`}  style={{
        width:width
    }}>
    {Array.from(dates, (date, i) => (
        <View key={i}   className="flex flex-col justify-start">
        <Pressable 
            className={(
                date.getDate() == currentDate.getDate() && 
                date.getMonth() == currentDate.getMonth()) ? 
                "w-[30px] border-2 border-primary rounded-lg" : 
                "w-[30px] p-[2px]"} 
                onPress={()=> setDate(date)} >
        <View >
            <Text  className=' text-center text-lg font-bold'>{format(date,"EEEEE")}</Text>
            <Text  className='text-muted-foreground text-center text-xs font-semibold'>{date.getDate()}</Text>
        </View>
        
        </Pressable>
        <View className="flex flex-col mt-4 gap-1">
        {
            Array.from(tasks.filter(a => a.showToday(date)), (task, i) => (
                <View key={task._id.toString()} style={{backgroundColor:`${task.color}`, opacity:task.getCompleted(date)?.isCompleted() ? 1.0 : 0.3,height:3 }}/>
            ))
        }

    </View>
       </View>
    )) }
    
    
</View>
}