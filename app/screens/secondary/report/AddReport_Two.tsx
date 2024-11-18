import React, { useState } from "react";
import { View, StyleSheet, Alert, Image, ScrollView } from "react-native";
import { TextInput, Button, Card, Title, Text } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { Formik } from "formik";
import * as Yup from "yup";

const SuspectDetail = ({ navigation }) => {
  const [image, setImage] = useState<string | null>(null);

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    description: Yup.string(),
    ethnicity: Yup.string().required("Ethnicity is required"),
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
            if (!result.canceled) {
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
            if (!result.canceled) {
              setImage(result.assets[0].uri);
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  return (
    <Formik
      initialValues={{ name: "", description: "", ethnicity: "" }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        console.log("Suspect Details Submitted", values, { image });
        navigation.navigate("Step 3", {
          suspectData: { ...values, image },
        });
      }}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        errors,
        touched,
        isValid,
        isSubmitting,
      }) => {
        return (
          <ScrollView style={styles.container}>
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.title}>Suspect Details</Title>

                {/* Name Field */}
                <TextInput
                  label="Name"
                  value={values.name}
                  onChangeText={handleChange("name")}
                  onBlur={handleBlur("name")}
                  mode="flat"
                  style={styles.input}
                  error={touched.name && !!errors.name}
                />
                {touched.name && errors.name && (
                  <Text style={styles.errorText}>{errors.name}</Text>
                )}

                {/* Ethnicity Dropdown */}
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
                {touched.ethnicity && errors.ethnicity && (
                  <Text style={styles.errorText}>{errors.ethnicity}</Text>
                )}

                {/* Description Field */}
                <TextInput
                  label="Description (Optional)"
                  value={values.description}
                  onChangeText={handleChange("description")}
                  onBlur={handleBlur("description")}
                  mode="flat"
                  style={styles.input}
                  multiline
                />

                {/* Image Picker */}
                <Button
                  mode="outlined"
                  onPress={pickImage}
                  style={styles.button}
                  icon="camera"
                >
                  Select Suspect Image
                </Button>
                {image ? (
                  <Image source={{ uri: image }} style={styles.image} />
                ) : (
                  <Text style={styles.errorText}>No image selected</Text>
                )}

                {/* Submit Button */}
                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.submitButton}
                  disabled={!isValid || isSubmitting || !image}
                >
                  Next
                </Button>
              </Card.Content>
            </Card>
          </ScrollView>
        );
      }}
    </Formik>
  );
};

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

export default SuspectDetail;
