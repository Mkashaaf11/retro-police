import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";
const NearbyPoliceStations = () => {
  const [region, setRegion] = useState<any>(null);
  const [policeStations, setPoliceStations] = useState<any>([]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      getNearbyPoliceStations(latitude, longitude);
    })();
  }, []);

  const getNearbyPoliceStations = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=police&key=${GOOGLE_MAPS_API_KEY}`
      );
      setPoliceStations(response.data.results);
    } catch (error) {
      console.error("Error fetching nearby police stations:", error);
    }
  };

  return (
    <View style={styles.container}>
      {region && (
        <MapView style={styles.map} region={region}>
          <Marker
            coordinate={{
              latitude: region.latitude,
              longitude: region.longitude,
            }}
            title="You are here"
          />
          {policeStations.map((station, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: station.geometry.location.lat,
                longitude: station.geometry.location.lng,
              }}
              title={station.name}
            />
          ))}
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});

export default NearbyPoliceStations;
