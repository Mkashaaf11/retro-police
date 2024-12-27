import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  StyleSheet,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useProfile } from "../../../providers/ProfileContext";
import { supabase } from "../../../lib/supabase";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { AuthStackParamList } from "../../../types";

const { width } = Dimensions.get("window");

const Profile = () => {
  const { session, setSession } = useProfile();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newContactNumber, setNewContactNumber] = useState("");
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();

  useEffect(() => {
    const fetchProfileData = async () => {
      if (session?.user?.email) {
        setLoading(true);
        const { data, error } = await supabase
          .from("officers")
          .select("*")
          .eq("email", session.user.email)
          .single();

        if (error) {
          console.error("Error fetching profile data:", error);
        } else {
          setProfileData(data);
          if (data.profile_picture) {
            setProfileImage(data.profile_picture);
          }
        }
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [session]);

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

  const setImage = async (uri: string) => {
    try {
      setLoading(true);
      const base64Data = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const arrayBuffer = Uint8Array.from(atob(base64Data), (c) =>
        c.charCodeAt(0)
      );

      const uniqueImageName = `officer_${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from("profile-images/officers")
        .upload(uniqueImageName, arrayBuffer, { contentType: "image/jpeg" });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from("profile-images/officers")
        .getPublicUrl(data.path);

      const publicUrl = urlData.publicUrl;
      if (session) {
        const { error: updateError } = await supabase
          .from("officers")
          .update({ profile_picture: publicUrl })
          .eq("email", session.user.email);

        if (updateError) throw updateError;
      }

      setProfileImage(publicUrl);
      Alert.alert("Success", "Profile picture updated successfully");
    } catch (error) {
      Alert.alert("Image Upload Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
    } else {
      setSession(null);
      //navigation.navigate("Login");
    }
  };

  const ProfileDetailCard = ({ icon, label, value }) => (
    <View style={styles.detailCard}>
      <View style={styles.detailCardIconContainer}>
        <FontAwesome5 name={icon} size={20} color="#3498db" />
      </View>
      <View style={styles.detailCardContent}>
        <Text style={styles.detailCardLabel}>{label}</Text>
        <Text style={styles.detailCardValue}>{value || "Not specified"}</Text>
      </View>
    </View>
  );

  const handleUpdateContactNumber = async () => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("officers")
        .update({ contact: newContactNumber })
        .eq("email", session?.user?.email);

      if (error) throw error;

      setProfileData((prevData) => ({
        ...prevData,
        contact: newContactNumber,
      }));
      setIsEditing(false);
      setNewContactNumber("");
      Alert.alert("Success", "Contact number updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update contact number");
    } finally {
      setLoading(false);
    }
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

  if (!profileData) {
    return (
      <LinearGradient colors={["#1a5f7a", "#16213e"]} style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={70} color="#e74c3c" />
          <Text style={styles.errorText}>Profile Data Unavailable</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#1a5f7a", "#16213e"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileHeader}>
          <TouchableOpacity onPress={pickImage}>
            <View style={styles.profileImageWrapper}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.profileImagePlaceholder}>
                  <MaterialIcons
                    name="local-police"
                    size={80}
                    color="#ffffff"
                  />
                </View>
              )}
            </View>
          </TouchableOpacity>

          <Text style={styles.nameText}>
            {profileData.name || "Officer Name"}
          </Text>
          <Text style={styles.rankText}>{profileData.rank || "Rank"}</Text>
        </View>

        <View style={styles.detailedInfoContainer}>
          <Text style={styles.sectionTitle}>Personal Details</Text>

          <ProfileDetailCard
            icon="id-badge"
            label="Officer ID"
            value={profileData.id}
          />
          <ProfileDetailCard
            icon="building"
            label="Department"
            value={profileData.department || "Unassigned"}
          />
          <ProfileDetailCard
            icon="envelope"
            label="Email"
            value={profileData.email}
          />
          <ProfileDetailCard
            icon="phone"
            label="Contact Number"
            value={profileData.contact || "Not provided"}
          />

          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => setIsEditing(true)}
          >
            <Feather name="edit-3" size={20} color="white" />
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Feather name="log-out" size={20} color="white" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Modal for editing contact number */}
        <Modal
          visible={isEditing}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsEditing(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Edit Contact Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter new contact number"
                value={newContactNumber}
                onChangeText={setNewContactNumber}
                keyboardType="phone-pad"
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleUpdateContactNumber}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  profileImageWrapper: {
    position: "relative",
    marginBottom: 15,
  },
  profileImagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: "white",
  },
  badgeContainer: {
    position: "absolute",
    bottom: -10,
    right: -10,
    backgroundColor: "#e74c3c",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "white",
  },

  badgeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
    marginLeft: 5,
  },
  nameText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  rankText: {
    color: "white",
    fontSize: 16,
    opacity: 0.8,
  },
  detailedInfoContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#3498db",
  },
  detailCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f8fa",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailCardIconContainer: {
    backgroundColor: "#e6f2ff",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  detailCardContent: {
    flex: 1,
  },
  detailCardLabel: {
    color: "#7f8c8d",
    fontSize: 14,
    marginBottom: 5,
  },
  detailCardValue: {
    color: "#2c3e50",
    fontSize: 16,
    fontWeight: "600",
  },
  editProfileButton: {
    flexDirection: "row",
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  editProfileButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 10,
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#e74c3c",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  logoutButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 18,
    marginTop: 15,
    fontWeight: "bold",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: "#3498db",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#e74c3c",
    padding: 10,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default Profile;
