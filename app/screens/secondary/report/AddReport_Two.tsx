import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, ScrollView, Image } from "react-native";
import { TextInput, Button, Card, Title, Text } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useProfile } from "../../../../providers/ProfileContext";
import { Formik } from "formik";
import * as Yup from "yup";
import { supabase } from "../../../../lib/supabase";
import * as FileSystem from "expo-file-system";

const SuspectDetail = ({ navigation, route }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [createdBy, setCreatedBy] = useState<string | null>(null);
  const { session } = useProfile();
  const { reportId: report_id } = route.params;

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

  useEffect(() => {
    fetchOfficerId();
  }, []);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    description: Yup.string().required("Description is required"),
    ethnicity: Yup.string()
      .required("Ethnicity is required")
      .notOneOf([""], "Please select a valid ethnicity"),
    age: Yup.number()
      .required("Age is required")
      .min(0, "Age must be a positive number"),
    gender: Yup.string().required("Gender is required"),
  });

  const pickImage = async () => {
    Alert.alert(
      "Choose Image Source",
      "Select an option to pick an image",
      [
        {
          text: "Gallery",
          onPress: async () => {
            let result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });
            if (!result.canceled && result.assets && result.assets[0].uri) {
              setImage(result.assets[0].uri);
            }
          },
        },
        {
          text: "Camera",
          onPress: async () => {
            let result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });
            if (!result.canceled && result.assets && result.assets[0].uri) {
              setImage(result.assets[0].uri);
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const uploadImageToSupabase = async (uri: string) => {
    try {
      setLoading(true);
      const base64Data = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const arrayBuffer = Uint8Array.from(atob(base64Data), (c) =>
        c.charCodeAt(0)
      );

      const uniqueImageName = `suspect_${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from("profile-images/suspects")
        .upload(uniqueImageName, arrayBuffer, { contentType: "image/jpeg" });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("profile-images/suspects")
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      Alert.alert("Image Upload Error", error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveSuspectToDatabase = async (suspectData) => {
    try {
      const { data, error } = await supabase
        .from("suspects")
        .insert(suspectData)
        .select("*");
      if (error) throw error;
      return data;
    } catch (error) {
      Alert.alert("Database Insertion Error", error.message);
    }
  };

  const saveEvidenceToDatabase = async (suspectId, fileUrl) => {
    try {
      const evidenceData = {
        suspect_id: suspectId,
        case_id: report_id,
        added_by: createdBy,
        type: ["image"], // Assuming it's an image type; can be adjusted
        file_url: fileUrl,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("evidence")
        .insert([evidenceData])
        .select("*");
      if (error) throw error;
      return data;
    } catch (error) {
      Alert.alert("Evidence Insert Error", error.message);
    }
  };

  return (
    <Formik
      initialValues={{
        name: "",
        description: "",
        ethnicity: "",
        age: "",
        gender: "",
      }}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        if (!createdBy) {
          Alert.alert("Error", "You must be logged in to submit a report.");
          return;
        }

        if (!image) {
          Alert.alert("Error", "Please select an image before submitting.");
          return;
        }

        const imageUrl = await uploadImageToSupabase(image);
        if (!imageUrl) return;

        const suspectData = {
          ...values,
          report_id,
          created_by: createdBy,
          created_at: new Date().toISOString(),
        };

        const insertedSuspect = await saveSuspectToDatabase(suspectData);
        if (!insertedSuspect) return;

        // Insert the evidence record
        await saveEvidenceToDatabase(insertedSuspect[0].id, imageUrl);

        navigation.navigate("Step 3", { insertedSuspect: insertedSuspect[0] });
      }}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors }) => (
        <ScrollView style={styles.container}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>Suspect Details</Title>
              <TextInput
                label="Name"
                onChangeText={handleChange("name")}
                onBlur={handleBlur("name")}
                style={styles.input}
                error={!!errors.name}
              />
              <TextInput
                label="Age"
                keyboardType="numeric"
                onChangeText={handleChange("age")}
                style={styles.input}
                error={!!errors.age}
              />
              <Picker
                selectedValue={values.gender}
                onValueChange={handleChange("gender")}
                style={styles.picker}
              >
                <Picker.Item label="Select Gender" value="" />
                <Picker.Item label="Male" value="Male" />
                <Picker.Item label="Female" value="Female" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
              <Picker
                selectedValue={values.ethnicity}
                onValueChange={handleChange("ethnicity")}
                style={styles.picker}
              >
                <Picker.Item label="Select Ethnicity" value="" />
                <Picker.Item label="Asian" value="Asian" />
                <Picker.Item label="Black" value="Black" />
                <Picker.Item label="White" value="White" />
                <Picker.Item label="Hispanic" value="Hispanic" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
              <TextInput
                label="Description"
                onChangeText={handleChange("description")}
                multiline
                style={styles.input}
              />
              {image && <Image source={{ uri: image }} style={styles.image} />}
              <Button onPress={pickImage} mode="contained">
                Pick Image
              </Button>
              <Button onPress={handleSubmit} style={styles.submitButton}>
                Submit
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      )}
    </Formik>
  );
};

export default SuspectDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    margin: 16,
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
  input: {
    marginBottom: 10,
    backgroundColor: "transparent",
  },
  picker: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    color: "#333333",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 12,
    marginBottom: 8,
  },
  image: {
    width: 100,
    height: 100,
    marginTop: 16,
    alignSelf: "center",
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#6dbf44",
  },
  button: {
    marginTop: 10,
    borderRadius: 6,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: "#6dbf44",
    paddingVertical: 8,
    borderRadius: 8,
  },
});
