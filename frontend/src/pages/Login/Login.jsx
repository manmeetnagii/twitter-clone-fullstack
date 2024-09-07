import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import GoogleButton from "react-google-button";
import axios from "axios";

import { useTranslation } from "react-i18next";
import { Bounce, toast, ToastContainer } from "react-toastify";
import TwitterIcon from "@mui/icons-material/Twitter";
import { Phone } from "@mui/icons-material";
import 'react-phone-number-input/style.css'

import twitterimg from "../../image/twitter.jpeg";
import { useUserAuth } from "../../context/UserAuthContext";
import Modal from "../Settings/Modal";
import Timer from "./Timer";
import '../Settings/settings.css'
import "./Login.css";

const Login = ({ userBrowser, userDevice, userOS, userIP }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingLoading, setIsSubmittingLoading] = useState(false);
  const [isSendLoading, setIsSendLoading] = useState(false);
  const [error, setError] = useState("");
  const [isGoogle, setIsGoogle] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [inputEmailOtpValue, setEmailInputOtpValue] = useState("");
  const [inputEmailValue, setEmailInputValue] = useState("");
  const [emailModal, setEmailModal] = useState(false);
  
  const { logIn, googleSignIn } = useUserAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

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

  const handleEmailOtpSubmit = async () => {
    setIsSendLoading(true);
    setIsLoading(true);
    const otp = inputEmailOtpValue;
    const userEmail = isGoogle ? inputEmailValue : email;

    const bodyData = {userEmail, otp}

    try {
      const response = await axios.post(
        "https://twitter-backend-main.onrender.com/verify-emailOtp",
        { bodyData }
      );

      if (response.data.success === true) {
        setEmailModal(false);
        if (isGoogle) {
          // console.log("signed in with google");
          const res = await googleSignIn();

          const userEmail = res.user.email;

          const systemInfo = {
            email: userEmail,
            browser: userBrowser,
            os: userOS,
            ip: userIP,
            device: userDevice,
          };

          await axios.post("https://twitter-backend-main.onrender.com/systemInfo", { systemInfo },
            {
              headers: {
                "Content-Type": "application/json",
              },
            });

            setIsSendLoading(false);
            navigate("/");
        } 
        else {
          // console.log("signed in with username");
          // console.log(email, password);
          await logIn(email, password);

          const systemInfo = {
            email: email,
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
            }
            catch (error) {
              console.error("Error registering user:", error);
              throw error;
            }
          };

          const data = await registerUser(systemInfo);
        
          if (data) {
            console.log(data);
            navigate("/");
          }
        }
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
   
    const userEmail = isGoogle ? inputEmailValue : email;
    // console.log(userEmail);
    try {
      const response = await axios.post("https://twitter-backend-main.onrender.com/send-emailOtp", {
        userEmail,
      });
      // console.log("Response:", response.data);
      setIsSubmittingLoading(false);
      await setShowOtpModal(true);
    } catch (error) {
      console.error("There was an error in sending otp!", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // console.log("sign in with username");
    setError("");
    setIsGoogle(false);

    try {
      setEmailInputValue(email);
      if (userDevice === "mobile") {
        if (runBetween2To7PMIST()) {
          await logIn(email, password);

          const systemInfo = {
            email: email,
            browser: userBrowser,
            os: userOS,
            ip: userIP,
            device: userDevice 
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

          const data = await registerUser(systemInfo);
          if (data) {
            setIsLoading(false);
            // console.log(data);
            navigate("/");
          }
        } else {
          toast.info(
            "Smartphone users can only access the website between 2pm to 7pm IST"
          );
        }
      } else {
        if (userBrowser === "Chrome") {
          toast.info("Chrome browsers require OTP authentication.");
          setEmailModal(true);
        } else {
          await logIn(email, password);

          const systemInfo = {
            email: email,
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

          const data = await registerUser(systemInfo);
          if (data) {
            console.log(data);
            navigate("/");
          }
        }
      }
    } catch (err) {
      setError(err.message);
      window.alert(err.message);
    }
  };

  const handleCloseEmailModal = () => {
    setEmailModal(false);
    setEmailInputValue("");
    setIsLoading(false)
    setIsSubmittingLoading(false)
    setIsSendLoading(false)
    setShowOtpModal(false);
  };

  const handleGoogleSignIn = async (e) => {
    // console.log("login in with google");
    setIsGoogle(true);
    try {
      if (userDevice === "mobile") {
        // console.log("logging with mobile");
        if (runBetween2To7PMIST() === false) {
          const res = await googleSignIn();
          const userEmail = res.user.email;

          const systemInfo = {
            email: userEmail,
            browser: userBrowser,
            os: userOS,
            ip: userIP,
            device: userDevice,
          };

          await axios.post(
            "https://twitter-backend-main.onrender.com/systemInfo",
            { systemInfo },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          navigate("/");
        } else {
          toast.info(
            "Smartphone users can only access the website between 2pm to 7pm IST"
          );
        }
      } else {
        if (userBrowser === "Chrome") {
          toast.info("Chrome browsers require OTP authentication.");
          setEmailModal(true);
        } else {
          const res = await googleSignIn();
          const userEmail = res.user.email;
          // console.log("loggin with edge");

          const systemInfo = {
            email: userEmail,
            browser: userBrowser,
            os: userOS,
            ip: userIP,
            device: userDevice,
          };
          
          await axios.post(
            "https://twitter-backend-main.onrender.com/systemInfo",
            { systemInfo },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          navigate("/");
        }
      }
    } catch (error) {
      console.log(error.message);
      console.log(error);
    }
  };

  const passwordReset = () => {
    navigate("/password-reset");
  };

  return (
    <>
      <div className="login-container">
        <div className="image-container">
          <img className=" image" src={twitterimg} alt="twitterImage" />
        </div>

        <div className="form-container">
          <div className="form-box">
            <TwitterIcon style={{ color: "skyblue" }} />
            <h2 className="heading">Happening now</h2>

            {error && <p>{error.message}</p>}
            <form onSubmit={handleSubmit}>
              <input
              required
                type="email"
                className="email"
                placeholder="Email address"
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                className="password"
                type="password"
                required
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />

              <div className="btn-login">
             <button className="btnw" type="submit">
               <p>Log In</p>
              {
                isLoading && (
                  <>
                    <div className="spinner"></div>
                  </>
                )
              }
            </button>
                <p
                  onClick={passwordReset}
                  style={{
                    cursor: "pointer",
                    textDecoration: "underline",
                    color: "blue",
                    marginBottom: "2rem",
                    fontWeight:"400"
                  }}
                >
                  Forgot Password?
                </p>
              </div>
            </form>
            <Link to="/phonelogin" style={{textDecoration:"none"}}>
              <div className="btn-login">
                <button type="submit" className="btn-phone">
                <Phone style={{width:"20px"}}/> Login with phone 
                </button>
              </div>
            </Link>
            <div>
              <GoogleButton
                className="g-btn"
             
                onClick={handleGoogleSignIn}
              />
            </div>
          </div>
          <div>
            Don't have an account?
            <Link
              to="/signup"
              style={{
                textDecoration: "none",
                color: "var(--twitter-color)",
                fontWeight: "600",
                marginLeft: "5px",
              }}
            >
              Sign up
            </Link>
          </div>
        </div>
        {emailModal && (
          <Modal show={emailModal} >
            <div className="closebtn">
               <button className="close" onClick={handleCloseEmailModal}>
          &times;
        </button>
               </div>
            <h2 style={{ marginBottom: "0.5rem" }}>
              {t("settings.verifyEmail")}
            </h2>
            <p style={{ fontWeight: "400" }}>{t("settings.desc1")} {t("settings.desc2")}</p>
            <div style={{ marginTop: "1rem" }}>
              <input
              className="input"
                value={inputEmailValue}
                placeholder={t("settings.enterEmail")}
                onChange={(e) => setEmailInputValue(e.target.value)}
              />
              <button   className="submit-btn"
                onClick={handleEmailSubmit}
                disabled={showOtpModal}>
              {
                isSubmittingLoading ? (
                  <>
                    <p>Sending</p>
                    <div className="spinner"></div>
                  </>
                ) : (

                  <p>{t("settings.btn")}</p>
                )
              }
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
                  <button   className="submit-btn" onClick={handleEmailOtpSubmit}>
              {
                isSendLoading ? (
                  <>
                    <p>Submittig</p>
                    <div className="spinner"></div>
                  </>
                ) : (

                  <p>{t("settings.btn")}</p>
                )
              }
            </button>
      
                </div>
                <Timer email={inputEmailValue} />
              </>
            )}
          </Modal>
        )}
        <ToastContainer
          position="bottom-right"
          theme="dark"
          transition={Bounce}
        />
      </div>
    </>
  );
};

export default Login;
