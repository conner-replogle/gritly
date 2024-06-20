import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Task } from "~/lib/states/task";
import { CALENDAR } from "../AddTask/AddTasks";

export default function EditTask({task}:{task: Task}){
    return <View className="p-5">

        <Text className="text-2xl">You  
            <Text className="font-semibold text-2xl"> {task.title} </Text> 
            every 
            <Text className="font-semibold text-2xl"> {task.repeats.specfic_weekday?.map((a)=> CALENDAR[a]).join(",")} </Text>  
            for 
            <Text className="font-semibold text-2xl"> {task.goal.amount} {task.goal.unit} </Text>
            in 
            <Text className="font-semibold text-2xl"> {task.goal.steps} </Text>
            steps.
            </Text>
    </View>
}