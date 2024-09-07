import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-input-2";
import axios from "axios";
import "react-phone-input-2/lib/style.css";
import "./settings.css";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import { useUserAuth } from "../../context/UserAuthContext";
import i18n from "../../i18n/i18n";
import Modal from "./Modal";
import OTPCountdown from "./OtpTimer";
import EmailModal from "./EmailModal";
import { useNavigate } from "react-router-dom";
import { Bounce, toast, ToastContainer } from "react-toastify";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish (Española)" },
  { code: "hi", name: "Hindi (हिंदी)" },
  { code: "pt", name: "Portuguese (Português)" },
  { code: "zh", name: "Chinese (中國人)" },
  { code: "fr", name: "French (Française)" },
];

const Settings = () => {
  const { t } = useTranslation();
  const { user } = useUserAuth();

  const navigate = useNavigate();
  const [isLoading, setIsloading] = useState(false);
  const [isLoadingg, setIsloadingg] = useState(false);
  const [phoneNumber, setPhone] = useState("");
  const [codeState, setCodeState] = useState("");
  const [inputOtpValue, setInputOtpValue] = useState("");
  const [inputEmailOtpValue, setEmailInputOtpValue] = useState("");
  const [locale, setLocale] = useState(i18n.language);
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [emailModal, setEmailModal] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const currentLanguage = languages.find((lang) => lang.code === locale);

  useEffect(() => {
    const handleLanguageChange = (lng) => setLocale(i18n.language);
    i18n.on("languageChanged", handleLanguageChange);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLanguageChange = async (code) => {
    setCodeState(code);
    if (code === locale) {
      return;
    }
    if (code === "en" || code === "hi" || code === "es" || code === "zh" || code === "pt") {
      setShowModal(true);
    } 
    else if (code === "fr") {
      if (!user.email) {
        toast.info("French is access to the users with email registration");
      } 
      else {
        console.log("EMAIL MODAL OPEN");
        setEmailModal(true);
        handleEmailSubmit();
      }
    }
  };

  const handlePhoneNumberSubmit = async (e) => {
    e.preventDefault();
    setIsloading(true);
    try {
      const response = await axios.post(
        "https://twitter-backend-main.onrender.com/send-phoneOtp",
        { phoneNumber }
      );
      console.log("Response:", response.data);
      setIsloading(false);
      setShowOtpModal(true);
    } catch (error) {
      console.error("There was an error in sending otp!", error);
    }
  };

  const handlePhoneOtpSubmit = async (e) => {
    e.preventDefault();
    setIsloadingg(true);
    const otp = inputOtpValue;
    const phoneNumber2 = "+" + phoneNumber;
    const bodyData = {
      phoneNumber2,
      otp,
    };
    try {
      const response = await axios.post(
        "https://twitter-backend-main.onrender.com/verify-phoneOtp",
        { bodyData }
      );
      if (response.data.success === true) {
        await i18n.changeLanguage(codeState);
        setShowModal(false);
        setShowOtpModal(false);
        setIsOpen(false);
        setIsloadingg(false);
        setInputOtpValue("");
      }
      // console.log(response.data.msg);
      // console.log("Response:", response.data.success);
    } catch (error) {
      console.error("There was an error!", error.response.data.msg);
    }
  };

  const handleEmailSubmit = async () => {
    const userEmail = user.email;
    try {
      const response = await axios.post(
        "https://twitter-backend-main.onrender.com/send-emailOtp",
        { userEmail }
      );
      // console.log("Response:", response.data);
    } catch (error) {
      console.error("There was an error in sending otp!", error);
    }
  };

  const handleEmailOtpSubmit = async (e) => {
    e.preventDefault();
    const otp = inputEmailOtpValue;
    const userEmail = user.email;

    const bodyData = {
      userEmail,
      otp,
    };

    try {
      const response = await axios.post(
        "https://twitter-backend-main.onrender.com/verify-emailOtp",
        { bodyData }
      );

      if (response.data.success === true) {
        await i18n.changeLanguage(codeState);
        setEmailModal(false);
        setPhone("");
        setIsOpen(false);
        setEmailInputOtpValue("");
      }
      // console.log(response.data.msg);
      // console.log("Response:", response.data.success);
    } catch (error) {
      console.error("There was an error!", error.response.data.msg);
    }
  };

  const toggleDropdown = () => setIsOpen(!isOpen);

  const dropdownRef = useRef(null);
  
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowOtpModal(false);
    setIsloading(false);
    setIsloadingg(false);
    setInputOtpValue("");
    setPhone("");
  };

  const handleCloseEmailModal = () => {
    setEmailModal(false);
    setEmailInputOtpValue("");
  };

  return (
    <div className="setting">
      <div className="feed__headere">
        <h2>{t("sidebar.settings")}</h2>
      </div>
      <div className="settings">
        <div className="inner">
          <p>{t("language")}</p>
          <button className="dropdown-toggle" onClick={toggleDropdown}>
            {currentLanguage ? currentLanguage.name : t("language")}
          </button>
          {isOpen && (
            <ul ref={dropdownRef} className="dropdown-menu">
              {languages.map((lang) => (
                <li
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  {lang.name}
                </li>
              ))}
            </ul>
          )}
          {showModal && (
            <Modal show={showModal}>
              <div className="closebtn">
                <button className="close" onClick={handleCloseModal}>
                  &times;
                </button>
              </div>
              <h2 style={{ marginBottom: "0.5rem" }}>
                {t("settings.verifyNumber")}
              </h2>
              <p style={{ fontWeight: "400" }}>{t("settings.desc")}</p>
              <form
                onSubmit={handlePhoneNumberSubmit}
                style={{ marginTop: "1rem" }}
              >
                <PhoneInput
                  className="number"
                  country={"in"}
                  value={phoneNumber}
                  onChange={(phoneNumber) => setPhone(phoneNumber)}
                />
                <button
                  className="submit-btn"
                  type="submit"
                  disabled={showOtpModal}
                >
                  {isLoading ? (
                    <>
                      <p>Sending</p>
                      <div className="spinner"></div>
                    </>
                  ) : (
                    <p>{t("settings.btn")}</p>
                  )}
                </button>
              </form>

              {showOtpModal && (
                <>
                  <div>
                    <label>
                      <input
                        className="input"
                        value={inputOtpValue}
                        placeholder={t("settings.enterOtp")}
                        onChange={(e) => setInputOtpValue(e.target.value)}
                      />
                    </label>
                    <button
                      className="submit-btn"
                      onClick={handlePhoneOtpSubmit}
                    >
                      {isLoadingg ? (
                        <>
                          <p>Submittig</p>
                          <div className="spinner"></div>
                        </>
                      ) : (
                        <p>{t("settings.submit")}</p>
                      )}
                    </button>
                  </div>
                  <OTPCountdown phoneNumber={phoneNumber} />
                </>
              )}
            </Modal>
          )}
          {emailModal && (
            <EmailModal show={emailModal}>
              <div className="closebtn">
                <button className="close" onClick={handleCloseEmailModal}>
                  &times;
                </button>
              </div>
              <h2 style={{ marginBottom: "0.5rem" }}>
                {t("settings.verifyEmail")}
              </h2>
              <p style={{ fontWeight: "400" }}>
                {t("settings.desc1")}{" "}
                <span style={{ fontWeight: "600" }}>{user.email}</span>{" "}
                {t("settings.desc2")}
              </p>
              <label>
                <input
                  className="input"
                  value={inputEmailOtpValue}
                  placeholder={t("settings.enterOtp")}
                  onChange={(e) => setEmailInputOtpValue(e.target.value)}
                />
              </label>
              <button className="submit-btn" onClick={handleEmailOtpSubmit}>
                {t("settings.submit")}
              </button>
            </EmailModal>
          )}
        </div>
        <div className="inner">
          <p>{t("settings.loggedIn")}</p>
          <button
            className="logged-in-toggle"
            onClick={() => navigate("/home/logininfo")}
          >
            <ArrowForwardIosIcon
              style={{ fontWeight: "900", fontSize: "16px" }}
            />
          </button>
        </div>
      </div>
      <ToastContainer
        position="bottom-right"
        theme="dark"
        transition={Bounce}
      />
    </div>
  );
};

export default Settings;
