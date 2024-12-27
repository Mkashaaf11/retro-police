import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import DashboardStack from "./DashboardStack";
import UpdateStack from "./UpdateStack";
import Profile from "../screens/main/Profile";
import NearbyPoliceStations from "../screens/main/NearbyPoliceStations";
import { TabParamList } from "../../types";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator<TabParamList>();

const TabNav = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={DashboardStack}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Updates"
        component={UpdateStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="update" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Nearby"
        component={NearbyPoliceStations}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="location-sharp" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNav;
