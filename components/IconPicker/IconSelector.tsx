import { useEffect, useRef, useState } from "react";
import { FlatList, Modal, Pressable, View } from "react-native";
import { Button } from "~/components/ui/button";
import { IconProp } from "~/lib/types";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { items, iconSets } from "./icon-sets";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import createFuzzySearch from "@nozbe/microfuzz";

export const fuzzySearch = createFuzzySearch(iconSets as IconProp[], {
  getText: (item) => [item?.name],
});

export function RenderIcon({
  icon,
  size,
  color,
}: {
  icon: IconProp;
  size: number;

  color?: string;
}) {
  const IconComp = items.filter((item) => item.name === icon.family)[0]
    .component as ({
    name,
    size,

    color,
  }: {
    name: string;
    size: number;

    color?: string;
  }) => JSX.Element;

  return <IconComp name={icon.name} size={size} color={color} />;
}

export default function IconSelector({
  icon,
  setIcon,
}: {
  icon: IconProp;
  setIcon: (a: IconProp) => void;
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState<string>("");
  const [filteredItems, setFilteredItems] = useState<IconProp[]>([]);
  useEffect(() => {
    let results = (
      search.length != 0 ? fuzzySearch(search).map((a) => a.item) : iconSets
    ) as IconProp[];

    setFilteredItems(results);
  }, [search]);

  return (
    <View>
      <Button
        variant={"outline"}
        size={"lg"}
        className={"  flex-row justify-start items-center"}
        onPress={() => {
          setModalVisible(true);
        }}
      >
        {icon != undefined && (
          <>
            <Text>{icon.name}</Text>
          </>
        )}
      </Button>
      <Modal visible={modalVisible} collapsable={true}>
        <SafeAreaProvider>
          <SafeAreaView>
            <View className=" h-full p-10">
              <View>
                <Input
                  onChangeText={(a) => {
                    setSearch(a);
                  }}
                />
              </View>
              <FlatList
                numColumns={5}
                data={filteredItems}
                renderItem={({ item }) => {
                  if (item === undefined) {
                    return null;
                  }
                  return (
                    <Pressable
                      className="p-5"
                      onPress={() => {
                        setIcon(item);
                        setModalVisible(false);
                      }}
                    >
                      <RenderIcon icon={item} size={30} />
                    </Pressable>
                  );
                }}
              />
              <Button
                onPress={() => {
                  setModalVisible(false);
                }}
              >
                <Text>Close</Text>
              </Button>
            </View>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </View>
  );
}
