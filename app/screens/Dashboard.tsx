import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Button,
  TouchableOpacity,
  ImageBackground,
} from "react-native";

import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Carousel from "react-native-reanimated-carousel";
import { LineChart } from "react-native-gifted-charts";
import { BarChart } from "react-native-gifted-charts";

const dummyData = [
  { id: 1, title: "Title 1" },
  { id: 2, title: "Title 2" },
  { id: 3, title: "Title 3" },
  { id: 4, title: "Title 4" },
  { id: 5, title: "Title 5" },
];
const barData = [{ value: 15 }, { value: 30 }, { value: 26 }, { value: 40 }];

const Dashboard = () => {
  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.welcomeMainContainer}>
          <LinearGradient colors={["#42275a", "#734b6d"]}>
            <View style={styles.welcomeInnerContainer}>
              <View style={styles.welcomeTextBox}>
                <Text style={styles.welcomeText}>Welcome Back Officer</Text>
                <MaterialIcons
                  name="local-police"
                  size={24}
                  color="#6dbf44"
                  style={styles.textIcon}
                />
              </View>
              <View style={styles.mainButtonBox}>
                <TouchableOpacity style={styles.mainButtons}>
                  <Text>Add Report</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.mainButtons}>
                  <Text>Add suspect</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>
        <View style={styles.carouselContainer}>
          <Carousel
            data={dummyData}
            renderItem={({ item }) => (
              <View style={styles.carouselItem}>
                <Text>{item.id}</Text>
                <Text>{item.title}</Text>
              </View>
            )}
            width={300}
            height={200}
            loop={true}
            autoPlay={true}
            vertical={false}
          />
        </View>
        <View style={styles.ImgContainer}>
          <ImageBackground
            source={require("../../assets/dashboard1.jpg")}
            style={styles.imageBackground}
          >
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.viewReportButton}>
                <Text>View Report</Text>
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>
        <View style={styles.graphContainer}>
          <Text>My Bar Chart</Text>
          <BarChart data={barData} />
          <Text>My Line Chart</Text>
          <LineChart data={barData} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#f7f7f7",
  },
  welcomeMainContainer: {
    borderRadius: 10,
    borderColor: "black",
    borderWidth: 1,
    margin: 10,
    marginTop: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.5,
  },

  welcomeInnerContainer: {
    margin: 15,
    padding: 20,
  },
  welcomeTextBox: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  mainButtonBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textIcon: {
    marginLeft: 5,
  },
  mainButtons: {
    backgroundColor: "#6dbf44",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 5,
  },
  carouselContainer: {
    marginVertical: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  carouselItem: {
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  ImgContainer: {
    height: 200,
    borderRadius: 10,
    overflow: "hidden",
    marginVertical: 10,
    marginHorizontal: 10,
  },
  imageBackground: {
    flex: 1,
    justifyContent: "flex-end",
  },
  buttonContainer: {
    alignItems: "center",
    paddingBottom: 10,
  },
  viewReportButton: {
    backgroundColor: "#6dbf44",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  graphContainer: {
    marginVertical: 10,
    marginHorizontal: 10,
  },
});

export default Dashboard;
