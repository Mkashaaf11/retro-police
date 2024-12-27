import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { supabase } from "../../../../lib/supabase";
import { useProfile } from "../../../../providers/ProfileContext";

const GOOGLE_MAPS_API_KEY = "AIzaSyA3FzKFHiA7bUcmOaubinG6wqCZt8Dw7Yk";
const ViewReport = ({ navigation }) => {
  const { session } = useProfile();
  const [activeTab, setActiveTab] = useState("pending");
  const [createdBy, setCreatedBy] = useState(null);
  const [pendingReports, setPendingReports] = useState([]);
  const [completedReports, setCompletedReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Officer ID based on session email
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

  // Fetch reports based on status
  const fetchReports = async (status) => {
    if (!createdBy) return [];
    try {
      const { data, error } = await supabase
        .from("reports")
        .select(` *, officers ( name ) `)
        .eq("created_by", createdBy)
        .eq("status", status);

      if (error) {
        console.error(`Error fetching ${status} reports:`, error);
        return [];
      } else {
        return data;
      }
    } catch (error) {
      console.error(`Error fetching ${status} reports:`, error);
      return [];
    }
  };

  // Convert location to address
  const getPlaceName = async (location) => {
    try {
      if (!location) {
        console.error("Location is undefined or null");
        return "Unknown location";
      }

      // Parse the location string to extract latitude and longitude
      const matches = location.match(/Lat:\s*([\d.-]+),\s*Lon:\s*([\d.-]+)/);
      if (!matches) {
        console.error("Invalid location format:", location);
        return "Unknown location";
      }

      const [_, latitude, longitude] = matches;

      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );

      if (response.data.status === "OK") {
        return (
          response.data.results[0]?.formatted_address || "Unknown location"
        );
      } else {
        console.error("Error fetching place name:", response.data.status);
        return "Unknown location";
      }
    } catch (error) {
      console.error("Error fetching place name:", error);
      return "Unknown location";
    }
  };

  // Fetch and update reports with location addresses
  const updateReportsWithAddresses = async (reports) => {
    if (!reports) return [];
    try {
      const updatedReports = await Promise.all(
        reports.map(async (report) => {
          try {
            const address = await getPlaceName(report.location);
            return { ...report, address };
          } catch (error) {
            console.error(
              "Error fetching address for report:",
              report.id,
              error
            );
            return { ...report, address: "Unknown location" };
          }
        })
      );
      return updatedReports;
    } catch (error) {
      console.error("Error updating reports with addresses:", error);
      return reports;
    }
  };

  // Mark report as completed
  const markAsCompleted = async (reportId) => {
    try {
      const { error } = await supabase
        .from("reports")
        .update({ status: "completed" })
        .eq("id", reportId);

      if (error) {
        console.error("Error updating report status:", error);
      } else {
        fetchReports("pending").then((data) =>
          updateReportsWithAddresses(data).then(setPendingReports)
        );
        fetchReports("completed").then((data) =>
          updateReportsWithAddresses(data).then(setCompletedReports)
        );
      }
    } catch (error) {
      console.error("Error updating report status:", error);
    }
  };

  useEffect(() => {
    fetchOfficerId();
  }, [session]);

  useEffect(() => {
    if (createdBy) {
      fetchReports("pending").then((data) =>
        updateReportsWithAddresses(data).then(setPendingReports)
      );
      fetchReports("completed").then((data) =>
        updateReportsWithAddresses(data).then(setCompletedReports)
      );
      setLoading(false);
    }
  }, [createdBy]);

  const ReportCard = ({ report, showCompleteButton, navigation }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("Report Detail", { reportId: report.id })
      } // Navigate and pass the report ID
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardTitle}>{report.title}</Text>
          <Text style={styles.officerName}>
            Reported by: {report.officers?.name}
          </Text>
        </View>
        {showCompleteButton && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => markAsCompleted(report.id)}
          >
            <Text style={styles.completeButtonText}>Complete</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.description}>{report.description}</Text>
        <Text style={styles.detail}>
          Date: {new Date(report.incident_date).toLocaleDateString()}
        </Text>
        <Text style={styles.detail}>Location: {report.address}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "pending" && styles.activeTab]}
          onPress={() => setActiveTab("pending")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "pending" && styles.activeTabText,
            ]}
          >
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "completed" && styles.activeTab]}
          onPress={() => setActiveTab("completed")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "completed" && styles.activeTabText,
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView}>
        {activeTab === "pending" ? (
          pendingReports.length > 0 ? (
            pendingReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                showCompleteButton={true}
                navigation={navigation}
              />
            ))
          ) : (
            <Text style={styles.noReports}>No pending reports</Text>
          )
        ) : completedReports.length > 0 ? (
          completedReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              showCompleteButton={false}
              navigation={navigation}
            />
          ))
        ) : (
          <Text style={styles.noReports}>No completed reports</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    marginTop: 40,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: "#007AFF",
  },
  tabText: {
    fontSize: 16,
    color: "#007AFF",
  },
  activeTabText: {
    color: "#fff",
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  officerName: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  cardContent: {
    gap: 8,
  },
  description: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  detail: {
    fontSize: 14,
    color: "#666",
  },
  completeButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  noReports: {
    textAlign: "center",
    fontSize: 16,
    color: "#666",
    marginTop: 24,
  },
});

export default ViewReport;
