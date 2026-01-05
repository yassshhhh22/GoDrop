import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  TextInput,
  ActivityIndicator,
} from "react-native";
import useAuthStore from "../stores/authStore";
import useCartStore from "../stores/cartStore";
import useConfigStore from "../stores/configStore";
import { validateOTP } from "../utils/validators";
import { showError, showSuccess } from "../utils/alerts";

const VerifyOTPScreen = ({ navigation, route }) => {
  const phone = route?.params?.phone || "";
  const role = route?.params?.role || "customer";
  const { verifyOTP, isLoading } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { fetchAllConfig } = useConfigStore();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(30);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleVerify = async () => {
    const { isValid, error } = validateOTP(otp);
    if (!isValid) {
      showError(error);
      return;
    }
    try {
      await verifyOTP(phone, otp, role);
      await Promise.allSettled([fetchAllConfig(), fetchCart()]);
      showSuccess("Logged in!");
      navigation.reset({
        index: 0,
        routes: [{ name: "HomeTabs" }],
      });
    } catch (err) {
      showError(err?.message || "Invalid OTP");
    }
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setOtp("");
    setResendTimer(30);
  };

  const maskedPhone = phone
    ? phone.replace(/^(\d{2})(\d{6})(\d{2})$/, (m, a, b, c) => `${a}******${c}`)
    : "";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Phone</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code sent to {maskedPhone || "your phone"}
      </Text>

      <TextInput
        keyboardType="number-pad"
        placeholder="Enter 6-digit OTP"
        value={otp}
        onChangeText={setOtp}
        maxLength={6}
        style={styles.otpInput}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        onPress={handleVerify}
        disabled={isLoading}
        style={[
          styles.verifyButton,
          { backgroundColor: isLoading ? "#999" : "#3dba49ff" },
        ]}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.verifyText}>Verify & Login</Text>
        )}
      </TouchableOpacity>

      {/* Resend Section */}
      <View style={styles.resendRow}>
        <Text style={styles.resendText}>Didn't receive the code?</Text>
        <TouchableOpacity onPress={handleResend} disabled={resendTimer > 0}>
          <Text
            style={[
              styles.resendButton,
              resendTimer > 0 && styles.resendDisabled,
            ]}
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafad0ff",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#3dba49ff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  otpInput: {
    width: "80%",
    height: 60,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#3dba49ff",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 22,
    color: "#3dba49ff",
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  verifyButton: {
    width: "80%",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  verifyText: {
    color: "#fff",
    fontWeight: "600",
  },
  resendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 25,
  },
  resendText: {
    color: "#666",
    fontSize: 14,
  },
  resendButton: {
    color: "#3dba49ff",
    marginLeft: 8,
    fontWeight: "600",
  },
  resendDisabled: {
    color: "#9acb9e",
  },
});

export default VerifyOTPScreen;
