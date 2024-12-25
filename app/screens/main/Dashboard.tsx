import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import Carousel from "react-native-reanimated-carousel";
import { LineChart, BarChart } from "react-native-gifted-charts";
import { supabase } from "../../../lib/supabase";
import { useProfile } from "../../../providers/ProfileContext";

const { width } = Dimensions.get("window");

const barData = [
  { value: 15, label: "Jan" },
  { value: 30, label: "Feb" },
  { value: 26, label: "Mar" },
  { value: 40, label: "Apr" },
];

const Dashboard = ({ navigation }) => {
  const [pendingReportsData, setPendingReportsData] = useState([]);
  const [createdBy, setCreatedBy] = useState(null);
  const [completedCases, setCompletedCasesData] = useState([]);
  const [reportedCases, setReportedCasesData] = useState([]);

  const { session } = useProfile();

  // Fetch Officer ID based on the current session email
  const fetchOfficerId = async () => {
    try {
      if (session?.user?.email) {
        const { data, error } = await supabase
          .from("officers")
          .select("id")
          .eq("email", session.user.email)
          .single();

        if (error) {
          console.error("Error fetching officer ID:", error);
        } else {
          setCreatedBy(data.id);
        }
      }
    } catch (error) {
      console.error("Error during officer ID retrieval:", error);
    }
  };

  // Fetch pending reports based on officer ID
  const fetchPendingReports = async () => {
    if (!createdBy) return;
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("created_by", createdBy)
        .eq("status", "pending");

      if (error) {
        console.error("Error fetching pending reports:", error);
      } else {
        setPendingReportsData(data);
      }
    } catch (error) {
      console.error("Error fetching pending reports:", error);
    }
  };

  const fetchCompletedCases = async () => {
    if (!createdBy) return;
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("incident_date, count(*)")
        .eq("status", "completed")
        .eq("created_by", createdBy)
        .group("incident_date")
        .order("incident_date", { ascending: true });

      if (error) {
        console.error("Error fetching completed cases:", error);
      } else {
        // Process the data into the desired format for the first array
        const completedCasesData = data.map((item) => ({
          label: item.incident_date.toLocaleString("default", {
            month: "short",
            year: "numeric",
          }),
          value: item.count,
        }));
        setCompletedCasesData(completedCasesData);
      }
    } catch (error) {
      console.error("Error fetching completed cases:", error);
    }
  };

  const fetchReportedCases = async () => {
    if (!createdBy) return;
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("created_at, count(*)")
        .eq("created_by", createdBy)
        .group("created_at")
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching reported cases:", error);
      } else {
        // Process the data into the desired format for the second array
        const reportedCasesData = data.map((item) => ({
          label: item.created_at.toLocaleString("default", {
            month: "short",
            year: "numeric",
          }),
          value: item.count,
        }));
        setReportedCasesData(reportedCasesData);
      }
    } catch (error) {
      console.error("Error fetching reported cases:", error);
    }
  };

  useEffect(() => {
    fetchOfficerId();
  }, []);

  useEffect(() => {
    if (createdBy) {
      fetchPendingReports();
      fetchCompletedCases();
      fetchPendingReports();
    }
  }, [createdBy]);

  return (
    <LinearGradient colors={["#1a5f7a", "#16213e"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeHeader}>
            <View>
              <Text style={styles.welcomeText}>Welcome Back, Officer</Text>
              <Text style={styles.subWelcomeText}>Dashboard Overview</Text>
            </View>
            <MaterialIcons name="local-police" size={40} color="#6dbf44" />
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("Add Report")}
            >
              <Feather name="plus-circle" size={20} color="white" />
              <Text style={styles.actionButtonText}>Add Report</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate("View Reports")}
            >
              <Feather name="file-text" size={20} color="white" />
              <Text style={styles.actionButtonText}>View Reports</Text>
            </TouchableOpacity>
          </View>

          {/* Pending Reports Carousel */}
          <View style={styles.pendingReportsContainer}>
            <Text style={styles.sectionTitle}>Pending Reports</Text>
            <Carousel
              data={pendingReportsData}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.pendingReportCard}
                  onPress={() =>
                    navigation.navigate("Report Details", { reportId: item.id })
                  }
                >
                  <View style={styles.pendingReportHeader}>
                    <Text style={styles.reportNumberText}>{item.id}</Text>
                  </View>
                  <Text style={styles.reportTitleText}>{item.title}</Text>
                  <View style={styles.reportDetailsContainer}>
                    <View style={styles.reportDetailItem}>
                      <Feather name="map-pin" size={16} color="#7f8c8d" />
                      <Text style={styles.reportDetailText}>
                        {item.location}
                      </Text>
                    </View>
                    <View style={styles.reportDetailItem}>
                      <Feather name="calendar" size={16} color="#7f8c8d" />
                      <Text style={styles.reportDetailText}>
                        {item.incident_date}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.reportStatusText}>{item.status}</Text>
                </TouchableOpacity>
              )}
              width={width - 40}
              height={250}
              loop={true}
              autoPlay={true}
              autoPlayInterval={5000}
              scrollAnimationDuration={1000}
              mode="parallax"
              modeConfig={{
                parallaxScrollingScale: 0.9,
                parallaxScrollingOffset: 50,
              }}
            />
          </View>
        </View>

        {/* Rest of the dashboard remains the same as in previous implementation */}
        {/* Charts Section */}
        <View style={styles.chartsContainer}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Case Progression</Text>
            <BarChart
              data={barData}
              width={width - 60}
              height={200}
              frontColor="#3498db"
              showVerticalLines
              verticalLinesColor="rgba(255,255,255,0.2)"
            />
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Incident Trends</Text>
            <LineChart
              data={barData}
              width={width - 60}
              height={200}
              color="#6dbf44"
              showVerticalLines
              verticalLinesColor="rgba(255,255,255,0.2)"
            />
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  welcomeSection: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  welcomeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  subWelcomeText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: "row",
    backgroundColor: "#3498db",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 10,
  },
  quickStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  quickActionCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    width: "30%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIconContainer: {
    backgroundColor: "#e6f2ff",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    color: "#7f8c8d",
    fontSize: 12,
    marginBottom: 5,
  },
  quickActionCount: {
    color: "#2c3e50",
    fontSize: 18,
    fontWeight: "bold",
  },
  chartsContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#3498db",
  },
  chartCard: {
    backgroundColor: "#f7f8fa",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    color: "#2c3e50",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  pendingReportsContainer: {
    marginVertical: 20,
  },
  pendingReportCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  pendingReportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  reportNumberText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  priorityBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  reportTitleText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
  },
  reportDetailsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  reportDetailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  reportDetailText: {
    marginLeft: 5,
    color: "#7f8c8d",
    fontSize: 14,
  },
  reportStatusText: {
    color: "#3498db",
    fontWeight: "600",
    textAlign: "right",
  },
});

export default Dashboard;
