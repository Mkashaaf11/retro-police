//Login.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "../../../lib/supabase";

const Login = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      Alert.alert("Login successful!");
    } catch (error) {
      Alert.alert("Login failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        throw error;
      }

      if (!data?.user) {
        Alert.alert("Please check your inbox for email verification!");
        return;
      }
    } catch (error) {
      Alert.alert("Signup failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="padding">
        <Text style={styles.title}>Login</Text>

        <View style={styles.inputContainer}>
          <MaterialIcons
            name="email"
            size={24}
            color="#6dbf44"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888888"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <MaterialIcons
            name="lock"
            size={24}
            color="#6dbf44"
            style={styles.icon}
          />
          <TextInput
            style={[styles.input, { paddingRight: 40 }]}
            placeholder="Password"
            placeholderTextColor="#888888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword((prev) => !prev)}
            style={styles.eyeIconContainer}
          >
            <MaterialIcons
              name={showPassword ? "visibility" : "visibility-off"}
              size={24}
              color="#6dbf44"
            />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#6dbf44" />
        ) : (
          <>
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSignup}>
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f7f7f7", // Light background
  },
  title: {
    fontSize: 24,
    color: "#333333", // Dark text color
    marginBottom: 24,
    textAlign: "center",
    fontWeight: "bold",
  },

  button: {
    backgroundColor: "#6dbf44", // Green background for buttons
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
    elevation: 3, // Shadow for buttons
  },
  buttonText: {
    color: "#fff", // White text for button
    fontSize: 16,
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 10,
    position: "relative", // Relative positioning to place the icon inside
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#333333",
    backgroundColor: "transparent",
  },
  eyeIconContainer: {
    position: "absolute",
    right: 10,
  },
  icon: {
    marginRight: 8,
  },
});

export default Login;
