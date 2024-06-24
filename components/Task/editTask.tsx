import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { CALENDAR, Task } from "~/lib/states/task";
import { EditTaskScreen } from "../AddTask/AddTasks";
import { useRealm } from "@realm/react";
import { UpdateMode } from "realm";

export default function EditTask({task}:{task: Task}){
    const realm = useRealm();
    return <EditTaskScreen submitLabel="Save" onSubmit={(task)=>{
        realm.write(() => {
            realm.create(Task,task,UpdateMode.Modified);
        });
    }} task={task} />
}