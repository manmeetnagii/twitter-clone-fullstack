import axios from "axios";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

const Timer = ({ email }) => {
  const [timeLeft, setTimeLeft] = useState(120);
  // 2 minutes in seconds

  const {t} = useTranslation();

  useEffect(() => {
    // Exit early when we reach zero
    if (timeLeft === 0) return;

    // Save the interval ID to clear it later
    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    // Clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const handleEmailSubmit = async () => {
    const userEmail = email;
    try {   
      const response = await axios.post("https://twitter-backend-main.onrender.com/send-emailOtp", {
        userEmail,
      });
      console.log("Response:", response.data);
      setTimeLeft(12);
    } catch (error) {
      console.error("There was an error in sending otp!", error);
    }
  };

  // Format the time as MM:SS
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
                  onClick={handleEmailSubmit}
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

export default Timer;
