import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useProfile } from "../../../providers/ProfileContext";
import { supabase } from "../../../lib/supabase";

const Profile = () => {
  const { session } = useProfile();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the profile data once the session is available
    const fetchProfileData = async () => {
      if (session?.user?.email) {
        setLoading(true);
        const { data, error } = await supabase
          .from("officers") // Your table name
          .select("*") // Select all columns, or specify the ones you need
          .eq("email", session.user.email) // Match by email
          .single(); // Expecting a single row, adjust if necessary

        if (error) {
          console.error("Error fetching profile data:", error);
        } else {
          setProfileData(data);
        }
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [session]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No profile data found</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Profile Screen</Text>
      <Text>ID: {profileData.id}</Text>
      <Text>Name: {profileData.name}</Text>
      <Text>Email: {profileData.email}</Text>
      <Text>Rank: {profileData.rank}</Text>
      <Text>Badge_number: {profileData.badge_number}</Text>
    </View>
  );
};

export default Profile;
