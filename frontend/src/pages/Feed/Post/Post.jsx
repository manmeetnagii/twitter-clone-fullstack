import React from "react";

import { Avatar } from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import RepeatIcon from "@mui/icons-material/Repeat";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PublishIcon from "@mui/icons-material/Publish";

import "./Post.css";

function Post({ p }) {
  const {email, name, username, photo, post, profileImage, audio, phoneNumber} = p;

  return (
    <div className="post">
      <div className="post__avatar">
        <Avatar src={profileImage} />
      </div>
      <div className="post__body">
        <div className="post__header">
          <div className="post__headerText">
            <h3>
              {name ? name : username}{" "}
              <span className="post__headerSpecial">
                <VerifiedUserIcon className="post__badge" /> @
                {email || phoneNumber || username}
              </span>
            </h3>
          </div>
          <div className="post__headerDescription">
            <p className="post_text">{post}</p>
          </div>
        </div>
              <img src={photo} alt="" width="500" />
      
        {audio && (
          <audio controls>
            <source src={audio} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        )}
        <div className="post__footer">
          <ChatBubbleOutlineIcon
            className="post__footer__icon"
            fontSize="small"
          />
          <RepeatIcon className="post__footer__icon" fontSize="small" />
          <FavoriteBorderIcon className="post__footer__icon" fontSize="small" />
          <PublishIcon className="post__footer__icon" fontSize="small" />
        </div>
      </div>
    </div>
  );
}

export default Post;
