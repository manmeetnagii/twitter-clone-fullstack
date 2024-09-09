import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import Signup from "./pages/Login/Signup";
import ProtectedRoutes from "./pages/ProtectedRoutes";
import { UserAuthContextProvider } from "./context/UserAuthContext";
import "./App.css";
import Home from "./pages/Home";
import Explore from "./pages/Explore/Explore";
import Feed from "./pages/Feed/Feed";
import Messages from "./pages/Messages/Messages";
import Bookmarks from "./pages/Bookmarks/Bookmarks";
import Lists from "./pages/Lists/Lists";
import Profile from "./pages/Profile/Profile";
import More from "./pages/More/More";
import Notifications from "./pages/Notifications/Notifications";
import ForgotPass from "./pages/Login/ForgotPass";
import Settings from "./pages/Settings/Settings";
import LocaleContext from "./context/LocaleContext";
import i18n from "./i18n/i18n";
import axios from "axios";
import LoginInfo from "./pages/Settings/LoginInfo";
import Mobile from "./pages/Login/PhoneSignIn";
import MobileLogin from "./pages/Login/phoneLogin";


function App() {
  const [locale, setLocale] = useState(i18n.language);

  
  const [ip, setIp] = useState('');
  const [userBrowser, setUserBrowser] = useState("");
  const [userOS, setUserOS] = useState("");
  
  
  const [userDevice, setUserDevice] = useState("");
  
  useEffect(()=>{
  i18n.on("languageChanged", (lng) => setLocale(i18n.language));
  const fetchUserAgent = async () => {
    try {
      const response = await axios.get(`https://twitter-backend-main.onrender.com/info`);
      console.log(response)
      console.log(response.data.browser.name)
      console.log(response.data.device.type)
      console.log(response.data.os.name)
      setUserBrowser(response.data.browser.name);
      setUserOS(response.data.os.name); 
      setUserDevice(response.data.device.type);
      const ip = await axios.get('https://geo.ipify.org/api/v2/country?apiKey=at_AIbXJdD0WxEwAeFsOW168kELVMT90');
      console.log(ip.data.ip)
      setIp(ip.data.ip);
    } catch (error) {
      console.error("Error fetching user agent data:", error);
    }
  };

  fetchUserAgent();

  },[])


 

  return (
    <div className="app">
      <UserAuthContextProvider>
        <LocaleContext.Provider value={{ locale, setLocale }}>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoutes>
                 
         
                  <Home />
                </ProtectedRoutes>
              }
            >
              <Route index element={<Feed />} />
            </Route>
            <Route
              path="/home"
              element={
                <ProtectedRoutes>
                  <Home />
                </ProtectedRoutes>
              }
            >
              <Route path="feed" element={<Feed />} />
              <Route path="explore" element={<Explore />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="messages" element={<Messages />} />
              <Route path="bookmarks" element={<Bookmarks />} />
              <Route path="lists" element={<Lists />} />
              <Route path="profile" element={<Profile />} />
              <Route path="more" element={<More />} />
              <Route path="settings" element={<Settings />}/>
              <Route path="logininfo" element={<LoginInfo/>} />
            </Route>
            <Route path="/phonesignup" element={<Mobile   userIP={ip} userBrowser={userBrowser} userDevice={userDevice} userOS={userOS}/>} />
            <Route path="/phonelogin" element={<MobileLogin userIP={ip}  userBrowser={userBrowser}  userDevice={userDevice} userOS={userOS}/>} />
            <Route path="/login" element={<Login userIP={ip} userBrowser={userBrowser}  userDevice={userDevice} userOS={userOS}  />} />
            <Route path="/password-reset" element={<ForgotPass />} />
            <Route path="/signup" element={<Signup userIP={ip} userBrowser={userBrowser}  userDevice={userDevice} userOS={userOS} />} />
          </Routes>
        </LocaleContext.Provider>
      </UserAuthContextProvider>
    </div>
  );
}

export default App;
