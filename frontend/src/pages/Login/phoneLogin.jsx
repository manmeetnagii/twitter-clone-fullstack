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
import Modal from "../Settings/Modal";
import Timer from "./Timer";
import "./Login.css";
import { Bounce, toast, ToastContainer } from "react-toastify";

function Mobile({ userBrowser, userDevice, userOS, userIP }) {
  
  const [confirmResult, setConfirmResult] = useState(null);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [value, setValue] = useState();
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [isSubmittingLoading, setIsSubmittingLoading] = useState(false);
  const [isSendLoading, setIsSendLoading] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
   const [inputEmailOtpValue, setEmailInputOtpValue] = useState("");
  const [inputEmailValue, setEmailInputValue] = useState("");
    const [emailModal, setEmailModal] = useState(false);
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

  const handleEmailOtpSubmit = async () => {
    setIsSendLoading(true);
    setIsLoading(true);
    const otp = inputEmailOtpValue;
    const userEmail = inputEmailValue;

    const bodyData = { userEmail, otp };

    try {
      const response = await axios.post(
        "https://twitter-backend-main.onrender.com/verify-emailOtp",
        { bodyData }
      );

      if (response.data.success === true) {
        setEmailModal(false);
        const appVerifier = window.recaptchaVerifier;
            const confirmationResult = await signInWithPhoneNumber(
              auth,
              value,
              appVerifier
            );
            setConfirmResult(confirmationResult);
            setSuccess(true);
            setIsLoading(false);
      }
      // console.log(response.data.msg);
      // console.log("Response:", response.data.success);
    } catch (error) {
      console.error("There was an error!", error.response.data.msg);
    }
  };

  const handleEmailSubmit = async () => {
    // console.log(isGoogle);
    setIsSubmittingLoading(true);
    setIsLoading(false);

    const userEmail = inputEmailValue;
    // console.log(userEmail);
    try {
      const response = await axios.post(
        "https://twitter-backend-main.onrender.com/send-emailOtp",
        {
          userEmail,
        }
      );
      // console.log("Response:", response.data);
      setIsSubmittingLoading(false);
      setShowOtpModal(true);
    } catch (error) {
      console.error("There was an error in sending otp!", error);
    }
  };

  const handleCloseEmailModal = () => {
    setEmailModal(false);
    setEmailInputValue("");
    setIsLoading(false);
    setIsSubmittingLoading(false);
    setIsSendLoading(false);
    setShowOtpModal(false);
  };

  function runBetween2To7PMIST() {
    const now = new Date();

    const UTCtoIST = 5.5 * 60 * 60 * 1000;
    const ISTTime = new Date(now.getTime() + UTCtoIST);

    const hours = ISTTime.getUTCHours();
    const minutes = ISTTime.getUTCMinutes();

    if (
      (hours > 10 && hours < 13) ||
      (hours === 10 && minutes >= 0) ||
      (hours === 13 && minutes === 0)
    ) {
      return true;
    } else {
      return false;
    }
  }

  const validatePhoneNumber = () => {
    const regexp = /^\+[0-9]?()[0-9](\s|\S)(\d[0-9]{8,16})$/;
    return regexp.test(value);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    if(userDevice === "mobile"){
      if(runBetween2To7PMIST()){
        
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
      }
      else{
        toast.info(
          "Smartphone users can only access the website between 10am to 1pm IST"
        );
        setIsLoading(false);
      }
    }
    else{
      if(userBrowser==="Chrome"){
        toast.info("Chrome browsers require OTP authentication.");
        await setEmailModal(true);
      }
      else{
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
      }
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
      {emailModal && (
          <Modal show={emailModal}>
            <div className="closebtn">
              <button className="close" onClick={handleCloseEmailModal}>
                &times;
              </button>
            </div>
            <h2 style={{ marginBottom: "0.5rem" }}>
              {t("settings.verifyEmail")}
            </h2>
            <p style={{ fontWeight: "400" }}>
              {t("settings.desc1")} {t("settings.desc2")}
            </p>
            <div style={{ marginTop: "1rem" }}>
              <input
                className="input"
                value={inputEmailValue}
                placeholder={t("settings.enterEmail")}
                onChange={(e) => setEmailInputValue(e.target.value)}
              />
              <button
                className="submit-btn"
                onClick={handleEmailSubmit}
                disabled={showOtpModal}
              >
                {isSubmittingLoading ? (
                  <>
                    <p>Sending</p>
                    <div className="spinner"></div>
                  </>
                ) : (
                  <p>{t("settings.btn")}</p>
                )}
              </button>
            </div>
            {showOtpModal && (
              <>
                <div>
                  <label>
                    <input
                      className="input"
                      value={inputEmailOtpValue}
                      placeholder={t("settings.enterOtp")}
                      onChange={(e) => setEmailInputOtpValue(e.target.value)}
                    />
                  </label>
                  <button className="submit-btn" onClick={handleEmailOtpSubmit}>
                    {isSendLoading ? (
                      <>
                        <p>Submittig</p>
                        <div className="spinner"></div>
                      </>
                    ) : (
                      <p>{t("settings.btn")}</p>
                    )}
                  </button>
                </div>
                <Timer email={inputEmailValue} />
              </>
            )}
          </Modal>
        )}
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
