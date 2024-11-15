import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const dummyData = [
  {
    id: "1",
    image: "https://via.placeholder.com/100",
    description: "Suspicious activity near the park.",
    date: "12 Nov 2024",
    officer: "Officer John Doe",
  },
  {
    id: "2",
    image: "https://via.placeholder.com/100",
    description: "Unauthorized vehicle spotted at checkpoint.",
    date: "10 Nov 2024",
    officer: "Officer Jane Smith",
  },
  {
    id: "3",
    image: "https://via.placeholder.com/100",
    description: "Theft reported in the downtown area.",
    date: "8 Nov 2024",
    officer: "Officer Mike Brown",
  },
];

const Updates = () => {
  const [data, setData] = useState(dummyData);
  const [searchText, setSearchText] = useState("");

  const handleSearch = (text) => {
    setSearchText(text);
    if (text === "") {
      setData(dummyData); // Reset to original data if search is cleared
    } else {
      const filteredData = dummyData.filter((item) =>
        item.description.toLowerCase().includes(text.toLowerCase())
      );
      setData(filteredData);
    }
  };

  const renderCard = ({ item }) => (
    <View style={styles.feedCard}>
      <Image style={styles.feedImg} source={{ uri: item.image }} />
      <View style={styles.feedDetails}>
        <Text style={styles.feedDescription}>{item.description}</Text>
        <View style={styles.nameAndDate}>
          <Text style={styles.date}>{item.date}</Text>
          <Text style={styles.officerName}>{item.officer}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Current Reports Feed</Text>
        <View style={styles.searchContainer}>
          {/* Search Input */}
          <TextInput
            style={styles.search}
            placeholder="Search reports"
            placeholderTextColor="#8e8e8e"
            value={searchText}
            onChangeText={handleSearch}
          />
          {/* Refresh Icon */}
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => setData(dummyData)} // Reset to full data
          >
            <Ionicons name="refresh" size={24} color="green" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Feed Section */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={styles.feedContainer}
        ListEmptyComponent={
          <Text style={styles.emptyMessage}>No reports found.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7", // Light background
  },
  headerContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  search: {
    flex: 1,
    height: 40,
    borderColor: "#d3d3d3",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    color: "#333",
  },
  refreshButton: {
    marginLeft: 10,
  },
  feedContainer: {
    padding: 15,
  },
  feedCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3, // For Android shadow
  },
  feedImg: {
    height: 150,
    width: "100%",
  },
  feedDetails: {
    padding: 10,
  },
  feedDescription: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  nameAndDate: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  date: {
    fontSize: 14,
    color: "#666",
  },
  officerName: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
  },
  emptyMessage: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
    fontSize: 16,
  },
});

export default Updates;
