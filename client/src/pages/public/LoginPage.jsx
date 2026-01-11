import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import useAuthStore from "../../stores/authStore.js";
import logo from "../../assets/icon.png";
import textLogo from "../../assets/text.png";

const LoginPage = () => {
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Customer");
  const navigate = useNavigate();

  const { sendOTP, verifyOTP, isLoading, getRedirectPath } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      phone: "",
      otp: "",
    },
  });

  const handleSendOTP = async (data) => {
    let formattedPhone = data.phone.trim().replace(/[^\d+]/g, "");
    if (!formattedPhone.startsWith("+91")) {
      formattedPhone = formattedPhone.replace(/^0+/, "");
      formattedPhone = `+91${formattedPhone}`;
    }
    const success = await sendOTP(formattedPhone, role);
    if (success) {
      setPhone(formattedPhone);
      setStep("otp");
    }
  };

  const handleVerifyOTP = async (data) => {
    const success = await verifyOTP(phone, data.otp, role);
    if (success) {
      const redirectPath = getRedirectPath();
      navigate(redirectPath);
    }
  };

  const handleBackToPhone = () => {
    setStep("phone");
    setPhone("");
    reset();
  };

  return (
    <section className="w-full min-h-screen flex items-center justify-center bg-gray-50 px-2">
      <div
        className="bg-white w-full max-w-xl rounded-2xl p-0 relative flex flex-col justify-center shadow-md border border-gray-200"
        style={{ maxHeight: "95vh", minHeight: "480px" }}
      >
        {/* Logo Row */}
        <div className="flex justify-center items-center w-full mb-6 mt-8 gap-4">
          <img
            src={logo}
            alt="GoDrop Logo"
            style={{ width: 90, height: 90, objectFit: "contain" }}
          />
          <img
            src={textLogo}
            alt="Text Logo"
            style={{ height: 60, width: "auto", objectFit: "contain" }}
          />
        </div>
        {/* Content Container */}
        <div className="flex flex-col items-center w-full px-2 py-8">
          {/* Login as */}
          <div className="w-full max-w-md flex flex-col items-center mb-2">
            <label className="text-base font-semibold text-gray-900 mb-2 text-center w-full">
              Login as:
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-secondary-50 border border-gray-200 rounded-lg px-4 py-2 text-base font-medium text-gray-900 focus:outline-none focus:border-primary-600 transition-all duration-200 shadow-sm appearance-none text-center"
              style={{
                boxShadow: "0 1px 3px 0 rgba(0,0,0,0.03)",
                minHeight: 44,
                textAlignLast: "center",
              }}
            >
              <option value="Customer">Customer</option>
              <option value="BusinessUser">Business</option>
              <option value="DeliveryPartner">Partner</option>
            </select>
          </div>
          <div className="h-5" />
          {/* Input Field */}
          <form
            className="flex flex-col items-center w-full max-w-md gap-5"
            onSubmit={
              step === "phone"
                ? handleSubmit(handleSendOTP)
                : handleSubmit(handleVerifyOTP)
            }
          >
            <div className="w-full mb-2">
              {step === "phone" ? (
                <div
                  className="flex items-center bg-secondary-50 border border-gray-200 rounded-xl
                    transition-all duration-200 focus-within:border-primary-600
                    h-12 px-4"
                >
                  <span className="pr-3 text-gray-700 font-medium text-base">
                    +91
                  </span>
                  <input
                    type="tel"
                    className="w-full bg-transparent outline-none text-gray-900 text-base font-semibold placeholder:text-gray-400 h-full text-center"
                    placeholder="Enter mobile number"
                    style={{
                      textAlign: "center",
                      letterSpacing: "normal",
                    }}
                    maxLength={10}
                    {...register("phone", {
                      required: "Phone number is required",
                      pattern: {
                        value: /^(\+91)?[6-9]\d{9}$/,
                        message: "Please enter a valid phone number",
                      },
                    })}
                  />
                </div>
              ) : (
                <div className="flex justify-center w-full">
                  <input
                    type="text"
                    maxLength={6}
                    className="w-full max-w-[340px] bg-secondary-50 p-4 border rounded-xl 
                               outline-none focus:border-primary-600
                               transition-all duration-200 text-center text-3xl tracking-[0.7em] font-semibold text-gray-900"
                    placeholder="------"
                    style={{
                      letterSpacing: "0.7em",
                      fontSize: "2.2rem",
                      fontWeight: 500,
                    }}
                    {...register("otp", {
                      required: "OTP is required",
                      pattern: {
                        value: /^[0-9]{6}$/,
                        message: "Please enter a valid 6-digit OTP",
                      },
                    })}
                  />
                </div>
              )}
              {step === "phone" && errors.phone && (
                <p className="text-error text-sm mt-2 leading-relaxed text-right pr-2">
                  {errors.phone.message}
                </p>
              )}
              {step === "otp" && errors.otp && (
                <p className="text-error text-sm text-center mt-3 leading-relaxed">
                  {errors.otp.message}
                </p>
              )}
            </div>
            {/* Subtitle for OTP */}
            {step === "otp" && (
              <p className="text-secondary-500 text-base leading-relaxed mb-2 text-center w-full">
                {`Enter the 6-digit code sent to ${phone}`}
              </p>
            )}
            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                         text-gray-50 py-3 rounded-xl font-semibold transition-all duration-200
                         focus:outline-none text-base"
              style={{ minHeight: "48px" }}
            >
              {isLoading
                ? step === "phone"
                  ? "Sending OTP..."
                  : "Verifying..."
                : step === "phone"
                ? "Continue"
                : "Verify OTP"}
            </button>
            {/* Back Button */}
            {step === "otp" && (
              <button
                type="button"
                onClick={handleBackToPhone}
                className="w-full text-primary-600 hover:text-primary-700 text-sm font-medium
                           py-2 transition-colors duration-200 focus:outline-none rounded mx-auto"
              >
                ← Change Phone Number
              </button>
            )}
          </form>
        </div>
        {/* Info Text */}
        <div className="mt-4 p-3 bg-secondary-50 border border-gray-200 rounded-b-2xl">
          <p className="text-xs text-secondary-600 text-center">
            By continuing, you agree to our{" "}
            <Link to="/terms" className="text-primary-600 hover:underline">
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-primary-600 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
