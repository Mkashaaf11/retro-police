import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Audio } from "expo-av";
import { supabase } from "../../../lib/supabase";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5, Feather } from "@expo/vector-icons";

const OtherReports = ({ route }) => {
  const { reportId } = route.params;
  const [report, setReport] = useState<any>(null);
  const [suspects, setSuspects] = useState<any>([]);
  const [evidences, setEvidences] = useState<any>([]);
  const [sound, setSound] = useState<Audio.Sound | null>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReportDetails = async () => {
      try {
        setLoading(true);
        const { data: reportData, error: reportError } = await supabase
          .from("reports")
          .select("*")
          .eq("id", reportId)
          .single();

        if (reportError) throw reportError;
        setReport(reportData);

        const { data: suspectsData, error: suspectsError } = await supabase
          .from("suspects")
          .select("*")
          .eq("report_id", reportId);

        if (suspectsError) throw suspectsError;
        setSuspects(suspectsData);

        const { data: evidencesData, error: evidencesError } = await supabase
          .from("evidence")
          .select("*")
          .eq("case_id", reportId);

        if (evidencesError) throw evidencesError;
        setEvidences(evidencesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReportDetails();
  }, [reportId]);

  const playAudio = async (fileUrl) => {
    const { sound } = await Audio.Sound.createAsync(
      { uri: fileUrl },
      { shouldPlay: true }
    );
    setSound(sound);
  };

  if (loading) {
    return (
      <LinearGradient
        colors={["#1a5f7a", "#16213e"]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color="#ffffff" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#1a5f7a", "#16213e"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {report ? (
          <>
            <View style={styles.section}>
              <Text style={styles.title}>{report.title}</Text>
              <Text style={styles.description}>{report.description}</Text>
              <View style={styles.infoRow}>
                <FontAwesome5 name="calendar-alt" size={16} color="white" />
                <Text style={styles.infoText}>
                  Created at: {new Date(report.created_at).toLocaleString()}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <FontAwesome5 name="flag" size={16} color="white" />
                <Text style={styles.infoText}>Status: {report.status}</Text>
              </View>
              <View style={styles.infoRow}>
                <FontAwesome5 name="map-marker-alt" size={16} color="white" />
                <Text style={styles.infoText}>Location: {report.location}</Text>
              </View>
            </View>

            {suspects.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Suspects</Text>
                {suspects.map((suspect) => (
                  <View key={suspect.id} style={styles.suspectContainer}>
                    <Image
                      source={{ uri: suspect.image_url }}
                      style={styles.suspectImage}
                    />
                    <View style={styles.suspectInfo}>
                      <Text style={styles.suspectName}>{suspect.name}</Text>
                      <Text style={styles.suspectDetails}>
                        Age: {suspect.age}
                      </Text>
                      <Text style={styles.suspectDetails}>
                        Gender: {suspect.gender}
                      </Text>
                      <Text style={styles.suspectDetails}>
                        Ethnicity: {suspect.ethnicity}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {evidences.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Evidence</Text>
                {evidences.map((evidence) => (
                  <View key={evidence.id} style={styles.evidenceContainer}>
                    {evidence.type === "audio" ? (
                      <TouchableOpacity
                        onPress={() => playAudio(evidence.file_url)}
                      >
                        <Feather name="play" size={24} color="white" />
                        <Text style={styles.evidenceType}>
                          Play Audio Evidence
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <Image
                        source={{ uri: evidence.file_url }}
                        style={styles.evidenceImage}
                      />
                    )}
                  </View>
                ))}
              </View>
            )}
          </>
        ) : (
          <Text style={styles.errorText}>Report Data Unavailable</Text>
        )}
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
    padding: 15,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "white",
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: "white",
    marginLeft: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
  suspectContainer: {
    flexDirection: "row",
    marginBottom: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    padding: 10,
  },
  suspectImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "white",
  },
  suspectInfo: {
    justifyContent: "center",
  },
  suspectName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  suspectDetails: {
    fontSize: 14,
    color: "white",
  },
  evidenceContainer: {
    marginBottom: 10,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    padding: 10,
  },
  evidenceType: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    marginTop: 10,
  },
  evidenceImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
    borderRadius: 10,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default OtherReports;
