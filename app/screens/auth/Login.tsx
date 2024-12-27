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
        <Text style={styles.title}>Welcome Back</Text>

        <View style={styles.inputContainer}>
          <MaterialIcons
            name="email"
            size={24}
            color="#4A90E2"
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
            color="#4A90E2"
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
              color="#4A90E2"
            />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#4A90E2" />
        ) : (
          <>
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={handleSignup}
            >
              <Text style={styles.buttonTextSecondary}>Sign Up</Text>
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
    backgroundColor: "#f7faff", // Subtle blue background
  },
  title: {
    fontSize: 28,
    color: "#2D3A45", // Dark blue-gray text color
    marginBottom: 24,
    textAlign: "center",
    fontWeight: "bold",
    fontFamily: "Roboto",
  },
  button: {
    backgroundColor: "#4A90E2", // Primary blue
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
    elevation: 3, // Shadow for buttons
  },
  buttonSecondary: {
    borderWidth: 1,
    borderColor: "#4A90E2", // Blue border for secondary button
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    elevation: 0,
  },
  buttonText: {
    color: "#fff", // White text for button
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonTextSecondary: {
    color: "#4A90E2", // Blue text for secondary button
    fontSize: 16,
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    marginBottom: 20,
    position: "relative", // Relative positioning to place the icon inside
  },
  input: {
    flex: 1,
    paddingVertical: 10,
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
