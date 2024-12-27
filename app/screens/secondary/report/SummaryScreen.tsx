import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  FlatList,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Audio } from "expo-av";
import { supabase } from "../../../../lib/supabase";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const SummaryScreen = ({ route }) => {
  const { insertedSuspect, evidence } = route.params;
  const [reportDetails, setReportDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    const fetchReportDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("reports")
          .select("*")
          .eq("id", insertedSuspect.report_id)
          .single();

        if (error) {
          console.error("Error fetching report details:", error);
          throw new Error("Failed to fetch report details. Please try again.");
        }

        setReportDetails(data);
      } catch (err) {
        setError(err.message);
        Alert.alert("Error", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReportDetails();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [insertedSuspect.report_id, sound]);

  const playAudio = async (uri: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      setSound(sound);
      await sound.playAsync();
    } catch (err) {
      console.error("Error playing audio:", err);
      Alert.alert("Error", "Unable to play audio.");
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={["#1a5f7a", "#16213e"]} style={styles.centered}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </LinearGradient>
    );
  }

  if (error) {
    return (
      <LinearGradient colors={["#1a5f7a", "#16213e"]} style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#1a5f7a", "#16213e"]} style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Suspect Report Summary</Text>
        <View style={styles.headerUnderline} />
      </View>

      <View style={styles.suspectContainer}>
        <View style={styles.suspectHeader}>
          <Feather name="user" size={24} color="white" />
          <Text style={styles.suspectName}>Name: {insertedSuspect.name}</Text>
        </View>
        {reportDetails && (
          <View style={styles.reportDetailsContainer}>
            <Text style={styles.reportLabel}>Report Details:</Text>
            <Text style={styles.reportDescription}>
              {reportDetails.description}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.sectionHeader}>
        <Feather name="file-text" size={24} color="white" />
        <Text style={styles.subHeader}>Submitted Evidence</Text>
      </View>

      {evidence && evidence.length > 0 ? (
        <FlatList
          data={evidence}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.evidenceItem}>
              <View style={styles.evidenceTypeContainer}>
                <Feather
                  name={item.type === "image" ? "image" : "mic"}
                  size={20}
                  color="white"
                />
                <Text style={styles.evidenceType}>Type: {item.type}</Text>
              </View>
              {item.type === "image" ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: item.file_url }} style={styles.image} />
                </View>
              ) : item.type === "audio" ? (
                <TouchableOpacity
                  style={styles.audioButton}
                  onPress={() => playAudio(item.file_url)}
                >
                  <Feather name="play" size={20} color="white" />
                  <Text style={styles.audioButtonText}>Play Audio</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.text}>Unsupported Evidence Type</Text>
              )}
            </View>
          )}
          contentContainerStyle={styles.evidenceList}
        />
      ) : (
        <View style={styles.noEvidenceContainer}>
          <Feather name="alert-circle" size={24} color="#666" />
          <Text style={styles.noEvidenceText}>No evidence submitted.</Text>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 8,
  },
  headerUnderline: {
    width: 60,
    height: 4,
    backgroundColor: "#e74c3c",
    borderRadius: 2,
  },
  suspectContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  suspectHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  suspectName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    flex: 1,
    marginLeft: 12,
  },
  reportDetailsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 16,
  },
  reportLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
    marginBottom: 8,
  },
  reportDescription: {
    fontSize: 16,
    color: "#dddddd",
    lineHeight: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#e1e8ed",
  },
  subHeader: {
    fontSize: 22,
    fontWeight: "600",
    color: "#ffffff",
    marginLeft: 12,
  },
  evidenceList: {
    gap: 16,
  },
  evidenceItem: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  evidenceTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  evidenceType: {
    fontSize: 16,
    fontWeight: "500",
    color: "#ffffff",
    marginLeft: 8,
  },
  imageContainer: {
    alignItems: "center",
  },
  image: {
    width: width - 72,
    height: width - 72,
    borderRadius: 12,
    backgroundColor: "#f0f2f5",
  },
  audioButton: {
    backgroundColor: "#3498db",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  audioButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  noEvidenceContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
  },
  noEvidenceText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 12,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#ffffff",
    fontSize: 16,
    marginTop: 12,
    fontWeight: "500",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 16,
    textAlign: "center",
    marginTop: 12,
  },
  text: {
    fontSize: 22,
    fontWeight: "bold",
  },
});

export default SummaryScreen;
