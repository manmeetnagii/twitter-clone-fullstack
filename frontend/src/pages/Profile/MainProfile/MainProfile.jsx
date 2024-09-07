import React, { useState, useEffect } from "react";
import "./mainprofile.css";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CenterFocusWeakIcon from "@mui/icons-material/CenterFocusWeak";
import LockResetIcon from "@mui/icons-material/LockReset";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import AddLinkIcon from "@mui/icons-material/AddLink";
import Post from "./Post/Post";
import { useNavigate } from "react-router-dom";
import EditProfile from "../EditProfile/EditProfile";
import axios from "axios";
import useLoggedInUser from "../../../hooks/useLoggedInUsers";

import Modal from "../Map/Modal.jsx";
import Maps from "../Map/Maps.jsx";
import { useTranslation } from "react-i18next";
import { LocationOn } from "@mui/icons-material";

const MainProfile = ({ user }) => {
  const navigate = useNavigate();
  // const [imageURL, setImageURL] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loggedInUser] = useLoggedInUser();
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [cityStateCountry, setCityStateCountry] = useState("");
  const [tweets, setTweets] = useState([]);

  async function gotLocation(position) {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=AIzaSyADravS22uqcS5uF6WsnHKHCyN9us_oKJk`
      );
      const data = await response.json();
  
      let city, state, country;
      const addressComponents = data.results[0]?.address_components || [];
  
      addressComponents.forEach((component) => {
        const types = component.types;
        if (types.includes("locality")) {
          city = component.long_name;
        }
        if (types.includes("administrative_area_level_1")) {
          state = component.long_name;
        }
        if (types.includes("country")) {
          country = component.long_name;
        }
      });
  
      const newLocationData = {
        city: city || "Not found",
        state: state || "Not found",
        country: country || "Not found",
      };
  
      const cityStateCountry = `${newLocationData.city}, ${newLocationData.state}, ${newLocationData.country}`;
      setCityStateCountry(cityStateCountry);
  
      setLoading(false);
      if (newLocationData.city !== "Not found" && newLocationData.state !== "Not found" && newLocationData.country !== "Not found") {
        setShowModal2(!showModal2);
      }
    } catch (error) {
      console.error("Error fetching location data:", error);
      setLoading(false);
    }
  }
  

  const showMap = () => {
    setIsLoading(true);
    setShowModal(!showModal);
  };

  const showMap2open = async () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(gotLocation, () => {console.log("Error in fetching location")});
  };

  const showMap2close = () => {
    setShowModal2(!showModal2);
  };

  const { t } = useTranslation();

  const username = user?.email?.split("@")[0];
  const phoneNumber = user?.phoneNumber
    ? user.phoneNumber.replace("+", "")
    : null;

  useEffect(() => {
    // // console.log("Fetching LoggedInUser", loggedInUser[0]?.location);

    const loginInfo = async () => {
      try {
        const res = await axios.post("https://twitter-backend-main.onrender.com/loginInfo", {
          email: user.email,
          phoneNumber: phoneNumber,
        });
        const fetchedData = res.data;
      } catch (error) {
        console.error("Error fetching login info:", error);
      }
    };

    loginInfo();

    const fetchPosts = async () => {
      try {
        let url = "";
        if (user?.email) {
          // console.log("Fetching by email", user);
          url = `https://twitter-backend-main.onrender.com/userpost?email=${user.email}`;
        } else if (phoneNumber) {
          // console.log("Fetching by phone number");
          url = `https://twitter-backend-main.onrender.com/userpost?phoneNumber=${phoneNumber}`;
        }

        if (url) {
          const res = await fetch(url);
          const postsData = await res.json();
          setPosts(postsData);
          // console.log("postData = ", postsData);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, [user?.email, phoneNumber]);

  const handleUploadCoverImage = (e) => {
    setIsLoading(true);
    setIsLoading(true);
    const image = e.target.files[0];
    // console.log("EMAIL", user.email);
    const formData = new FormData();
    formData.set("image", image);

    axios
      .post(
        "https://api.imgbb.com/1/upload?key=da3582ad3c3d7547a13463af5c430fae",
        formData
      )
      .then((res) => {
        // console.log("RESULT", res);
        const url = res.data.data.display_url;
        // setImageURL(url);
        // console.log(res.data.data.display_url);
        const userCoverImagew = {
          coverImage: url,
          phoneNumber: phoneNumber?.replace("+", ""),
        };
        const userCoverImage = {
          email: user?.email,
          coverImage: url,
        };
        setIsLoading(false);
        setIsLoading(false);
        if (url) {
          if (user.email) {
            // console.log("CHECKING FIR", user.email);
            fetch(`https://twitter-backend-main.onrender.com/userUpdates/?email=${user.email}`, {
              method: "PATCH",
              headers: {
                "content-type": "application/json",
              },
              body: JSON.stringify(userCoverImage),
            })
              .then((res) => res.json())
              .then((data) => {
                // console.log("done", data);
              });
          } else {
            fetch(
              `https://twitter-backend-main.onrender.com/userUpdates/?phoneNumber=${phoneNumber}`,
              {
                method: "PATCH",
                headers: {
                  "content-type": "application/json",
                },
                body: JSON.stringify(userCoverImagew),
              }
            )
              .then((res) => res.json())
              .then((data) => {
                // console.log("done", data);
              });
          }
        }
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
        setIsLoading(false);
      });
  };

  const handleUploadProfileImage = (e) => {
    setIsLoading(true);
    setIsLoading(true);
    const image = e.target.files[0];
    // console.log("EMAIL", user.email);
    const formData = new FormData();
    formData.set("image", image);

    axios
      .post(
        "https://api.imgbb.com/1/upload?key=da3582ad3c3d7547a13463af5c430fae",
        formData
      )
      .then((res) => {
        // console.log("RESULT", res);
        const url = res.data.data.display_url;
        // setImageURL(url);
        // console.log(res.data.data.display_url);
        const userProfileImagew = {
          profileImage: url,
          phoneNumber: phoneNumber?.replace("+", ""),
        };
        const userProfileImage = {
          email: user?.email,
          profileImage: url,
        };
        setIsLoading(false);
        if (url) {
          if (user.email) {
            fetch(`https://twitter-backend-main.onrender.com/userUpdates/?email=${user?.email}`, {
              method: "PATCH",
              headers: {
                "content-type": "application/json",
              },
              body: JSON.stringify(userProfileImage),
            })
              .then((res) => res.json())
              .then((data) => {
                // console.log("done", data);
              });
          } else {
            fetch(
              `https://twitter-backend-main.onrender.com/userUpdates/?phoneNumber=${phoneNumber}`,
              {
                method: "PATCH",
                headers: {
                  "content-type": "application/json",
                },
                body: JSON.stringify(userProfileImagew),
              }
            )
              .then((res) => res.json())
              .then((data) => {
                // console.log("done", data);
              });
          }
        }
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  };

  return (
    <div>
      <ArrowBackIcon className="arrow-icon" onClick={() => navigate("/")} />
      <h4 className="heading-4">{username ? username : `+${phoneNumber}`}</h4>
      <div className="mainprofile">
        <div className="profile-bio">
          {
            <div>
              <div className="coverImageContainer">
                <img
                  src={
                    loggedInUser[0]?.coverImage
                      ? loggedInUser[0]?.coverImage
                      : "/defaultCoverImg.jpg"
                  }
                  alt=""
                  className="coverImage"
                />
                <div className="hoverCoverImage">
                  <div className="imageIcon_tweetButton">
                    <label htmlFor="image" className="imageIcon">
                      {isLoading ? (
                        <LockResetIcon className="photoIcon photoIconDisabled " />
                      ) : (
                        <CenterFocusWeakIcon className="photoIcon" />
                      )}
                    </label>
                    <input
                      type="file"
                      id="image"
                      className="imageInput"
                      onChange={handleUploadCoverImage}
                    />
                  </div>
                </div>
              </div>
              <div className="avatar-img">
                <div className="avatarContainer">
                  <img
                    src={
                      loggedInUser[0]?.profileImage
                        ? loggedInUser[0]?.profileImage
                        : "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png"
                    }
                    className="avatar"
                    alt=""
                  />
                  <div className="hoverAvatarImage">
                    <div className="imageIcon_tweetButton">
                      <label htmlFor="profileImage" className="imageIcon">
                        {isLoading ? (
                          <LockResetIcon className="photoIcon photoIconDisabled " />
                        ) : (
                          <CenterFocusWeakIcon className="photoIcon" />
                        )}
                      </label>
                      <input
                        type="file"
                        id="profileImage"
                        className="imageInput"
                        onChange={handleUploadProfileImage}
                      />
                    </div>
                  </div>
                </div>
                <div className="userInfo">
                  <div>
                    <h3 className="heading-3">
                      {loggedInUser[0]?.name
                        ? loggedInUser[0].name
                        : user && user.displayName}
                    </h3>
                    <p className="usernameSection">
                      @{username || phoneNumber || user.displayName}
                    </p>
                  </div>
                  <EditProfile user={user} loggedInUser={loggedInUser} />
                </div>
                <div className="infoContainer">
                  {loggedInUser[0]?.bio ? <p>{loggedInUser[0].bio}</p> : ""}
                  <div className="locationAndLink">
                    {loggedInUser[0]?.location ? (
                      <p
                        className="subInfo"
                        style={{ cursor: "pointer" }}
                        onClick={showMap}
                      >
                        <MyLocationIcon /> {loggedInUser[0].location}
                      </p>
                    ) : (
                      ""
                    )}
                    <Modal show={showModal} onClose={showMap}>
                      <Maps
                        locationURI={
                          loggedInUser[0]?.location
                            ? loggedInUser[0].location.replace(/ /g, "+")
                            : cityStateCountry
                        }
                      />
                    </Modal>

                    <Modal show={showModal2} onClose={showMap2close}>
                      <Maps locationURI={cityStateCountry} />
                    </Modal>

                    {loggedInUser[0]?.website ? (
                      <p
                        className="subInfo link"
                        onClick={() =>
                          window.open(`${loggedInUser[0]?.website}`)
                        }
                      >
                        <AddLinkIcon /> {loggedInUser[0].website}
                      </p>
                    ) : (
                      ""
                    )}
                    <button className="Edit-profile" onClick={showMap2open}>
                      Obtain Location <LocationOn style={{ width: "18px" }} />
                    </button>
                    {loading && <div className="spinner"></div>}
                  </div>
                </div>
                <h4 className="tweetsText">{t("tweetbox.tweet")}</h4>

                <hr />
              </div>
              {posts.map((p) => <Post p={p} key={p._id} />).reverse()}
            </div>
          }
        </div>
        <div>
          <ul>
            {tweets.map((tweet) => (
              <li key={tweet.id}>{tweet.text}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MainProfile;
