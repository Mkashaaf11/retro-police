import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DashboardStack from "./DashboardStack";
import Updates from "../screens/main/Updates";
import Profile from "../screens/main/Profile";

const Tab = createBottomTabNavigator();

const TabNav = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={DashboardStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Updates" component={Updates} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default TabNav;
