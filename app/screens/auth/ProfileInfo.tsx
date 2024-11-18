import React, { useState } from "react";
import { View, StyleSheet, Alert, Image, ScrollView } from "react-native";
import { TextInput, Button, Card, Title, Text } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import * as Yup from "yup";
import { Formik } from "formik";
import { Picker } from "@react-native-picker/picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { FIREBASE_STORAGE } from "../../../FirebaseConfig";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { insertOfficer } from "../../../database";

const ProfileInfo = ({ navigation, route }) => {
  const [image, setImage] = useState<string | null>(null);
  const { officerID, email } = route.params;

  const validationSchema = Yup.object().shape({
    badgeNumber: Yup.number()
      .required("Badge number is required")
      .typeError("Badge number must be a Number"),
    rank: Yup.string().required("Rank is required"),
    name: Yup.string().required("Name is required"),
    contact: Yup.string()
      .required("Contact is required")
      .min(10, "Contact must be at least 10 digits")
      .matches(/^[0-9]{10}$/, "Contact must be exactly 10 digits"),
  });

  const uploadPicture = async (uri, officerID): Promise<string> => {
    const storage = getStorage();
    const blob = await new Promise<Blob>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function (e) {
        console.log(e);
        reject(new TypeError("Network request failed"));
      };
      xhr.responseType = "blob";
      xhr.open("GET", uri, true);
      xhr.send(null);
    });
    const filename = `profile_pictures/${officerID}_${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);
    const uploadTask = uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  };

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
      initialValues={{ badgeNumber: "", rank: "", name: "", contact: "" }}
      validationSchema={validationSchema}
      onSubmit={async (values) => {
        try {
          let pictureUrl: string | null = null;
          if (image) {
            pictureUrl = await uploadPicture(image, officerID);
            console.log("Picture uploaded successfully:", pictureUrl);
          }

          const formData = { ...values, pictureUrl };
          console.log("Submitting form with data:", formData);

          // Add form submission logic here
          const officerData = {
            id: officerID,
            name: values.name,
            badge_number: values.badgeNumber,
            rank: values.rank,
            email: email,

            contact: values.contact,
            profile_picture: pictureUrl, // Either URL or null
          };
          await insertOfficer(officerData);
          navigation.replace("Login");
        } catch (error) {
          console.error("Error during submission:", error);
        }
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
      }) => (
        <ScrollView style={styles.container}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>Officer Profile</Title>

              {/* Badge Number Field */}
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="badge-account"
                  size={20}
                  color="gray"
                  style={styles.icon}
                />
                <TextInput
                  label="Badge Number"
                  value={values.badgeNumber}
                  onChangeText={handleChange("badgeNumber")}
                  onBlur={handleBlur("badgeNumber")}
                  mode="flat"
                  style={styles.input}
                  keyboardType="number-pad"
                  error={touched.badgeNumber && !!errors.badgeNumber}
                />
              </View>
              {touched.badgeNumber && errors.badgeNumber && (
                <Text style={styles.errorText}>{errors.badgeNumber}</Text>
              )}

              {/* Rank Field */}
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="briefcase-account"
                  size={20}
                  color="gray"
                  style={styles.icon}
                />

                <Picker
                  selectedValue={values.rank}
                  onValueChange={handleChange("rank")}
                  style={styles.picker}
                >
                  <Picker.Item label="Select rank" value="" />
                  <Picker.Item label="Constable " value="Constable " />
                  <Picker.Item label="Sergeant" value="Sergeant" />
                  <Picker.Item label="Inspector" value="Inspector" />
                  <Picker.Item label="Superintendent" value="Superintendent" />
                  <Picker.Item label="Other" value="Other" />
                </Picker>
              </View>
              {touched.rank && errors.rank && (
                <Text style={styles.errorText}>{errors.rank}</Text>
              )}

              {/* Name Field */}
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="account"
                  size={20}
                  color="gray"
                  style={styles.icon}
                />
                <TextInput
                  label="Name"
                  value={values.name}
                  onChangeText={handleChange("name")}
                  onBlur={handleBlur("name")}
                  mode="flat"
                  style={styles.input}
                  error={touched.name && !!errors.name}
                />
              </View>
              {touched.name && errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}

              {/* Contact Field */}
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="phone"
                  size={20}
                  color="gray"
                  style={styles.icon}
                />
                <TextInput
                  label="Contact"
                  value={values.contact}
                  onChangeText={handleChange("contact")}
                  onBlur={handleBlur("contact")}
                  mode="flat"
                  style={styles.input}
                  keyboardType="phone-pad"
                  error={touched.contact && !!errors.contact}
                />
              </View>
              {touched.contact && errors.contact && (
                <Text style={styles.errorText}>{errors.contact}</Text>
              )}

              {/* Profile Photo Button */}
              <Button
                mode="outlined"
                onPress={pickImage}
                style={styles.button}
                icon={() => (
                  <MaterialCommunityIcons
                    name="camera"
                    size={20}
                    color="#6dbf44"
                  />
                )}
              >
                Select Profile Photo
              </Button>
              {image ? (
                <Image source={{ uri: image }} style={styles.image} />
              ) : (
                <Text style={styles.errorText}>No profile photo selected.</Text>
              )}

              {/* Submit Button */}
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.submitButton}
                disabled={!isValid || isSubmitting}
                contentStyle={styles.buttonContent}
                icon={() => (
                  <MaterialCommunityIcons
                    name="skip-next-circle-outline"
                    size={20}
                    color="black"
                  />
                )}
              >
                Submit
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      )}
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    color: "#333333",
    marginBottom: 12,
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 10,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 0,
    fontSize: 14,
    color: "#333333",
    backgroundColor: "transparent",
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
  picker: {
    marginVertical: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    color: "#333333",
  },
  button: {
    marginTop: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: "#6dbf44",
    paddingVertical: 8,
    borderRadius: 8,
  },
  buttonContent: {
    flexDirection: "row-reverse", // Reverses the order to place icon on the right
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 2,
  },
});

export default ProfileInfo;
