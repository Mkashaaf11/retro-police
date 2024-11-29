import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Login from "../screens/auth/Login";
import ProfileInfo from "../screens/auth/ProfileInfo";

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="ProfileInfo" component={ProfileInfo} />
    </Stack.Navigator>
  );
};

export default AuthStack;
