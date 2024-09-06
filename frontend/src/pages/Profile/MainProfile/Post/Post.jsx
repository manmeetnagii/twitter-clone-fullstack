import React from 'react';
import { Avatar } from "@mui/material";


import VerifiedUserIcon from "@mui/icons-material/VerifiedUser"
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import RepeatIcon from "@mui/icons-material/Repeat";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PublishIcon from "@mui/icons-material/Publish";
import useLoggedInUser from '../../../../hooks/useLoggedInUsers';

function Post({ p }) {
  const { email, name, username, photo, post, phoneNumber } = p
  console.log("POST = ",p.email)

  const [loggedInUser] = useLoggedInUser();
  
  return (
    <div className="post">
      <div className="post__avatar">
        <Avatar src={loggedInUser[0]?.profileImage ? loggedInUser[0]?.profileImage : "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png"}/>
      </div>
      <div className="post__body">
        <div className="post__header">
          <div className="post__headerText">
            <h3>{name ? name : phoneNumber}{" "}
              <span className="post__headerSpecial">
                <VerifiedUserIcon className="post__badge" /> @{email || phoneNumber || username}
              </span>
            </h3>
          </div>
          <div className="post__headerDescription">
            <p>{post}</p>
          </div>
        </div>
        <img src={photo} alt="" width='500' />
        <div className="post__footer">
          <ChatBubbleOutlineIcon className="post__footer__icon" fontSize="small" />
          <RepeatIcon className="post__footer__icon" fontSize="small" />
          <FavoriteBorderIcon className="post__footer__icon" fontSize="small" />
          <PublishIcon className="post__footer__icon" fontSize="small" />
        </div>
      </div>
    </div>
  );
}

export default Post;
