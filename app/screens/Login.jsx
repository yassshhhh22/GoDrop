import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  View,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import useAuthStore from "../stores/authStore";
import { validatePhone } from "../utils/validators";
import { showError, showSuccess } from "../utils/alerts";

const LoginScreen = ({ navigation }) => {
  const { sendOTP, isLoading } = useAuthStore();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState("customer");

  const handleSendOTP = async () => {
    const { isValid, error } = validatePhone(phone);
    if (!isValid) {
      showError(error);
      return;
    }
    try {
      await sendOTP(phone, role);
      showSuccess("OTP sent!");
      setTimeout(() => {
        navigation.navigate("VerifyOTP", { phone, role });
      }, 100);
    } catch (err) {
      showError(err?.message || "Failed to send OTP");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBackground} />

      <View style={styles.illustrationContainer}>
        <View style={styles.illustrationCircle}>
          <Image
            source={require("../assets/images/image.png")}
            style={styles.illustrationImage}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={styles.contentCard}>
        <Text style={styles.title}>Login</Text>

        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              role === "customer" && styles.roleButtonActive,
            ]}
            onPress={() => setRole("customer")}
          >
            <Ionicons
              name="person"
              size={20}
              color={role === "customer" ? "#fff" : "#666"}
            />
            <Text
              style={[
                styles.roleText,
                role === "customer" && styles.roleTextActive,
              ]}
            >
              Customer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.roleButton,
              role === "businessUser" && styles.roleButtonActive,
            ]}
            onPress={() => setRole("businessUser")}
          >
            <Ionicons
              name="briefcase"
              size={20}
              color={role === "businessUser" ? "#fff" : "#666"}
            />
            <Text
              style={[
                styles.roleText,
                role === "businessUser" && styles.roleTextActive,
              ]}
            >
              Business
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.roleButton,
              role === "deliveryPartner" && styles.roleButtonActive,
            ]}
            onPress={() => setRole("deliveryPartner")}
          >
            <Ionicons
              name="bicycle"
              size={20}
              color={role === "deliveryPartner" ? "#fff" : "#666"}
            />
            <Text
              style={[
                styles.roleText,
                role === "deliveryPartner" && styles.roleTextActive,
              ]}
            >
              Delivery
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <View style={styles.countryCodeBox}>
            <Text style={styles.countryCode}>+91</Text>
          </View>
          <TextInput
            style={styles.phoneInput}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter Mobile Number"
            placeholderTextColor="#aaa"
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.otpNote}>
          We will send you one time password (OTP)
        </Text>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleSendOTP}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name="arrow-forward" size={28} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Bottom Wave */}
      <View style={styles.bottomWave}>
        <Svg
          width="100%"
          height="140"
          viewBox="0 0 1440 320"
          style={styles.svg}
        >
          <Path
            fill="#D6E8FF"
            d="
              M0,224 
              C360,320 480,64 840,160 
              C1200,256 1320,32 1440,96 
              L1440,320 
              L0,320 
              Z
            "
          />
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#5D87FF",
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
    padding: 0,
  },
  topBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "#5D87FF",
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  bottomWave: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  svg: {
    position: "absolute",
    bottom: 0,
  },
  illustrationContainer: {
    position: "absolute",
    top: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  illustrationCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 25,
    elevation: 15,
    padding: 15,
  },
  illustrationImage: {
    width: 130,
    height: 130,
  },
  contentCard: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingVertical: 40,
    paddingHorizontal: 30,
    alignItems: "center",
    marginTop: 120,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 20,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
    width: "100%",
  },
  roleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    borderWidth: 2,
    borderColor: "#e2e8f0",
    gap: 6,
  },
  roleButtonActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  roleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#666",
  },
  roleTextActive: {
    color: "#fff",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },
  countryCodeBox: {
    backgroundColor: "#f1f5f9",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  countryCode: {
    fontSize: 16,
    fontWeight: "700",
    color: "#475569",
  },
  phoneInput: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    color: "#1e293b",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  error: {
    color: "#ef4444",
    fontSize: 13,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  otpNote: {
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 30,
    textAlign: "center",
    lineHeight: 18,
  },
  continueButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
});

export default LoginScreen;
