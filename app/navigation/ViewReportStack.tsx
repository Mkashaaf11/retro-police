import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ViewReport from "../screens/secondary/report/ViewReport";
import ReportDetail from "../screens/secondary/ReportDetail";

const Stack = createNativeStackNavigator();

function ViewReportStack() {
  return (
    <Stack.Navigator initialRouteName="All Report">
      <Stack.Screen name="All Report" component={ViewReport} />
      <Stack.Screen name="Report Detail" component={ReportDetail} />
    </Stack.Navigator>
  );
}

export default ViewReportStack;
