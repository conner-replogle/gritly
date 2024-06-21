
import { FlatList, Pressable, ScrollView, useWindowDimensions, View, VirtualizedList } from "react-native";
import { Text } from "../ui/text";

import { startOfWeek, addDays, format, add, addWeeks,  } from "date-fns";
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


    const currentWeek = getWeek(index);
    useEffect(() => {
        flatlistRef.current?.scrollToIndex({index: HALF, animated: false});
    }, [date]);
    return (
        <View ref={ref} className=" w-full flex flex-col items-end">
            <View className="flex flex-row justify-between w-full">
            <Text>{format(addWeeks(date,index-HALF),"MMMM")}</Text>
            {HALF-index != 0 && <Text>{Math.abs(HALF-index)} weeks {HALF-index > 0 ? "ago":"ahead"}</Text>}
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
                initialNumToRender={3}
                getItemCount={(data) => LENGTH}
                getItem={(_data, index) => 
                    getWeek(index)
                }

                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item[0].toISOString()}
                renderItem={({ item}) => {
                    return <Week tasks={tasks} width={width} dates={item} currentDate={date} setDate={setDate} />;
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
        <View className="flex flex-col justify-start">
        <Pressable 
            className={(
                date.getDate() == currentDate.getDate() && 
                date.getMonth() == currentDate.getMonth()) ? 
                "w-[30px] border-2 border-primary rounded-lg" : 
                "w-[30px] p-[2px]"} 
                key={i} onPress={()=> setDate(date)} >
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