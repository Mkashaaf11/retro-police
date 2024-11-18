import { View, Text } from "react-native";
import React from "react";

const SummaryScreen = ({ navigation, route }) => {
  const { suspectData } = route.params;
  const { evidenceData } = route.params;
  return (
    <View>
      <Text>{suspectData.name}</Text>
      <Text>{evidenceData.audioUri}</Text>
    </View>
  );
};

export default SummaryScreen;
