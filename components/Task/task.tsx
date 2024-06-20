import * as React from 'react';
import { FlatList, Pressable, View } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import uuid from 'react-native-uuid';
import {Text} from '~/components/ui/text';
import {
    CardDescription,
    CardTitle,
} from '~/components/ui/card';

import { Completed, Task } from '~/lib/states/task';

import Svg, { Circle, Path } from 'react-native-svg';
import { useRealm } from '@realm/react';
import { CheckIcon, PlusIcon } from 'lucide-react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useTheme } from '@react-navigation/native';
import EditTask from './editTask';


export default function TaskContent(props:{item: Task,date: Date}) {
    const { colors} = useTheme();

    const realm = useRealm();
    const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);
    const snapPoints = React.useMemo(() => ['50%'], []);
    const {item,date} = props;
    
    const completable = date <= new Date(Date.now());
    const completed = item.getCompleted(date);
    
    return <Pressable onPress={()=> {
        bottomSheetModalRef.current?.present();
    }} ><View className="min-w-full p-5 mb-2 flex flex-row justify-between bg-background rounded-lg">
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
            <Pressable  onLongPress={()=>{
            console.log("long press")
            realm.write(() => {
                if (completed){
                let index = item.completed.findIndex(a =>  a.id== completed?.id);
                if (index == -1){
                    console.log("Error")
                    console.log(completed.completedAt)
                    return;
                }
                if (item.completed[index].amount <= item.goal?.steps){
                    item.completed = item.completed.splice(index,1);
                    return;
                }
                item.completed[index].amount -= item.goal?.steps;
                
                }else{
                item.completed.push({id:uuid.v4(),completedAt: date,amount:item.goal.amount,goal:{
                    ...item.goal
                }} as Completed);
                }
            });
            }}   onPress={() => {
            console.log("pressed")
            
            const today = new Date(date);
            date.setHours(today.getHours(),today.getMinutes(),today.getSeconds(),0);
            if (completed && completed.isCompleted()){
                return;
            }
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
    </View>
    <BottomSheetModal ref={bottomSheetModalRef} snapPoints={snapPoints}    handleIndicatorStyle={{
                backgroundColor: colors.border,
            }}
                    
            backgroundStyle={{
                backgroundColor: colors.background
            }}>
        <BottomSheetView >
            <EditTask  task={item} />
        </BottomSheetView>
    </BottomSheetModal>
    </Pressable>;
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