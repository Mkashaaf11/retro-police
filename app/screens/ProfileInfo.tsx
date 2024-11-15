import React, { useState } from "react";
import { View, StyleSheet, Alert, Image, ScrollView } from "react-native";
import { TextInput, Button, Card, Title, Text } from "react-native-paper";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import * as Yup from "yup";
import { Formik } from "formik";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ProfileInfo = ({ navigation }) => {
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState<string>("");

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

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission to access location was denied");
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    setLocation(`Lat: ${loc.coords.latitude}, Lon: ${loc.coords.longitude}`);
  };

  return (
    <Formik
      initialValues={{ badgeNumber: "", rank: "", name: "", contact: "" }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        console.log("Form Submitted", values);
        navigation.replace("Login");
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
                <TextInput
                  label="Rank"
                  value={values.rank}
                  onChangeText={handleChange("rank")}
                  onBlur={handleBlur("rank")}
                  mode="flat"
                  style={styles.input}
                  error={touched.rank && !!errors.rank}
                />
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

              {/* Get Location Button */}
              <Button
                mode="outlined"
                onPress={getLocation}
                style={styles.button}
                icon={() => (
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={20}
                    color="#6dbf44"
                  />
                )}
              >
                Get Location
              </Button>
              {location && (
                <Text style={styles.locationText}>Location: {location}</Text>
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
  locationText: {
    color: "#333333",
    marginTop: 12,
    fontSize: 14,
    textAlign: "center",
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
