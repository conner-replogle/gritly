import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plus } from 'lucide-react-native';
import { LayoutAnimation, Modal, NativeSyntheticEvent, Pressable, SafeAreaView, ScrollView, TextInput, TextInputFocusEventData, TextInputProps, View } from 'react-native';
import { setAndroidNavigationBar } from '~/lib/android-navigation-bar';
import { MoonStar } from '~/lib/icons/MoonStar';
import { Sun } from '~/lib/icons/Sun';
import { useColorScheme } from '~/lib/useColorScheme';
import { cn } from '~/lib/utils';
import { Text } from '../ui/text';
import { ToggleGroup, ToggleGroupIcon, ToggleGroupItem } from '~/components/ui/toggle-group';

import {
    BottomSheetModal,
    BottomSheetView,
    BottomSheetModalProvider,
    useBottomSheetInternal,
  } from '@gorhom/bottom-sheet';
import { Button } from '../ui/button';
import { useRealm } from '@realm/react';
import { CALENDAR, Goal, Repeat, Task, UNITS } from '~/lib/states/task';
import { Input } from '~/components/ui/input';

import { forwardRef, Ref, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Label } from '../ui/label';
import { RealmSet } from 'realm/dist/public-types/Set';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useTheme } from '@react-navigation/native';
import { BottomSheetTextInputProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetTextInput';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Handle } from './customhandle';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select';
import ColorPicker, { HueSlider, OpacitySlider, Panel1, Preview, Swatches } from 'reanimated-color-picker';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import TaskContent, { TaskCard } from '../Task/task';
//import Handle from './customhandle';



export function AddTasks(props:{dense?: boolean}) {
  const [modalVisible, setModalVisible] = useState(false);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  

  return (
    <View>
        
        <AddTaskSheet bottomSheetModalRef={bottomSheetModalRef} />

  { props.dense && <Pressable onPress={()=> bottomSheetModalRef.current?.present()} className='flex flex-row justify-center items-center w-12 h-12 web:ring-offset-background web:transition-colors web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2'>
        {({ pressed }) => (
            <View
                className={cn(
                    'aspect-square ',
                    pressed && 'opacity-70'
                )}
                >
                <Plus className='text-foreground' size={24} strokeWidth={3} />
            </View>
        )}
    </Pressable>}
    { !props.dense && 
    <Button  onPress={()=>{bottomSheetModalRef.current?.present()}}> 
    <Text>Add Task</Text>
    </Button>
    }
    </View>

    
);
}

function RadioGroupItemWithLabel({
    value,
    onLabelPress,
  }: {
    value: string;
    onLabelPress: () => void;
  }) {
    return (
        <View className={'flex-row gap-2 items-center'}>
            <RadioGroupItem aria-labelledby={`label-for-${value}`} value={value} />
            <Label nativeID={`label-for-${value}`} onPress={onLabelPress}>
            {value}
            </Label>
        </View>
    );
  }

  

function AddTaskSheet(props:{bottomSheetModalRef:React.RefObject<BottomSheetModalMethods>}){
    const { colors} = useTheme();

    const {bottomSheetModalRef} = props;
    const [index, setIndex] = useState<number>(0);
    const realm = useRealm();
    const [isSimple,setIsSimple] = useState(false);
    // variables
    const snapPoints = useMemo<string[]>(()=> {
        if (isSimple){
            return ["40%"];
        }else{
            return ["90%"];
        }
    },[isSimple,]);

    return (
        <BottomSheetModal
            handleComponent={(props) => <Handle {...props} title={!isSimple ? "Simple" : "Advanced"} onPress={()=> setIsSimple(!isSimple)} />}
            handleHeight={5}
            ref={bottomSheetModalRef}
            index={0}
            keyboardBehavior='interactive'
            snapPoints={snapPoints}
            handleIndicatorStyle={{
                backgroundColor: colors.border,
            }}
                    
            backgroundStyle={{
                backgroundColor: colors.background
            }}
            onAnimate={(_, index) => {
                console.log(index)
                if (index != -1)
                    setIndex(index);
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                // if (index == 0){
                //     setIsSimple(true);
                // }
            }}
            >
            <BottomSheetView >
            <EditTaskScreen submitLabel="Create" task={Task.generate("","","blue")} onSubmit={(task)=>{
                realm.write(()=>{
                    realm.create("Task",task);
                });
                bottomSheetModalRef.current?.dismiss();
            }} />
            </BottomSheetView>
        </BottomSheetModal>
   
    );
}



// const BottomSheetInput = forwardRef<
//     TextInput,
//     BottomSheetTextInputProps
// >(({ onFocus, onBlur, ...rest }, ref) => {
//   //#region hooks
//     const { shouldHandleKeyboardEvents } = useBottomSheetInternal();

//     useEffect(() => {
//         return () => {
//         // Reset the flag on unmount
//         shouldHandleKeyboardEvents.value = false;
//         };
//     }, [shouldHandleKeyboardEvents]);
//     //#endregion

//     //#region callbacks
//     const handleOnFocus = useCallback(
//         (args: NativeSyntheticEvent<TextInputFocusEventData>) => {
//             shouldHandleKeyboardEvents.value = true;
//             if (onFocus) {
//                 onFocus(args);
//             }
//         },
//         [onFocus, shouldHandleKeyboardEvents]
//     );
//     const handleOnBlur = useCallback(
//         (args: NativeSyntheticEvent<TextInputFocusEventData>) => {
//             shouldHandleKeyboardEvents.value = false;
//             if (onBlur) {
//                 onBlur(args);
//             }
//         },
//         [onBlur, shouldHandleKeyboardEvents]
//     );
//     //#endregion

//     return (
//         <Input
//         ref={ref}
//         onFocus={handleOnFocus}
//         onBlur={handleOnBlur}
//         {...rest}
//         />
//     );
// });

export function EditTaskScreen({onDelete,submitLabel, task, onSubmit}:{onDelete?:()=> void,submitLabel:string,task:Task,onSubmit:(task:Task)=> void}){
    const [ntask, setTask] = useState(task);
    function ValidateForm(){
        return ntask.title.length > 0;
    }
    function onLabelPress(label: string) {
        
        setTask((a)=>{
            return {
                ...a,
                repeats: {
                    ...a.repeats,
                    period: label
                }
            } as Task
        })
       
    }
    function onDayPress(nDays: string[]) {
    
        console.log(nDays);
        const parsedDays = nDays.map((a) => parseInt(a));
        console.log(parsedDays);
        setTask((a)=>{
            return {
                ...a,
                repeats: {
                    ...a.repeats,
                    specfic_weekday: parsedDays
                }
            } as Task
        })
    }
    return <ScrollView contentInset={{bottom:300}} >
    <View className='bg-background   p-5 pt-0 flex flex-col gap-4'>
<Label nativeID='title'>Title</Label>
<Input
    placeholder='Name your task'
    nativeID='title'
    value={ntask.title}
    onChangeText={(b) => {
        setTask((a)=>{
            return {
                ...a,
                title: b
            } as Task
        })
    }}
    aria-labelledbyledBy='inputLabel'
    aria-errormessage='inputError'
/>
<Label nativeID='description'>Description</Label>
<Input
    placeholder='What exactly is this task?'
    nativeID='description'
    value={ntask.description}
    onChangeText={(b) => {
        setTask((a)=>{
            return {
                ...a,
                description: b
            } as Task
        })
    }}
    aria-labelledbyledBy='inputLabel'
    aria-errormessage='inputError'
/>
<Text className='text-xl font-semibold'>Type</Text>
<RadioGroup value={ntask.repeats.period} onValueChange={(a) => {
   
    onLabelPress(a);
}} className='gap-3'>
    <RadioGroupItemWithLabel onLabelPress={()=>onLabelPress("Daily")} value='Daily' />
    <RadioGroupItemWithLabel onLabelPress={()=>onLabelPress("Weekly")} value='Weekly' />
</RadioGroup>
{
    ntask.repeats.period === "Daily" &&
    <ToggleGroup value={ntask.repeats.specfic_weekday?.map((a) => a.toString())??[]} onValueChange={onDayPress} type='multiple'>
        {Array.from(CALENDAR, (a, i) => (
            <ToggleGroupItem key={i} value={i.toString()}>
                <Text  className='w-[20px] text-center'>{a}</Text>
            </ToggleGroupItem>
        ))}
    </ToggleGroup>
}

<Collapsible >
    <CollapsibleTrigger asChild>
        <Text className='text-xl font-semibold'>Select Color </Text>
    </CollapsibleTrigger>
    <CollapsibleContent className='p-5'>
        <ColorPicker  style={{ width: '100%' }} value={ntask.color}  onChange={(colors) => {
                setTask((a)=> ({
                        ...a,
                        color: colors.hex
                    } as Task)
                );
            }
            }>
            <Preview />
            <Panel1 />
            <HueSlider />

        </ColorPicker>
    </CollapsibleContent>
</Collapsible>


<Text className='text-xl font-semibold'>Goal</Text>
<View className='flex flex-row gap-3 justify-evenly'>
    <View className='flex flex-col gap-2'>
        <Label nativeID='Units'>Amount</Label>
        <Input defaultValue={ntask.goal.amount.toString()} className='w-[80px]' placeholder='Amount' keyboardType='numeric' onChange={(b) => {
            setTask((a)=> ({
                ...a,
                goal: {
                    ...a.goal,
                    amount: parseInt(b.nativeEvent.text)
                }
            } as Task)
            );
        }} />
    </View>
    <View className='flex flex-col gap-2'>
        <Label nativeID='Units'>Units</Label>
        <Select nativeID='Units' defaultValue={{
            value: ntask.goal.unit,
            label: UNITS.find((a) => a.value == ntask.goal.unit)?.name ?? ntask.goal.unit!
        }} 
        value={ntask.goal!= null? {value: ntask.goal!.unit,label:UNITS.find((a) => a.value == ntask.goal!.unit)?.name ?? ntask.goal.unit!} : undefined}
        onValueChange={(b)=> setTask(
            (a)=> ({
                ...a,
                goal: {
                    ...a.goal,
                    unit: b?.value ?? "count"
                }
            } as Task)
        
        )} >
            <SelectTrigger className='w-24'>
                <SelectValue
                className='text-foreground text-sm native:text-lg'
                placeholder='Select a unit'
                />
            </SelectTrigger>
            <SelectContent  className='w-24'>
                <SelectGroup>
            
                {Array.from(UNITS,(a)=>{
                    return <SelectItem label={a.name} value={a.value}>
                        {a.name}
                    </SelectItem>
                })}
                </SelectGroup>
                
            </SelectContent>
        </Select>

        {ntask.goal?.unit == "custom"&& <Input placeholder='Custom Unit' onChange={(a) => {
           setTask((b)=> ({
                ...b,
                goal: {
                ...b.goal,
                customName: a.nativeEvent.text
        }
        } as Task)
        );
        }} />}
    </View>
    <View className='flex flex-col gap-2'>
        <Label nativeID='steps'>Steps</Label>
        <Input defaultValue={ntask.goal.steps.toString()} className='w-24' nativeID='steps' placeholder='Steps' keyboardType='numeric' onChange={(a) => {
            let n = parseInt(a.nativeEvent.text);
            if (!Number.isNaN(n)){
                setTask((b)=> ({
                    ...b,
                    goal: {
                        ...b.goal,
                        steps: n
                    }
                } as Task));
            }
        }} />
    </View>
</View>

<Collapsible defaultOpen>
    <CollapsibleTrigger asChild>
        <Text className='text-xl font-semibold'>Preview</Text>
    </CollapsibleTrigger>
    <CollapsibleContent>
    <TaskCard 
        task={
            ntask
        }
        completed={undefined}
        completable={true}
        streak={0}
        onCardPress={()=>{}}
        onCompletePress={()=>{}}
        onCompleteLongPress={()=>{}}
    
    />
    </CollapsibleContent>
</Collapsible>




<Button onPress={()=> {
    if (!ValidateForm() ){
        return;
    }
    onSubmit(ntask);
    
}}>
    <Text>{submitLabel}</Text>
</Button>
{
    onDelete && <Button variant={'destructive'} onPress={onDelete}>
        <Text>Delete</Text>
    </Button>
}
</View>
</ScrollView>

}