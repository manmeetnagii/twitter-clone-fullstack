import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import TwitterIcon from "@mui/icons-material/Twitter";
import { Bounce, toast, ToastContainer } from "react-toastify";

import { useUserAuth } from "../../context/UserAuthContext";
import twitterimg from "../../image/twitter.jpeg";
import { auth } from "../../context/firebase";
import "./Login.css";

const ForgotPass = () => {
  const [email, setEmail] = useState("");
  const { resetPassword } = useUserAuth();
  const [resetAttempts, setResetAttempts] = useState(0);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const itemStr = localStorage.getItem("resetAttempts");
    if (itemStr) {
      const item = JSON.parse(itemStr);
      const now = new Date();
      if (now.getTime() > item.expiry) {
        localStorage.removeItem("resetAttempts");
      } else {
        setResetAttempts(item.value);
      }
    }
  }, []);

  const generatePassword = (length) => {
    const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let newPassword = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * letters.length);
      newPassword += letters[randomIndex];
    }
    setPassword(newPassword);
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (password) {
      navigator.clipboard.writeText(password).then(() => {
        setCopied(true);
      });
    }
  };

  const setDataWithExpiry = (key, value, ttl) => {
    const now = new Date();
    const item = {
      value: value,
      expiry: now.getTime() + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.info("Please enter an email address.");
      return;
    }

    const itemStr = localStorage.getItem("resetAttempts");
    const now = new Date();

    if (itemStr) {
      const item = JSON.parse(itemStr);
      if (now.getTime() > item.expiry) {
        localStorage.removeItem("resetAttempts");
      } else if (item.value >= 1) {
        toast("You can only request a password reset once a day.");
        return;
      }
    }

    setResetAttempts(resetAttempts + 1);
    setDataWithExpiry("resetAttempts", resetAttempts + 1, 24 * 60 * 60 * 1000);
    await resetPassword(auth, email);
    toast("Password reset link sent to your mail");
  };

  const backToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="login-container">
      <div className="image-container">
        <img className=" image" src={twitterimg} alt="twitterImage" />
      </div>

      <div className="form-container">
        <div className="form-box">
          <TwitterIcon style={{ color: "skyblue" }} />
          <h2 className="heading2">Find Your Account</h2>
          <p>
            Enter the email associated with your account to change your
            password.
          </p>

          <form onSubmit={handlePasswordReset}>
            <input
              type="email"
              className="email"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="btn-login">
              <button type="submit" className="btn">
                Send
              </button>

              <p style={{ fontWeight: "600", marginBottom: "1rem" }}>
                We will send a password reset link to this email
                <p
                  onClick={backToLogin}
                  style={{
                    cursor: "pointer",
                    textDecoration: "underline",
                    color: "blue",
                    marginBottom: "2rem",
                    fontWeight: "400",
                  }}
                >
                  Back to login page
                </p>
              </p>
            </div>
          </form>
        </div>
        <hr />
        <div className="randomPass">
          <h2>Password Generator</h2>
          <p style={{ width: "100%", marginTop: "12px" }}>
            Click "Generate Password" for a new secure password. Click "Copy" to
            use it while setting up your new password.
          </p>
          <div className="pass">
            <button className="btn3" onClick={() => generatePassword(12)}>
              Generate
            </button>

            {password ? (
              <>
                <span className="passwordd">{password}</span>
              </>
            ) : (
              <>
                <span
                  style={{
                    width: "30%",
                    marginRight: "20px",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "500",
                    color: "#7d7d7d",
                    fontSize: "13px",
                    border: "none",
                    outline: "none",
                  }}
                >
                  Generate a password
                </span>
              </>
            )}
            <button className="copy-btn" onClick={copyToClipboard}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
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

export default ForgotPass;
