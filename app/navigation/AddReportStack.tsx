import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AddReportDetails from "../screens/secondary/report/AddReport_One";
import EvidenceScreen from "../screens/secondary/report/AddReport_Three";
import SuspectDetail from "../screens/secondary/report/AddReport_Two";
import SummaryScreen from "../screens/secondary/report/SummaryScreen";

const Stack = createNativeStackNavigator();

function AddReportStack() {
  return (
    <Stack.Navigator initialRouteName="Step 1">
      <Stack.Screen name="Step 1" component={AddReportDetails} />
      <Stack.Screen name="Step 2" component={SuspectDetail} />
      <Stack.Screen name="Step 3" component={EvidenceScreen} />
      <Stack.Screen name="SummaryScreen" component={SummaryScreen} />
    </Stack.Navigator>
  );
}

export default AddReportStack;
