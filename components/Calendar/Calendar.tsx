
import { FlatList, Pressable, ScrollView, View, VirtualizedList } from "react-native";
import { Text } from "../ui/text";

import { startOfWeek, addDays, format, add, addWeeks,  } from "date-fns";
import { Gesture, GestureDetector, HandlerStateChangeEvent, Swipeable } from "react-native-gesture-handler";
import { useCallback, useEffect, useRef, useState } from "react";



export function CalendarSection(props: { date: Date,setDate: (date: Date) => void}) {
    const LENGTH = 100;
    const HALF = 50;
    const { date,setDate } = props;
    const [index, setIndex] = useState(HALF);
    const flatlistRef = useRef<VirtualizedList<Date[]>>(null);
    useEffect(() => {
        flatlistRef.current?.scrollToIndex({index: HALF, animated: false});
    }, [date]);
    console.log(index)
    return (
        <View className="flex flex-col items-end">
            <View className="flex flex-row justify-between w-full">
            <Text>{format(addWeeks(date,index-HALF),"MMMM")}</Text>
            {HALF-index != 0 && <Text>{Math.abs(HALF-index)} weeks {HALF-index > 0 ? "ago":"ahead"}</Text>}
                
            </View>
        <VirtualizedList<Date[]> 
 

        ref={flatlistRef}
        onScrollToIndexFailed={(info) => {}}
        horizontal= {true}
        decelerationRate={0}
        snapToInterval={350}
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
            length: 350,
            offset: 350 * index,
            index
        })}
        initialNumToRender={3}
        getItemCount={(data) => LENGTH}
        getItem={(_data, index) => {
            const a = index - HALF;
            const weekStart = startOfWeek(addDays(date, a * 7));
            const weekDates = Array.from({ length: 7 }, (_, i) =>{
                let a = addDays(weekStart, i)
                a.setHours(12,0,0,0)
                return a;
            }
            );
            return weekDates;
        }}

        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item[0].toISOString()}
        renderItem={({ item}) => {
           
            return <Week dates={item} date={date} setDate={setDate} />;
            
        }}
        
        />
    </View>
  
    );
}


function Week(props:{dates: Date[],date: Date,setDate: (date: Date) => void}){
    const {dates,date,setDate} = props;
    return <View className="flex flex-row justify-evenly w-[350px] items-center" >
    {Array.from(dates, (a, i) => (
        <Pressable className={(a.getDate() == date.getDate() && a.getMonth() == date.getMonth()) ? "w-[30px] border-2 border-primary rounded-lg" : "w-[30px] "} key={i} onPress={()=> setDate(a)} >
        <View >
            <Text  className=' text-center text-lg font-bold'>{format(a,"EEEEE")}</Text>
            <Text  className='text-muted-foreground text-center text-xs font-semibold'>{a.getDate()}</Text>
        </View>
        </Pressable>
    )) }
    
</View>
}