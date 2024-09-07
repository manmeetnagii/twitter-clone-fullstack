import React, { useState, useEffect } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import twitterimg from "../../image/twitter.jpeg";
import TwitterIcon from "@mui/icons-material/Twitter";
import { useTranslation } from "react-i18next";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../context/firebase";
import axios from "axios";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";

function Mobile({ userBrowser, userDevice, userOS, userIP }) {
  const [confirmResult, setConfirmResult] = useState(null);
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [value, setValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response) => {
            console.log("reCAPTCHA solved");
          },
          "expired-callback": () => {
            console.log("reCAPTCHA expired. Please try again.");
          },
        }
      );
    }
  }, []);

  const validatePhoneNumber = () => {
    const regexp = /^\+[0-9]?()[0-9](\s|\S)(\d[0-9]{8,16})$/;
    return regexp.test(value);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log(value);

    if (validatePhoneNumber()) {
      try {
        const appVerifier = window.recaptchaVerifier;
        const confirmationResult = await signInWithPhoneNumber(
          auth,
          value,
          appVerifier
        );
        setConfirmResult(confirmationResult);
        setSuccess(true);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    } else {
      setError("Invalid Phone Number");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (otp.length === 6 && confirmResult) {
      try {
        const userCredential = await confirmResult.confirm(otp);
        setIsLoading(false);
        const user = {
          phoneNumber: value.replace("+", ""),
          name: name,
        };
        const systemInfo = {
          phoneNumber: value.replace("+", ""),
          browser: userBrowser,
          os: userOS,
          ip: userIP,
          device: userDevice,
        };
        const registerUser = async (user, systemInfo) => {
          try {
            const registerSystemResponse = await axios.post(
              "https://twitter-backend-main.onrender.com/systemInfo",
              { systemInfo },
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
            const registerUserResponse = await axios.post(
              "https://twitter-backend-main.onrender.com/register",
              { user },
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
            return registerSystemResponse.data, registerUserResponse.data;
          } catch (error) {
            console.error("Error registering user:", error);
            throw error;
          }
        };

        const data = await registerUser(user, systemInfo);
        if (data) {
          console.log(data);
          navigate("/");
        }
      } catch (error) {
        setError(error.message);
      }
    } else {
      setError("Please enter a six-digit OTP code");
    }
  };

  return (
    <div className="login-container">
      <div className="image-container">
        <img className="image" src={twitterimg} alt="twitterImage" />
      </div>

      <div className="form-container">
        <div className="form-box">
          <TwitterIcon style={{ color: "skyblue" }} />
          <h2 className="heading">{t("Happening now")}</h2>

          {error && (
            <p className="error-message" style={{ color: "red" }}>
              {error}
            </p>
          )}
          {success && (
            <p className="success-message">{t("OTP Sent Successfully")}</p>
          )}

          <form className="form-container" onSubmit={handleSendOtp}>
            <input
              className="email"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter Name"
            />

            <div className="number-div">
              <PhoneInput
                international
                countryCallingCodeEditable={false}
                defaultCountry="IN"
                value={value}
                onChange={setValue}
              />
            </div>
            <button className="btnw" type="submit">
              {isLoading ? (
                <>
                  <p>Sending OTP</p>
                  <div className="spinner"></div>
                </>
              ) : (
                <p>{t("Send OTP")}</p>
              )}
            </button>
          </form>
          <div className="otp-container">
            <div>
              {confirmResult && (
                <form onSubmit={handleVerifyOtp}>
                  <input
                    type="text"
                    className="email"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder={t("Enter OTP")}
                  />
                  <button className="btn" type="submit">
                    Verify OTP
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      <div id="recaptcha-container"></div>
    </div>
  );
}

export default Mobile;
