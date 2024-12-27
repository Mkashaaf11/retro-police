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

type PendingReport = {
  id: number;
  title: string;
  description: string;
  incident_date: string;
  status: string;
};

const Dashboard = ({ navigation }) => {
  const [pendingReportsData, setPendingReportsData] = useState<any>([]);
  const [createdBy, setCreatedBy] = useState<any>(null);
  const [completedCases, setCompletedCasesData] = useState<any>([]);
  const [reportedCases, setReportedCasesData] = useState<any>([]);

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
      const oneYearAgo = new Date();
      oneYearAgo.setMonth(oneYearAgo.getMonth() - 11);
      const startDate = `${oneYearAgo.getFullYear()}-${String(
        oneYearAgo.getMonth() + 1
      ).padStart(2, "0")}-01`;

      const { data, error } = await supabase.rpc("get_completed_cases", {
        created_by_id: createdBy,
        start_date: startDate,
      });

      if (error) {
        console.error("Error fetching completed cases:", error);
      } else {
        const completedCasesData = data.map((item) => ({
          label: `${new Date(item.year, item.month - 1).toLocaleString(
            "default",
            {
              month: "short",
              year: "numeric",
            }
          )}`,
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
      const oneYearAgo = new Date();
      oneYearAgo.setMonth(oneYearAgo.getMonth() - 11);
      const startDate = `${oneYearAgo.getFullYear()}-${String(
        oneYearAgo.getMonth() + 1
      ).padStart(2, "0")}-01`;

      const { data, error } = await supabase.rpc("get_reported_cases", {
        created_by_id: createdBy,
        start_date: startDate,
      });

      if (error) {
        console.error("Error fetching reported cases:", error);
      } else {
        const reportedCasesData = data.map((item) => ({
          label: `${new Date(item.year, item.month - 1).toLocaleString(
            "default",
            {
              month: "short",
              year: "numeric",
            }
          )}`,
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
      fetchReportedCases();
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
              onPress={() => navigation.navigate("View Report")}
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
              renderItem={({ item }: { item: PendingReport }) => (
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
                      <Feather name="file-text" size={16} color="#7f8c8d" />
                      <Text style={styles.reportDetailText}>
                        {item.description}
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
              data={completedCases}
              width={width - 80}
              height={200}
              frontColor="#3498db"
              gradientColor="#ecf0f1"
              showVerticalLines
              verticalLinesColor="rgba(52, 152, 219, 0.1)"
              spacing={40}
              hideRules
              xAxisColor="rgba(44, 62, 80, 0.3)"
              yAxisColor="rgba(44, 62, 80, 0.3)"
              yAxisTextStyle={styles.chartAxisText}
              xAxisLabelTextStyle={styles.chartAxisText}
              noOfSections={5}
              maxValue={50}
              labelWidth={60}
            />
          </View>

          <View style={[styles.chartCard, styles.lastChartCard]}>
            <Text style={styles.chartTitle}>Incident Trends</Text>
            <LineChart
              data={reportedCases}
              width={width - 80}
              height={200}
              color="#6dbf44"
              showVerticalLines
              verticalLinesColor="rgba(109, 191, 68, 0.1)"
              spacing={40}
              hideRules
              xAxisColor="rgba(44, 62, 80, 0.3)"
              yAxisColor="rgba(44, 62, 80, 0.3)"
              yAxisTextStyle={styles.chartAxisText}
              xAxisLabelTextStyle={styles.chartAxisText}
              noOfSections={5}
              maxValue={50}
              curved
            />
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  // Main Container for the Scroll View
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20, // Prevent overlap with last element
  },
  welcomeSection: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  welcomeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  welcomeText: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subWelcomeText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 16,
  },
  quickActionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#3498db",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 10,
    fontSize: 16,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 24,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "rgba(255,255,255,0.3)",
    textAlign: "center", // Center-align the text
  },
  pendingReportCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 4,
    height: 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    overflow: "hidden", // Ensure content stays within rounded edges
    marginBottom: 8,
  },
  pendingReportsContainer: {
    marginVertical: 20,
    marginHorizontal: 20,
    paddingBottom: 20, // Ensure enough space for the card
    overflow: "visible", // Prevent clipping of child elements
  },
  pendingReportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  reportNumberText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  reportTitleText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 16,
    lineHeight: 28,
  },
  reportDetailsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  reportDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  reportDetailText: {
    marginLeft: 8,
    color: "#7f8c8d",
    fontSize: 15,
    flex: 1,
  },
  reportStatusText: {
    color: "#3498db",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "right",
    position: "absolute",
    bottom: 24,
    right: 24,
  },
  chartsContainer: {
    marginHorizontal: 20, // Adds spacing on left and right
    marginTop: 30, // Adds spacing above the charts section
    paddingVertical: 20, // Padding within the container
    borderRadius: 16, // Smooth rounded edges
    backgroundColor: "rgba(255,255,255,0.1)", // Subtle background for the section
    shadowColor: "#000", // Shadow for depth
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android-specific shadow depth
  },

  chartsSection: {
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 20,
    paddingVertical: 20,
    paddingHorizontal: 10,
    flex: 1,
  },
  chartCard: {
    margin: 20,
    marginBottom: 0,
    backgroundColor: "#f7f8fa",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  lastChartCard: {
    marginBottom: 20,
  },
  chartTitle: {
    color: "#2c3e50",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  },
  metricsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
    margin: 20,
    marginBottom: 0,
  },
  chartAxisText: {
    color: "#7f8c8d",
    fontSize: 12,
    fontWeight: "500",
  },
  chartLegend: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    color: "#7f8c8d",
    fontSize: 12,
    fontWeight: "500",
  },
});

export default Dashboard;
