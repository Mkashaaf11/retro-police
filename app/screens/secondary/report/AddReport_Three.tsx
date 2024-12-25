import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  FlatList,
  Alert,
  TouchableOpacity,
  Text,
} from "react-native";
import { Button, Card, Title } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";
import { supabase } from "../../../../lib/supabase";
import * as FileSystem from "expo-file-system";

const EvidenceScreen = ({ navigation, route }) => {
  const [images, setImages] = useState<string[]>([]);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { insertedSuspect } = route.params;

  const pickImage = async () => {
    if (images.length >= 5) {
      Alert.alert("Limit Reached", "You can only add up to 5 images.");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
  };

  const uploadImagesToSupabase = async (uris: string[]) => {
    try {
      setLoading(true);
      const urls: string[] = [];

      for (const uri of uris) {
        const base64Data = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const arrayBuffer = Uint8Array.from(atob(base64Data), (c) =>
          c.charCodeAt(0)
        );

        const uniqueImageName = `evidence_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}.jpg`;

        const { data, error } = await supabase.storage
          .from("evidence-files/images")
          .upload(uniqueImageName, arrayBuffer, { contentType: "image/jpeg" });

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from("evidence-files/images")
          .getPublicUrl(data.path);

        urls.push(urlData.publicUrl);
      }

      return urls;
    } catch (error) {
      Alert.alert("Image Upload Error", error.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const uploadAudioToSupabase = async (uri: string) => {
    try {
      setLoading(true);

      const base64Data = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const arrayBuffer = Uint8Array.from(atob(base64Data), (c) =>
        c.charCodeAt(0)
      );

      const uniqueAudioName = `evidence_audio_${Date.now()}.mp3`;

      const { data, error } = await supabase.storage
        .from("evidence-files/audio")
        .upload(uniqueAudioName, arrayBuffer, { contentType: "audio/mpeg" });

      if (data) console.log("Audio saved");
      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("evidence-files/audio")
        .getPublicUrl(data.path);

      console.log("Audio Url:", urlData.publicUrl);
      return urlData.publicUrl;
    } catch (error) {
      Alert.alert("Audio Upload Error", error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveEvidenceToDatabase = async (type, fileUrls) => {
    try {
      const evidenceEntries = fileUrls.map((url) => ({
        suspect_id: insertedSuspect.id,
        case_id: insertedSuspect.report_id,
        added_by: insertedSuspect.created_by,
        type: type,
        file_url: url,
        created_at: new Date().toISOString(),
      }));

      console.log("Evidence Entries: ", evidenceEntries);
      const { data, error } = await supabase
        .from("evidence")
        .insert(evidenceEntries)
        .select("*");

      if (error) {
        console.log("Supabase error:", error);
        throw error;
      }

      if (!data) {
        throw new Error("No data returned from insert operation");
      }

      return data;
    } catch (error) {
      Alert.alert("Database Error", error.message);
      return null;
    }
  };

  const startRecording = async () => {
    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        Alert.alert("Permission Required", "Audio permission is required.");
        return;
      }

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (error) {
      console.error("Error starting recording:", error);
      Alert.alert("Error", "Unable to start recording. Please try again.");
    }
  };

  const stopRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setAudioUri(uri);
        setRecording(null);
        Alert.alert("Recording Saved", "Audio recording has been saved.");
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
      Alert.alert("Error", "Unable to stop recording. Please try again.");
    }
  };

  const playAudio = async () => {
    if (!audioUri || isPlaying) return; // Prevent multiple playbacks
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      setSound(sound);
      setIsPlaying(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlaying(false);
        }
      });
      await sound.playAsync();
    } catch (error) {
      console.error("Error playing audio:", error);
      Alert.alert("Error", "Unable to play audio. Please try again.");
    }
  };

  const stopAudio = async () => {
    if (!isPlaying) return; // Prevent double stop
    try {
      if (sound) {
        await sound.stopAsync();
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error stopping audio:", error);
      Alert.alert("Error", "Unable to stop audio. Please try again.");
    }
  };

  useEffect(() => {
    return () => {
      if (recording) {
        recording
          .stopAndUnloadAsync()
          .catch((error) =>
            console.error("Error stopping recording on unmount:", error)
          );
      }
      if (sound) {
        sound
          .unloadAsync()
          .catch((error) =>
            console.error("Error unloading audio on unmount:", error)
          );
      }
    };
  }, []);

  useEffect(() => {
    const handleBeforeRemove = async (e) => {
      if (recording) {
        e.preventDefault();
        Alert.alert(
          "Exit Warning",
          "You are recording audio. Stop the recording first before exiting.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Exit Anyway",
              style: "destructive",
              onPress: async () => {
                await recording
                  .stopAndUnloadAsync()
                  .catch((error) =>
                    console.error("Error stopping recording on exit:", error)
                  );
                navigation.dispatch(e.data.action);
              },
            },
          ]
        );
      }
    };

    navigation.addListener("beforeRemove", handleBeforeRemove);
    return () => navigation.removeListener("beforeRemove", handleBeforeRemove);
  }, [recording]);

  const handleSubmit = async () => {
    if (images.length === 0 && !audioUri) {
      Alert.alert(
        "Add Evidence",
        "Please add at least one image or audio recording."
      );
      return;
    }

    try {
      let imageUrls: string[] = [];
      let audioUrl: string | null = null;
      let submittedEvidence: Array<any> = [];

      if (images.length > 0) {
        imageUrls = await uploadImagesToSupabase(images);
        if (imageUrls.length > 0) {
          const imageEvidence = await saveEvidenceToDatabase(
            "image",
            imageUrls
          );
          if (imageEvidence)
            submittedEvidence = submittedEvidence.concat(imageEvidence);
        }
      }

      if (audioUri) {
        audioUrl = await uploadAudioToSupabase(audioUri);
        if (audioUrl) {
          const audioEvidence = await saveEvidenceToDatabase("audio", [
            audioUrl,
          ]);
          if (audioEvidence)
            submittedEvidence = submittedEvidence.concat(audioEvidence);
        }
      }

      Alert.alert("Success", "Evidence submitted successfully.");
      navigation.navigate("SummaryScreen", {
        insertedSuspect,
        evidence: submittedEvidence,
      });
    } catch (error) {
      Alert.alert("Submission Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Evidence</Title>

          <View style={styles.sliderContainer}>
            <FlatList
              data={images}
              horizontal
              keyExtractor={(item) => item} // Unique key for each image URI
              renderItem={({ item, index }) => (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: item }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.removeText}>X</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            <Button
              mode="outlined"
              onPress={pickImage}
              style={styles.addButton}
              icon="camera"
            >
              Add Evidence Image
            </Button>
          </View>

          {audioUri ? (
            <View style={styles.audioContainer}>
              <Button
                mode="outlined"
                onPress={isPlaying ? stopAudio : playAudio}
                style={styles.audioButton}
              >
                {isPlaying ? "Stop Audio" : "Play Audio"}
              </Button>
            </View>
          ) : (
            <View style={styles.audioContainer}>
              <Button
                mode="outlined"
                onPress={recording ? stopRecording : startRecording}
                style={styles.audioButton}
              >
                {recording ? "Stop Recording" : "Start Recording"}
              </Button>
            </View>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit}
            disabled={images.length === 0 && !audioUri}
            style={[
              styles.submitButton,
              {
                backgroundColor:
                  images.length === 0 && !audioUri ? "#cccccc" : "#6dbf44",
              },
            ]}
          >
            Submit Evidence
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f7f7f7",
  },
  card: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    elevation: 5,
  },
  title: {
    color: "#333333",
    marginBottom: 12,
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  sliderContainer: {
    marginVertical: 20,
  },
  imageContainer: {
    position: "relative",
    marginRight: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "red",
    borderRadius: 50,
    padding: 4,
  },
  removeText: {
    color: "white",
    fontSize: 12,
  },
  addButton: {
    marginTop: 10,
  },
  audioContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
  audioButton: {
    marginTop: 10,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: "#6dbf44",
    paddingVertical: 8,
    borderRadius: 8,
  },
});

export default EvidenceScreen;
