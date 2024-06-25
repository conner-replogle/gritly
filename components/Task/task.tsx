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
import { UpdateMode } from 'realm';
import {EditTaskScreen} from "~/components/Task/EditTaskScreen";
import {TaskCard} from "~/components/Task/taskCard";



export default function TaskContent(props:{item: Task,date: Date}) {
    const { colors} = useTheme();

    const realm = useRealm();
    const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);
    const snapPoints = React.useMemo(() => ['90%'], []);
    const {item,date} = props;
    
    const completable = date <= new Date(Date.now());
    const completed = item.getCompleted(date);
    const streak = item.getStreak(date);
    return <>
    <TaskCard 
    task={item} 
    streak={streak} 
    completable={completable}
    completed={completed}
    onCardPress={()=>{bottomSheetModalRef.current?.present()}}
    onCompletePress={() => {
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
    }}
    onCompleteLongPress={()=>{
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
                item.completed.splice(index,1);
                return;
            }
            item.completed[index].amount -= item.goal?.steps;
            
            }else{
            item.completed.push({id:uuid.v4(),completedAt: date,amount:item.goal.amount,goal:{
                ...item.goal
            }} as Completed);
            }
        });
        }
    }
    />
    <BottomSheetModal 
        ref={bottomSheetModalRef} 
        snapPoints={snapPoints}    
        handleIndicatorStyle={{
            backgroundColor: colors.border,
        }}
        backgroundStyle={{
            backgroundColor: colors.background
        }}>
        <BottomSheetView >
                <EditTaskScreen onDelete={()=>{
                    realm.write(() => {
                        realm.delete(item);
                    });
                    bottomSheetModalRef.current?.dismiss();
                }} submitLabel="Save" onSubmit={(task)=>{
                realm.write(() => {
                    realm.create(Task,task,UpdateMode.Modified);
                });
                bottomSheetModalRef.current?.dismiss();
            }} task={item} />
        </BottomSheetView>
    </BottomSheetModal>
    </>;
}
