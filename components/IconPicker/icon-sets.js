import { pipe, toPairs, groupBy, map } from "ramda";
import AntD from "react-native-vector-icons/AntDesign";
import Entypo from "react-native-vector-icons/Entypo";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import Feather from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Fontisto from "react-native-vector-icons/Fontisto";
import Foundation from "react-native-vector-icons/Foundation";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Octicons from "react-native-vector-icons/Octicons";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import Zocial from "react-native-vector-icons/Zocial";
import AntDGlyphs from "react-native-vector-icons/glyphmaps/AntDesign.json";
import EntypoGlyphs from "react-native-vector-icons/glyphmaps/Entypo.json";
import EvilIconsGlyphs from "react-native-vector-icons/glyphmaps/EvilIcons.json";
import FeatherGlyphs from "react-native-vector-icons/glyphmaps/Feather.json";
import FontAwesomeGlyphs from "react-native-vector-icons/glyphmaps/FontAwesome.json";
import FontAwesome5Glyphs from "react-native-vector-icons/glyphmaps/FontAwesome5Free.json";
import FontistoGlyphs from "react-native-vector-icons/glyphmaps/Fontisto.json";
import FoundationGlyphs from "react-native-vector-icons/glyphmaps/Foundation.json";
import IoniconsGlyphs from "react-native-vector-icons/glyphmaps/Ionicons.json";
import MaterialIconsGlyphs from "react-native-vector-icons/glyphmaps/MaterialIcons.json";
import MaterialCommunityIconsGlyphs from "react-native-vector-icons/glyphmaps/MaterialCommunityIcons.json";
import OcticonsGlyphs from "react-native-vector-icons/glyphmaps/Octicons.json";
import SimpleLineIconsGlyphs from "react-native-vector-icons/glyphmaps/SimpleLineIcons.json";
import ZocialGlyphs from "react-native-vector-icons/glyphmaps/Zocial.json";
import createFuzzySearch from "@nozbe/microfuzz";

const GLYPH_MAPS = {
  AntD: AntDGlyphs,
  Entypo: EntypoGlyphs,
  EvilIcons: EvilIconsGlyphs,
  Feather: FeatherGlyphs,
  FontAwesome: FontAwesomeGlyphs,
  FontAwesome5: FontAwesome5Glyphs,
  Fontisto: FontistoGlyphs,
  Foundation: FoundationGlyphs,
  Ionicons: IoniconsGlyphs,
  MaterialIcons: MaterialIconsGlyphs,
  MaterialCommunityIcons: MaterialCommunityIconsGlyphs,
  Octicons: OcticonsGlyphs,
  SimpleLineIcons: SimpleLineIconsGlyphs,
  Zocial: ZocialGlyphs,
};

const ICON_SETS = {
  // AntD,
  Entypo,
  EvilIcons,
  Feather,
  FontAwesome,
  FontAwesome5,
  Fontisto,
  // Foundation,
  // Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
  // Octicons,
  // SimpleLineIcons,
  // Zocial,
};

const groupGlyphNames = (glyphMap) =>
  Object.values(groupBy((name) => glyphMap[name])(Object.keys(glyphMap)));

const transformIconSets = pipe(
  toPairs,
  map(([name, component]) => ({
    name,
    component,
    glyphNames: groupGlyphNames(GLYPH_MAPS[name]),
  }))
);

export const items = transformIconSets(ICON_SETS);

export const iconSets = items.flatMap((item) => {
  return item.glyphNames.map((glyphName) => {
    return {
      family: item.name,
      name: glyphName[0],
    };
  });
});
