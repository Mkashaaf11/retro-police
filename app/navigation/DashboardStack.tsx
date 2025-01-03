import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Dashboard from "../screens/main/Dashboard";
import AddReportStack from "./AddReportStack";
import ViewReportStack from "./ViewReportStack";

const Stack = createNativeStackNavigator();

const DashboardStack = () => {
  return (
    <Stack.Navigator initialRouteName="Dashboard">
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen
        name="Add Report"
        component={AddReportStack}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="View Report"
        component={ViewReportStack}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default DashboardStack;
