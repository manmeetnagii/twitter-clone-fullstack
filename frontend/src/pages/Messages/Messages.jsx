import React, { useState } from "react";
import "./messages.css";
import { Avatar } from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import RepeatIcon from "@mui/icons-material/Repeat";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PublishIcon from "@mui/icons-material/Publish";
import { useTranslation } from "react-i18next";

const Messages = () => {
  const [heading, setHeading] = useState("");

  const [isLoading, setIsLoading] = useState("");
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState([]);

  const {t} = useTranslation();

  const onSent = async (prompt) => {
    const url = `https://twitter-api45.p.rapidapi.com/search.php?query=${encodeURIComponent(
      prompt
    )}&search_type=Top&count=1000`;
    const options = {
      method: "GET",
      headers: {
        "x-rapidapi-key": "3e5d1a1539mshf3b94ec751edd80p171edajsn35fd4d10e6c5",
        "x-rapidapi-host": "twitter-api45.p.rapidapi.com",
      },
    };

    try {
      const response = await fetch(url, options);
      const messageData = await response.json();
      console.log("messageData", messageData.timeline);
      setMessages(messageData.timeline);
      setHeading(`Recent tweets on "${prompt}"`);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSendMessage = () => {
    setIsLoading(true);
    if (input.trim()) {
      onSent(input).finally(() => setIsLoading(false));
    } else {
      setIsLoading(false); // Stop loading if the input is empty
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <img src="/bot.png" alt="" />
        <p className="chatbot-heading">{t("chatbot.heading")}</p>
      </div>

      <div className="chatbot-message">
        <div className="message-container">
          {isLoading ? (
            <div className="loader">
              <hr />
              <hr />
              <hr />
            </div>
          ) : (
            <>
              {heading && (
                <div className="hr">
                  <h2>{heading}</h2>
                 
                </div>
              )}
              {messages.map((message, index) => (
                <div className="post" key={index}>
                  <div className="post__avatar">
                    <Avatar src={message.user_info.avatar} />
                  </div>
                  <div className="post__body">
                    <div className="post__header">
                      <div className="post__headerText">
                        <h3>
                          {message.user_info.name}
                          <span className="post__headerSpecial">
                            <VerifiedUserIcon className="post__badge" /> @
                            {message.user_info.screen_name.toLowerCase()}
                          </span>
                        </h3>
                      </div>
                      <div className="post__headerDescription">
                        <p>{message.text}</p>
                      </div>
                    </div>
                    {message.media.photo && (
                      <img
                        src={message.media.photo[0]?.media_url_https}
                        alt=""
                        width="400"
                        style={{maxHeight:"500px", objectFit:"cover"}}
                      />
                    )}
                    <div className="post__footer">
                      <ChatBubbleOutlineIcon
                        className="post__footer__icon"
                        fontSize="small"
                      />
                      <RepeatIcon
                        className="post__footer__icon"
                        fontSize="small"
                      />
                      <FavoriteBorderIcon
                        className="post__footer__icon"
                        fontSize="small"
                      />
                      <PublishIcon
                        className="post__footer__icon"
                        fontSize="small"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
      <div className="chatbot-input">
        <div className="input-div">
          <input
            autoFocus="true"
            className="place"
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={t("chatbot.placeholder")}
          />
          <button onClick={() => handleSendMessage()}>{t("settings.btn")}</button>
        </div>
      </div>
    </div>
  );
};

export default Messages;
