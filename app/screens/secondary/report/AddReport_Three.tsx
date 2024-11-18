import React, { useState } from "react";
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

const EvidenceScreen = ({ navigation, route }) => {
  const [images, setImages] = useState<string[]>([]);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

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
    }
  };

  const playAudio = async () => {
    if (audioUri) {
      try {
        const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
        setSound(sound);
        setIsPlaying(true);
        sound.setOnPlaybackStatusUpdate((status) => {
          console.log(status);
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        });
        await sound.playAsync();
      } catch (error) {
        console.error("Error playing audio:", error);
      }
    }
  };

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  const handleSubmit = () => {
    if (images.length === 0 && !audioUri) {
      Alert.alert(
        "Add Evidence",
        "Please add at least one image or audio recording."
      );
      return;
    }

    const evidenceData = { images, audioUri };
    const { suspectData } = route.params;
    console.log("Evidence Submitted:", { suspectData, evidenceData });
    navigation.navigate("SummaryScreen", { suspectData, evidenceData });
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Evidence</Title>

          {/* Horizontal Image Slider */}
          <View style={styles.sliderContainer}>
            <FlatList
              data={images}
              horizontal
              keyExtractor={(item, index) => index.toString()}
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

          {/* Voice Recorder */}
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

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
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
