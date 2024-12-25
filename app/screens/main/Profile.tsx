import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useProfile } from "../../../providers/ProfileContext";
import { supabase } from "../../../lib/supabase";

const { width } = Dimensions.get("window");

const Profile = () => {
  const { session } = useProfile();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(null);

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
            try {
              const { data: imageData, error: imageError } =
                await supabase.storage
                  .from("profile_photos")
                  .download(data.profile_picture);

              if (imageError) {
                console.error("Error downloading image:", imageError);
              } else if (imageData) {
                setProfileImage(URL.createObjectURL(imageData));
              }
            } catch (downloadError) {
              console.error("Image download failed:", downloadError);
            }
          }
        }
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [session]);

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
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageWrapper}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <MaterialIcons name="local-police" size={80} color="#ffffff" />
              </View>
            )}
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>
                {profileData.badge_number || "Badge"}
              </Text>
            </View>
          </View>

          <Text style={styles.nameText}>
            {profileData.name || "Officer Name"}
          </Text>
          <Text style={styles.rankText}>{profileData.rank || "Rank"}</Text>
        </View>

        {/* Detailed Information Container */}
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
            value={profileData.phone || "Not provided"}
          />

          {/* Edit Profile Button */}
          <TouchableOpacity style={styles.editProfileButton}>
            <Feather name="edit-3" size={20} color="white" />
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
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
});

export default Profile;
