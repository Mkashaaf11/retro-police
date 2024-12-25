import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  FlatList,
  Text,
  Alert,
  ActivityIndicator,
  Button,
} from "react-native";
import { Audio } from "expo-av";
import { supabase } from "../../../../lib/supabase";

const SummaryScreen = ({ route }) => {
  const { insertedSuspect, evidence } = route.params;
  const [reportDetails, setReportDetails] = useState(null);
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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  // Render Main Content
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Suspect Details</Text>
      <Text style={styles.text}>Name: {insertedSuspect.name}</Text>
      {reportDetails && (
        <Text style={styles.text}>
          Report Details: {reportDetails.description}
        </Text>
      )}

      <Text style={styles.header}>Submitted Evidence:</Text>
      {evidence && evidence.length > 0 ? (
        <FlatList
          data={evidence}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.evidenceItem}>
              <Text style={styles.text}>Type: {item.type}</Text>
              {item.type === "image" ? (
                <Image source={{ uri: item.file_url }} style={styles.image} />
              ) : item.type === "audio" ? (
                <Button
                  title="Play Audio"
                  onPress={() => playAudio(item.file_url)}
                />
              ) : (
                <Text style={styles.text}>Unsupported Evidence Type</Text>
              )}
            </View>
          )}
        />
      ) : (
        <Text style={styles.text}>No evidence submitted.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    marginBottom: 4,
  },
  evidenceItem: {
    marginBottom: 16,
  },
  image: {
    width: 100,
    height: 100,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});

export default SummaryScreen;
