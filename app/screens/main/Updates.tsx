import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { supabase } from "../../../lib/supabase";
import { useProfile } from "../../../providers/ProfileContext";
import axios from "axios";

const { width } = Dimensions.get("window");
const GOOGLE_MAPS_API_KEY = "AIzaSyA3FzKFHiA7bUcmOaubinG6wqCZt8Dw7Yk";

const Updates = ({ navigation }) => {
  const { session } = useProfile();
  const [data, setData] = useState<any>([]);
  const [originalData, setOriginalData] = useState<any>([]);
  const [searchText, setSearchText] = useState("");
  const [officerDetails, setOfficerDetails] = useState({});
  const [createdBy, setCreatedBy] = useState(null);

  // Fetch Officer ID based on the current session email
  const fetchOfficerId = async () => {
    try {
      if (session?.user?.email) {
        const { data, error } = await supabase
          .from("officers")
          .select("id, contact, name")
          .eq("email", session.user.email)
          .single();

        if (error) {
          console.error("Error fetching officer ID:", error);
        } else {
          setCreatedBy(data.id);
          setOfficerDetails(data);
        }
      }
    } catch (error) {
      console.error("Error during officer ID retrieval:", error);
    }
  };

  const parseCoordinates = (location) => {
    const matches = location.match(/Lat:\s*([\d.-]+),\s*Lon:\s*([\d.-]+)/);
    if (!matches) return null;
    return { latitude: matches[1], longitude: matches[2] };
  };

  const fetchPlaceName = async (latitude, longitude) => {
    try {
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

  const enhanceReportsWithLocation = async (reports) => {
    try {
      const enhancedReports = await Promise.all(
        reports.map(async (report) => {
          if (!report.location) {
            return { ...report, address: "Unknown location" };
          }

          const coordinates = parseCoordinates(report.location);
          if (coordinates) {
            const address = await fetchPlaceName(
              coordinates.latitude,
              coordinates.longitude
            );
            return { ...report, address };
          } else {
            return { ...report, address: "Unknown location" };
          }
        })
      );
      return enhancedReports;
    } catch (error) {
      console.error("Error enhancing reports with location:", error);
      return reports;
    }
  };

  useEffect(() => {
    fetchOfficerId();
  }, []);

  useEffect(() => {
    const fetchReports = async () => {
      if (!createdBy) return;
      try {
        const { data: reports, error } = await supabase
          .from("reports")
          .select("*, officer:created_by(name, contact), evidence(file_url)")
          .eq("status", "pending")
          .neq("created_by", createdBy)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching reports:", error);
        } else {
          const enhancedReports = await enhanceReportsWithLocation(reports);
          setOriginalData(enhancedReports); // Store original data
          setData(enhancedReports); // Set filtered data as well
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, [createdBy]);

  const handleSearch = (text) => {
    setSearchText(text);
    if (text === "") {
      setData(originalData); // Reset data to original unfiltered data
    } else {
      const filteredData = originalData.filter(
        (item) =>
          item.description.toLowerCase().includes(text.toLowerCase()) ||
          item.address.toLowerCase().includes(text.toLowerCase()) || // Search by address
          item.officer.name.toLowerCase().includes(text.toLowerCase()) ||
          item.officer.contact.toLowerCase().includes(text.toLowerCase())
      );
      setData(filteredData);
    }
  };

  const handleReportPress = (reportId) => {
    navigation.navigate("Other Report", { reportId });
  };

  const renderCard = ({ item }) => (
    <View style={styles.reportCard}>
      {/* Header Section */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="person" size={24} color="#333" />
          <View>
            <Text style={styles.officerName}>{item.officer.name}</Text>
            <Text style={styles.reportLocation}>
              {item.address || item.location}
            </Text>
            {item.officer.contact && (
              <Text style={styles.officerContact}>
                Contact: {item.officer.contact}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Image Section - First Image Evidence */}
      {item.evidence && item.evidence.length > 0 && (
        <Image
          style={styles.reportImage}
          source={{ uri: item.evidence[0].file_url }}
          resizeMode="cover"
        />
      )}

      {/* Description Section */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionText} numberOfLines={3}>
          {item.description}
        </Text>

        <View style={styles.metadataContainer}>
          <View style={styles.metadataItem}>
            <MaterialIcons name="calendar-today" size={16} color="#666" />
            <Text style={styles.metadataText}>{item.date}</Text>
          </View>
        </View>
      </View>

      {/* View more details */}
      <TouchableOpacity
        style={styles.viewMoreButton}
        onPress={() => handleReportPress(item.id)}
      >
        <Text style={styles.viewMoreText}>View Details</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient colors={["#1a5f7a", "#16213e"]} style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Current Reports Feed</Text>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <MaterialIcons
              name="search"
              size={20}
              color="#8e8e8e"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search reports by description, location, or officer"
              placeholderTextColor="#8e8e8e"
              value={searchText}
              onChangeText={handleSearch}
            />
          </View>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => {
              setSearchText("");
              setData(originalData); // Reset data to original on refresh
            }}
          >
            <Ionicons name="refresh" size={24} color="#2ecc71" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={styles.reportListContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="report-problem" size={50} color="#e74c3c" />
            <Text style={styles.emptyMessage}>No reports found.</Text>
          </View>
        }
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    color: "#333",
  },
  refreshButton: {
    marginLeft: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 25,
    padding: 10,
  },
  reportListContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
  },
  reportCard: {
    backgroundColor: "white",
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  officerName: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  reportLocation: {
    fontSize: 14,
    color: "#666",
    marginLeft: 10,
  },
  officerContact: {
    fontSize: 14,
    color: "#007bff",
    marginLeft: 10,
  },
  reportImage: {
    width: "100%",
    height: 400,
  },
  descriptionContainer: {
    padding: 15,
  },
  descriptionText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  metadataContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  metadataItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  metadataText: {
    marginLeft: 5,
    color: "#666",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyMessage: {
    color: "white",
    fontSize: 18,
    marginTop: 15,
  },
  viewMoreButton: {
    backgroundColor: "#007bff",
    paddingVertical: 10,
    borderRadius: 5,
    marginTop: 10,
    marginBottom: 15,
    marginHorizontal: 15,
    alignItems: "center",
  },
  viewMoreText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default Updates;
