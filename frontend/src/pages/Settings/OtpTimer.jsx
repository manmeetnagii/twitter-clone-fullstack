import axios from "axios";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const OTPCountdown = ({ phoneNumber }) => {
  const [timeLeft, setTimeLeft] = useState(120);
  const {t} = useTranslation();

  useEffect(() => {
    if (timeLeft === 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const handlePhoneNumberSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("https://twitter-backend-main.onrender.com/send-otp", {
        phoneNumber,
      });
      console.log("Response:", response.data);
      setTimeLeft(12);
    } catch (error) {
      console.error("There was an error in sending otp!", error);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className='container'>
        <div className="card">
            <div className="countdown-text">
                <p>{t("settings.timeRemaining")} {""} - {""}
                    <span style={{fontWeight:600}}>
                     {formatTime(timeLeft)}
                    </span> 
                </p>

                <button
                  onClick={handlePhoneNumberSubmit}
                  type="submit"
                  disabled={timeLeft > 0 ? true : false}
                    style={{
                        color: timeLeft > 0 ? "#DFE3E" : "FF5630" 
                    }}
                >{t("settings.resendOtp")}</button>
            </div>
      
        </div>
    </div>  
  );
};

export default OTPCountdown;
