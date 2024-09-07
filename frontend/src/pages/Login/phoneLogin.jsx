import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import twitterimg from "../../image/twitter.jpeg";
import { auth } from "../../context/firebase";
import TwitterIcon from "@mui/icons-material/Twitter";
import { useTranslation } from "react-i18next";
import axios from "axios";
import 'react-phone-number-input/style.css'
import PhoneInput from 'react-phone-number-input'
import "./Login.css";

function Mobile({ userBrowser, userDevice, userOS, userIP }) {
  
  const [confirmResult, setConfirmResult] = useState(null);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [value, setValue] = useState();
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
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
        },
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
        setIsLoading(false);
      } catch (error) {
        setError(error.message);
      }
    } else {
      setError("Invalid Phone Number");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length === 6 && confirmResult) {
      try {
        await confirmResult.confirm(otp);
        setIsSigning(true);
       
        const systemInfo = {
          phoneNumber: value.replace("+", ""),
          browser: userBrowser,
          os: userOS,
          ip: userIP,
          device: userDevice,  
        };

        const registerUser = async (systemInfo) => {
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
           
            return registerSystemResponse.data;
          } catch (error) {
            console.error("Error registering user:", error);
            throw error;
          }
        };

        const data = await registerUser( systemInfo);
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

          {error && <p className="error-message" style={{color:"red"}}>{error}</p>}
          {success && (
            <p className="success-message">{t("OTP Sent Successfully")}</p>
          )}

          <form className="form-container" onSubmit={handleSendOtp}>
                <h4> Enter Phone Number</h4>
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
              {
                isLoading ? (
                  <>
                    <p>Sending OTP</p>
                    <div className="spinner"></div>
                  </>
                ) : (

                  <p>{t("Send OTP")}</p>
                )
              }
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
              <button className="btnw" type="submit">
              {
                isSigning ? (
                  <>
                    <p>Verifying OTP</p>
                    <div className="spinner"></div>
                  </>
                ) : (

                  <p>{t("Verify OTP")}</p>
                )
              }
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
