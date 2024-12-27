import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Updates from "../screens/main/Updates";
import OtherReports from "../screens/secondary/OtherReports";

const Stack = createNativeStackNavigator();

const UpdateStack = () => {
  return (
    <Stack.Navigator initialRouteName="update">
      <Stack.Screen
        name="update"
        component={Updates}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Other Report"
        component={OtherReports}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default UpdateStack;
