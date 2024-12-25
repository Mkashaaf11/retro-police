import React, { useState } from "react";
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

const { width } = Dimensions.get("window");

const dummyData = [
  {
    id: "1",
    image: "https://via.placeholder.com/400x400",
    description:
      "Suspicious activity near the park. Multiple individuals observed acting suspiciously around playground equipment. Investigating potential security concerns.",
    date: "12 Nov 2024",
    officer: "Officer John Doe",
    location: "Central Park",
    status: "Under Investigation",
  },
  {
    id: "2",
    image: "https://via.placeholder.com/400x400",
    description:
      "Unauthorized vehicle spotted at checkpoint. Vehicle matches description of recent stolen vehicle. Immediate action taken to secure the area.",
    date: "10 Nov 2024",
    officer: "Officer Jane Smith",
    location: "Highway Checkpoint",
    status: "Resolved",
  },
  {
    id: "3",
    image: "https://via.placeholder.com/400x400",
    description:
      "Theft reported in the downtown area. Multiple items stolen from local businesses. Detailed investigation underway to track down suspects.",
    date: "8 Nov 2024",
    officer: "Officer Mike Brown",
    location: "Downtown District",
    status: "Active",
  },
];

const Updates = () => {
  const [data, setData] = useState(dummyData);
  const [searchText, setSearchText] = useState("");

  const handleSearch = (text) => {
    setSearchText(text);
    if (text === "") {
      setData(dummyData);
    } else {
      const filteredData = dummyData.filter(
        (item) =>
          item.description.toLowerCase().includes(text.toLowerCase()) ||
          item.location.toLowerCase().includes(text.toLowerCase()) ||
          item.officer.toLowerCase().includes(text.toLowerCase())
      );
      setData(filteredData);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "#e74c3c";
      case "Under Investigation":
        return "#f39c12";
      case "Resolved":
        return "#2ecc71";
      default:
        return "#3498db";
    }
  };

  const renderCard = ({ item }) => (
    <View style={styles.reportCard}>
      {/* Header Section */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="person" size={24} color="#333" />
          <View>
            <Text style={styles.officerName}>{item.officer}</Text>
            <Text style={styles.reportLocation}>{item.location}</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      {/* Image Section */}
      <Image
        style={styles.reportImage}
        source={{ uri: item.image }}
        resizeMode="cover"
      />

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
              setData(dummyData);
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
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
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
});

export default Updates;
