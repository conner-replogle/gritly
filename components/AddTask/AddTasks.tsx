import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plus } from 'lucide-react-native';
import { LayoutAnimation, Modal, NativeSyntheticEvent, Pressable, SafeAreaView, TextInput, TextInputFocusEventData, TextInputProps, View } from 'react-native';
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
import { Repeat, Task } from '~/lib/states/task';
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

    const [isSimple,setIsSimple] = useState(true);
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
            onAnimate={(_, index) => {
                console.log(index)
                if (index != -1)
                    setIndex(index);
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                if (index == 0){
                    setIsSimple(true);
                }
            }}
        
            backgroundStyle={{
                backgroundColor: colors.background
            }}
            >
            <BottomSheetView >
                <AddTasksScreen isSimple={isSimple} setIsSimple={setIsSimple} />
            </BottomSheetView>
        </BottomSheetModal>
   
    );
}

function AddTasksScreen (props:{isSimple:boolean, setIsSimple:React.Dispatch<React.SetStateAction<boolean>>}){
    const {isSimple, setIsSimple} = props;
    const realm = useRealm();
    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [tasktype, setTaskType] = useState<"Daily" | "Weekly"|string>('Daily');
    const [days, setDays] = useState<number[]>([0,1,2,3,4,5,6]);
    function ValidateForm(){
        return title.length > 0;
    }
    function onLabelPress(label: string) {
        return () => {
            setTaskType(label);
        };
    }
    function onDayPress(nDays: string[]) {
    
        console.log(nDays);
        const parsedDays = nDays.map((a) => parseInt(a));
        console.log(parsedDays);
        setDays(parsedDays);
    }
    if (isSimple){
        return (
            <View className='bg-background  p-5 pt-0 flex flex-col gap-4'>
                <Text className='text-xl'>Create a quick one time task.</Text>
                <Label className='text-xl' nativeID='title'>Title</Label>
                <BottomSheetInput
                    placeholder='Name your task'
                    nativeID='title'
                    value={title}
                    onChangeText={setTitle}
                    aria-labelledbyledBy='inputLabel'
                    aria-errormessage='inputError'
                    
                />
                <Button onPress={()=> {
                    if (!ValidateForm() ){
                        return;
                    }
                    realm.write(() => {
                        realm.create("Task", Task.generate(title, "",{
                            period: "one-time",
                        } as Repeat));
                    });
                    setTitle("");
                    setDescription("");
        
                    
                }}>
                    <Text>Create</Text>
                </Button>
                    
            </View>
        )
    }
    return <View className='bg-background h-screen  p-5 pt-0 flex flex-col gap-4'>
    <Text className='text-xl'>Add a Task</Text>
    <Label nativeID='title'>Title</Label>
    <BottomSheetInput
        placeholder='Name your task'
        nativeID='title'
        value={title}
        onChangeText={setTitle}
        aria-labelledbyledBy='inputLabel'
        aria-errormessage='inputError'
    />
    <Label nativeID='description'>Description</Label>
    <Input
        placeholder='What exactly is this task?'
        nativeID='description'
        value={description}
        onChangeText={setDescription}
        aria-labelledbyledBy='inputLabel'
        aria-errormessage='inputError'
    />
    <Label nativeID='type'>Type</Label>
    <RadioGroup value={tasktype} onValueChange={(a) => setTaskType(a)} className='gap-3'>
        <RadioGroupItemWithLabel onLabelPress={onLabelPress("Daily")} value='Daily' />
        <RadioGroupItemWithLabel onLabelPress={onLabelPress("Weekly")} value='Weekly' />
    </RadioGroup>
    {
        tasktype === "Daily" &&
        <ToggleGroup value={days.map((a) => a.toString())} onValueChange={onDayPress} type='multiple'>
            {Array.from(["S","M","T","W","Th","F","Sa"], (a, i) => (
                <ToggleGroupItem key={a} value={i.toString()}>
                    <Text  className='w-[20px] text-center'>{a}</Text>
                </ToggleGroupItem>
            ))}
        </ToggleGroup>
    }

    <Button onPress={()=> {
        if (!ValidateForm() ){
            return;
        }
        realm.write(() => {
            realm.create("Task", Task.generate(title, description,{
                period: tasktype,
                specfic_weekday: days
            } as Repeat));
        });
        setTitle("");
        setDescription("");

        
    }}>
        <Text>OK</Text>
    </Button>
    </View>
}

const BottomSheetInput = forwardRef<
    TextInput,
    BottomSheetTextInputProps
>(({ onFocus, onBlur, ...rest }, ref) => {
  //#region hooks
    const { shouldHandleKeyboardEvents } = useBottomSheetInternal();

    useEffect(() => {
        return () => {
        // Reset the flag on unmount
        shouldHandleKeyboardEvents.value = false;
        };
    }, [shouldHandleKeyboardEvents]);
    //#endregion

    //#region callbacks
    const handleOnFocus = useCallback(
        (args: NativeSyntheticEvent<TextInputFocusEventData>) => {
            shouldHandleKeyboardEvents.value = true;
            if (onFocus) {
                onFocus(args);
            }
        },
        [onFocus, shouldHandleKeyboardEvents]
    );
    const handleOnBlur = useCallback(
        (args: NativeSyntheticEvent<TextInputFocusEventData>) => {
            shouldHandleKeyboardEvents.value = false;
            if (onBlur) {
                onBlur(args);
            }
        },
        [onBlur, shouldHandleKeyboardEvents]
    );
    //#endregion

    return (
        <Input
        ref={ref}
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
        {...rest}
        />
    );
});