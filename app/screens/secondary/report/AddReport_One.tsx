import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, ScrollView } from "react-native";
import { TextInput, Button, Card, Title, Text } from "react-native-paper";
import * as Location from "expo-location";
import { Formik } from "formik";
import * as Yup from "yup";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useProfile } from "../../../../providers/ProfileContext";
import { supabase } from "../../../../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AddReportDetails = ({ navigation }) => {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { session } = useProfile();

  const LOCAL_STORAGE_KEY = "report_data";

  const validationSchema = Yup.object().shape({
    incidentDescription: Yup.string()
      .required("Incident description is required")
      .min(10, "Description must be at least 10 characters"),
    title: Yup.string().required(
      "Give a title to the report please for your convenience"
    ),
  });

  useEffect(() => {
    const loadSavedData = async () => {
      try {
        const savedData = await AsyncStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedData) {
          const { title, incidentDescription, location, date } =
            JSON.parse(savedData);
          setDate(new Date(date));
          setLocation(location);

          setInitialValues({
            title,
            incidentDescription,
          });
        }
      } catch (error) {
        console.error("Error loading saved report data:", error);
      }
    };

    loadSavedData();
  }, []);

  const [initialValues, setInitialValues] = useState({
    title: "",
    incidentDescription: "",
  });

  const saveToLocalStorage = async (values) => {
    try {
      const dataToSave = {
        ...values,
        location,
        date: date.toISOString(),
      };
      await AsyncStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error("Error saving report data to local storage:", error);
    }
  };

  const clearLocalStorage = async () => {
    try {
      await AsyncStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing local storage:", error);
    }
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

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSubmit = async (values) => {
    const { title, incidentDescription } = values;
    let created_by = null;
    if (session?.user?.email) {
      const { data, error } = await supabase
        .from("officers")
        .select("*")
        .eq("email", session.user.email)
        .single();

      if (error) {
        console.error("Error fetching profile data:", error);
      } else {
        created_by = data.id;
      }
    }

    if (!created_by) {
      Alert.alert("Error", "You must be logged in to submit a report.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("reports")
        .insert([
          {
            title,
            description: incidentDescription,
            created_by,
            status: "pending",
            location,
            incident_date: date,
          },
        ])
        .select("*");

      if (error) {
        Alert.alert("Error", "Failed to submit the report. Please try again.");
        console.error(error);
      } else {
        if (data && data.length > 0) {
          await clearLocalStorage();
          const reportId = data[0]?.id;
          navigation.navigate("Step 2", { reportId });
        }
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while submitting the report.");
      console.error(error);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      enableReinitialize={true}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
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

              {/* Incident Title Field */}
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="file-document-edit"
                  size={20}
                  color="#4A90E2"
                  style={styles.icon}
                />
                <TextInput
                  label="Incident Title"
                  value={values.title}
                  onChangeText={(text) => {
                    handleChange("title")(text);
                    saveToLocalStorage({ ...values, title: text });
                  }}
                  onBlur={handleBlur("title")}
                  mode="flat"
                  style={styles.input}
                  multiline
                  error={touched.title && !!errors.title}
                />
              </View>
              {touched.title && errors.title && (
                <Text style={styles.errorText}>{errors.title}</Text>
              )}

              {/* Incident Description Field */}
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons
                  name="file-document-edit"
                  size={20}
                  color="#4A90E2"
                  style={styles.icon}
                />
                <TextInput
                  label="Incident Description"
                  value={values.incidentDescription}
                  onChangeText={(text) => {
                    handleChange("incidentDescription")(text);
                    saveToLocalStorage({
                      ...values,
                      incidentDescription: text,
                    });
                  }}
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
                    color="#4A90E2"
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
                  onChange={(e, selectedDate) => {
                    handleDateChange(e, selectedDate);
                    saveToLocalStorage({ ...values });
                  }}
                />
              )}

              {/* Get Location Button */}
              <Button
                mode="outlined"
                onPress={() => {
                  getLocation();
                  saveToLocalStorage({ ...values });
                }}
                style={styles.button}
                icon={() => (
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={20}
                    color="#4A90E2"
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
                onPress={() => handleSubmit()}
                style={styles.submitButton}
                disabled={!isValid || isSubmitting}
                contentStyle={styles.buttonContent}
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
    borderColor: "#4A90E2",
    borderWidth: 1,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: "#4A90E2", // Primary blue
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
