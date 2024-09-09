import React, { useState } from "react";

import CloseIcon from "@mui/icons-material/Close";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import MicNoneIcon from "@mui/icons-material/MicNone";
import StopIcon from "@mui/icons-material/Stop";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

import axios from "axios";

import { useTranslation } from "react-i18next";
import { Avatar, Button } from "@mui/material";
import { Bounce, ToastContainer, toast } from "react-toastify";

import { useUserAuth } from "../../../context/UserAuthContext";
import "react-toastify/dist/ReactToastify.css";
import "./TweetBox.css";
import "../../Settings/settings.css";
import useLoggedInUser from "../../../hooks/useLoggedInUsers";
import EmailModal from "../../Settings/EmailModal";

function TweetBox() {
  const [loggedInUser] = useLoggedInUser();
  const { user } = useUserAuth();
  const { t } = useTranslation();

  const [inputEmailOtpValue, setEmailInputOtpValue] = useState("");
  const [emailModal, setEmailModal] = useState(false);
  const [post, setPost] = useState("");
  const [username, setUsername] = useState(" ");
  const [phoneNumber, setPhoneNumber] = useState(" ");
  
  // Audio recording states
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [showRecorder, setShowRecorder] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isRecUploading, setIsRecUploading] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [audioSize, setAudioSize] = useState("");
  const [audioDuration, setAudioDuration] = useState("");
  
  // Image uploading states
  const [imageURL, setImageURL] = useState("");
  const [isImageUploading, setIsImageUploading] = useState(false);

  const email = user?.email;
  const userPhoneNumber = user?.phoneNumber;
  const name = loggedInUser[0]?.name ? loggedInUser[0]?.name : user?.displayName;
  const userProfilePic = loggedInUser[0]?.profileImage
    ? loggedInUser[0]?.profileImage
    : "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png";

  // Function for fetching User Data
  const fetchUserData = async (query) => {
    try {
      const response = await fetch(`https://twitter-backend-main.onrender.com/loggedInUser?${query}`);
      if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
      } 
      catch (error) {
        console.error('Error fetching user data:', error);
        return [];
      }
  };

  const handleAudiourl = () =>{
    setAudioUrl("");
    setShowRecorder(!showRecorder);
  }

  // Function for post a tweet
  const handleTweet = async () => {
    if (post.length === 0) return;
    try {
      if (user?.providerData[0]?.providerId === "password" && !isRecording) {
        // console.log("Processing user data");
        let userData;
        if (!userPhoneNumber) {
          userData = await fetchUserData(`email=${email}`);
          setUsername(userData[0]?.username);
        } 
        else {
          userData = await fetchUserData(`phoneNumber=${userPhoneNumber}`);
          setPhoneNumber(userData[0]?.phoneNumber);
        }
      } 
      else {
        setUsername(email?.split("@")[0]);
        setPhoneNumber(user?.phoneNumber);
      }
      
      const userPost = {
        profileImage: userProfilePic,
        post: post,
        photo: imageURL,
        audio: audioUrl,
        username: username,
        name: name ? name : (username ? username : userPhoneNumber),
        email: email,
        phoneNumber: userPhoneNumber ? userPhoneNumber.replace("+", "") : null,
      };
  
      console.log("REC LEN = ",audioDuration)
      if (isRecording || audioDuration >= 300 || audioSize >= 10 ** 9) {
        toast.info("The audio length and size should not be more than 5 minutes and 100 MB");
        return;
      }
  
      if (audioUrl) {
      console.log(phoneNumber)
        if(userPhoneNumber){
          console.log("REC BY PHONE")
          toast.info("Audio uploads are only available to users registered with an email.")
        }
        else{ 
          toast.info("Audio upload requires email verification.");
          await handleEmailSubmit();
        }
      } 
      else {
        const response = await fetch(`https://twitter-backend-main.onrender.com/post`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userPost),
        });
  
        const data = await response.json();
        // console.log("Response Data:", data);
        // console.log("User:", user);
        // console.log("Logged In User:", loggedInUser);

        setPost("");
        setImageURL("");
        setAudioUrl("");
        setShowRecorder(false);
      }
    } catch (error) {
      console.error('Error handling tweet:', error);
    }
  };

  // Function for sending OTP to user's email
  const handleEmailSubmit = async () => {
    setEmailModal(true);
    const userEmail = user.email;
    try {
      const response = await axios.post("https://twitter-backend-main.onrender.com/send-emailOtp", {
        userEmail,
      });
      // console.log("Response:", response.data);
    } 
    catch (error) {
      console.error("There was an error in sending otp!", error);
    }
  };

  // Function for verifying OTP
  const handleEmailOtpSubmit = async () => {
    const otp = inputEmailOtpValue;
    const userEmail = user.email;
    const bodyData = { userEmail, otp };
    try {
      const response = await axios.post("https://twitter-backend-main.onrender.com/verify-emailOtp",
        { bodyData }
      );

      if (response.data.success === true) {
        setEmailModal(false);
        setEmailInputOtpValue("");
        setShowRecorder(true);

        const userPost = {
          profileImage: userProfilePic,
          post: post,
          photo: imageURL,
          audio: audioUrl,
          username: username,
          name: name ? name : (username ? username : userPhoneNumber),
          email: email,
          phoneNumber: userPhoneNumber ? userPhoneNumber.replace("+", "") : null,
        };

        const response = await fetch(`https://twitter-backend-main.onrender.com/post`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userPost),
        });
  
        const data = await response.json();
        // console.log("Response Data:", data);
        // console.log("User:", user);
        // console.log("Logged In User:", loggedInUser);

        setPost("");
        setImageURL("");
        setAudioUrl("");
        setShowRecorder(false);
       
      }
      // console.log(response.data.msg);
      // console.log("Response:", response.data.success);
    } 
    catch (error) {
      console.error("There was an error!", error.response.data.msg);
    }
  };

  // Function for image uplaod
  const handleUploadImage = (e) => {
    setIsImageUploading(true);
    const image = e.target.files[0];
    
    const formData = new FormData();
    if(!image){
      setIsImageUploading(false);
    }
    else{
      formData.set("image", image);
    }

    axios.post(
        "https://api.imgbb.com/1/upload?key=da3582ad3c3d7547a13463af5c430fae",
        formData
      )
      .then((res) => {
        setImageURL(res.data.data.display_url);
        setIsImageUploading(false);
        // console.log(res.data.data.display_url);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Function for checking if user can uplaid audio
  function runBetween2To7PMIST() {
    const now = new Date();

    const UTCtoIST = 5.5 * 60 * 60 * 1000;
    const ISTTime = new Date(now.getTime() + UTCtoIST);

    const hours = ISTTime.getUTCHours();
    const minutes = ISTTime.getUTCMinutes();

    if (
      (hours > 14 && hours < 19) ||
      (hours === 14 && minutes >= 0) ||
      (hours === 19 && minutes === 0)
    ) {
      return true;
    } else {
      return false;
    }
  }

  const handleRecording = () => {
    if (runBetween2To7PMIST()) {
      setShowRecorder(!showRecorder);
    } else {
      toast.info("Audio recordings are only allowed between 2 PM to 7 PM IST.");
    }
  };

  const startRecording = async () => {
    try {
      setAudioUrl("");
      setIsRecording(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      const chunks = [];
      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      recorder.onstop = async () => {
        setIsRecUploading(true);
        const audioBlob = new Blob(chunks, { type: "audio/mp3" });
        const formData = new FormData();
        formData.append("file", audioBlob);

        try {
          const response = await axios.post(
            "https://twitter-backend-main.onrender.com/upload-audio",
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
          setAudioUrl(response.data.secure_url);
          setAudioSize(response.data.bytes);
          setAudioDuration(response.data.duration);
          setIsRecUploading(false);
          setIsRecording(false);
        } catch (error) {
          console.error("Error uploading audio:", error);
        }
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing the microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleCloseEmailModal = () => {
    setEmailModal(false);
    setEmailInputOtpValue("");
  };

  return (
    <div className="tweetBox">
      <form>
        {/* text post */}
        <div className="tweetBox__input">
          <Avatar
            src={
              loggedInUser[0]?.profileImage
                ? loggedInUser[0]?.profileImage
                : "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png"
            }
          />
          <input
            type="text"
            style={{ outline: "none" }}
            placeholder={t("tweetbox.Whats_happening?")}
            onChange={(e) => setPost(e.target.value)}
            value={post}
            required
          />
        </div>
        
        {/* recorder */}
        <div className="tweetBox_vr">
          {showRecorder && (
            <div className="rec-container">
              <div className="w">
                <button
                  onClick={startRecording}
                  disabled={isRecording}
                  className="rec_start"
                >
                  <div className="start-container">
                    <PlayArrowIcon style={{ color: "var(--twitter-color)" }} />
                    {t("tweetbox.start")}
                  </div>
                </button>
                <button
                  onClick={stopRecording}
                  disabled={!isRecording}
                  className={isRecording ? "active" : "rec-stop"}
                >
                  <div className="start-container">
                    <StopIcon style={{ color: "red" }} />
                    {t("tweetbox.stop")}
                  </div>
                </button>
              </div>

              {/* player */}
              {audioUrl && (
                <div className="audio">
                  <audio controls>
                    <source src={audioUrl} type="audio/mp3" />
                    Your browser does not support the audio element.
                  </audio>
                  <CloseIcon
                    style={{ cursor: "pointer" }}
                    onClick={handleAudiourl}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="imageIcon_tweetButton">
          <div className="input-container">
            {/* Image input */}
            <label htmlFor="image" className="imageIcon">
              {isImageUploading ? (
                <p>{t("tweetbox.Uploading_Image")}</p>
              ) : (
                <>
                  {imageURL ? (
                    <div style={{ display: "flex", gap: "10px" }}>
                      <p>{t("tweetbox.Image_Uploaded")}</p>
                    </div>
                  ) : (
                    <AddPhotoAlternateOutlinedIcon
                      style={{ cursor: "pointer" }}
                    />
                  )}
                </>
              )}
            </label>
            <input
              type="file"
              id="image"
              className="imageInput"
              onChange={handleUploadImage}
            />

            {/* audio input */}
            <label className="imageIcon">
              {isRecUploading ? (
                <p>{t("tweetbox.Uploading_Audio")}</p>
              ) : (
                <p>
                  {audioUrl ? (
                    <p> {t("tweetbox.Audio_Uploaded")}</p>
                  ) : (
                    <MicNoneIcon
                      style={{ cursor: "pointer" }}
                      onClick={handleRecording}
                    />
                  )}
                </p>
              )}
            </label>
          </div>
          <Button
            onClick={() => handleTweet()}
            className="tweetBox__tweetButton"
          >
            {t("tweetbox.tweet")}
          </Button>
        </div>
      </form>
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
      <ToastContainer
        position="bottom-right"
        theme="dark"
        transition={Bounce}
      />
    </div>
  );
}
export default TweetBox;