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
import { Bounce, toast, ToastContainer } from "react-toastify";
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

  function runBetween2To7PMIST() {
    const now = new Date();

    const UTCtoIST = 5.5 * 60 * 60 * 1000;
    const ISTTime = new Date(now.getTime() + UTCtoIST);

    const hours = ISTTime.getUTCHours();
    const minutes = ISTTime.getUTCMinutes();

    if ( (hours > 10 && hours < 13) || (hours === 10 && minutes >= 0) || (hours === 13 && minutes === 0)) {
      return true;
    } 
    else {
      return false;
    }
  }

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    console.log(value);

    if(!runBetween2To7PMIST()){
      toast.info("Smartphone users can only access the website between 10am to 1pm IST")
      setIsLoading(false);
    }

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
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    } else {
      setError("Invalid Phone Number");
      setIsLoading(false);
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
              "https://backend2-4wgi.onrender.com/systemInfo",
              { systemInfo },
              {
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
            const registerUserResponse = await axios.post(
              "https://backend2-4wgi.onrender.com/register",
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
        setIsLoading(false);
      }
    } else {
      setError("Please enter a six-digit OTP code");
      setIsLoading(false);
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
      <ToastContainer
          position="bottom-right"
          theme="dark"
          transition={Bounce}
        />
    </div>
  );
}

export default Mobile;
