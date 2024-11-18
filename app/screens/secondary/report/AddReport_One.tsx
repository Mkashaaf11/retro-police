import React, { useState } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import { TextInput, Button, Card, Title, Text } from "react-native-paper";
import * as Location from "expo-location";
import { Formik } from "formik";
import * as Yup from "yup";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const AddReportDetails = ({ navigation }) => {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const validationSchema = Yup.object().shape({
    incidentDescription: Yup.string()
      .required("Incident description is required")
      .min(10, "Description must be at least 10 characters"),
  });

  const getLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission to access location was denied");
      return;
    }

    let loc = await Location.getCurrentPositionAsync({});
    setLocation(`Lat: ${loc.coords.latitude}, Lon: ${loc.coords.longitude}`);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  return (
    <Formik
      initialValues={{ incidentDescription: "" }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        console.log("Form Submitted", { ...values, date, location });
        navigation.navigate("Step 2"); // Navigate to next screen
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
              <Title style={styles.title}>Incident Details</Title>

              {/* Incident Description Field */}
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="file-document-edit"
                  size={20}
                  color="gray"
                  style={styles.icon}
                />
                <TextInput
                  label="Incident Description"
                  value={values.incidentDescription}
                  onChangeText={handleChange("incidentDescription")}
                  onBlur={handleBlur("incidentDescription")}
                  mode="flat"
                  style={styles.input}
                  multiline
                  error={
                    touched.incidentDescription && !!errors.incidentDescription
                  }
                />
              </View>
              {touched.incidentDescription && errors.incidentDescription && (
                <Text style={styles.errorText}>
                  {errors.incidentDescription}
                </Text>
              )}

              {/* Date Picker Button */}
              <Button
                mode="outlined"
                onPress={() => setShowDatePicker(true)}
                style={styles.button}
                icon={() => (
                  <MaterialCommunityIcons
                    name="calendar"
                    size={20}
                    color="#6dbf44"
                  />
                )}
              >
                Select Incident Date
              </Button>
              <Text style={styles.infoText}>Date: {date.toDateString()}</Text>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
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
                Tag Location
              </Button>
              {location && (
                <Text style={styles.infoText}>Location: {location}</Text>
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
                Next
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
  infoText: {
    color: "#333333",
    marginTop: 8,
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
    flexDirection: "row-reverse",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 2,
  },
});

export default AddReportDetails;
