import { BottomSheetHandle, BottomSheetHandleProps } from "@gorhom/bottom-sheet";
import { PanGestureHandler } from "react-native-gesture-handler";
import { View } from "../primitives/slot";
import {Text} from "../ui/text";
import { Button } from "../ui/button";

interface HandleProps extends BottomSheetHandleProps {
    title?: String,
    onPress?:()=> void
}

export const Handle: React.FC<HandleProps> = (props) => {
    const {title,onPress} = props;
    return <BottomSheetHandle     {...props} >
        {/* <Button className="h-min" size={"sm"} onPress={onPress} variant={"link"}><Text>{title}</Text></Button> */}

        </BottomSheetHandle>


}