import React, { useState } from "react";
import "./Sidebar.css";
import SidebarOptions from "./SidebarOptions";
import TwitterIcon from "@mui/icons-material/Twitter";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import MoreIcon from "@mui/icons-material/More";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Divider from "@mui/material/Divider";
import SettingsIcon from "@mui/icons-material/Settings";
import DoneIcon from "@mui/icons-material/Done";
import Button from "@mui/material/Button";
import ListItemIcon from "@mui/material/ListItemIcon";
import { Avatar } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import CustomLink from "./CustomLink";
import useLoggedInUser from "../../hooks/useLoggedInUsers";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function Sidebar({ handleLogout, user }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const openMenu = Boolean(anchorEl);
  const [loggedInUser] = useLoggedInUser();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleClick = (e) => {
    setAnchorEl(e.currentTarget);
    //console.log(e.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const result = user?.email ? user?.email?.split("@")[0] : user?.phoneNumber;
  const phoneNumber = user?.phoneNumber;
  return (
    <div className="sidebar">
      <TwitterIcon className="sidebar__twitterIcon" />
      <CustomLink to="/home/feed">
        <SidebarOptions active Icon={HomeIcon} text={t("sidebar.home")} />
      </CustomLink>
      <CustomLink to="/home/explore">
        <SidebarOptions Icon={SearchIcon} text={t("sidebar.explorer")} />
      </CustomLink>
      <CustomLink to="/home/notifications">
        <SidebarOptions
          Icon={NotificationsNoneIcon}
          text={t("sidebar.notification")}
        />
      </CustomLink>
      <CustomLink to="/home/messages">
        <SidebarOptions Icon={MailOutlineIcon} text={t("sidebar.message")} />
      </CustomLink>
      <CustomLink to="/home/bookmarks">
        <SidebarOptions
          Icon={BookmarkBorderIcon}
          text={t("sidebar.bookmark")}
        />
      </CustomLink>
      <CustomLink to="/home/lists">
        <SidebarOptions Icon={ListAltIcon} text={t("sidebar.list")} />
      </CustomLink>
      <CustomLink to="/home/profile">
        <SidebarOptions Icon={PermIdentityIcon} text={t("sidebar.profile")} />
      </CustomLink>
      <CustomLink to="/home/more">
        <SidebarOptions Icon={MoreIcon} text={t("sidebar.more")} />
      </CustomLink>
      <CustomLink to="/home/settings">
        <SidebarOptions Icon={SettingsIcon} text={t("sidebar.settings")} />
      </CustomLink>
      <Button variant="outlined" className="sidebar__tweet" fullWidth>
        {t("tweetbox.tweet")}
      </Button>
      <div className="Profile__info">
        <Avatar
          src={
            loggedInUser[0]?.profileImage
              ? loggedInUser[0]?.profileImage
              : "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png"
          }
        />
        <div className="user__info">
          <h4>
            {loggedInUser[0]?.name || user?.displayName || user?.phoneNumber}
          </h4>
          <h5>@{result}</h5>
        </div>
        <IconButton
          size="small"
          sx={{ ml: 2 }}
          aria-controls={openMenu ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={openMenu ? "true" : undefined}
          onClick={handleClick}
        >
          <MoreHorizIcon />
        </IconButton>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={openMenu}
          onClick={handleClose}
          onClose={handleClose}
        >
          <MenuItem
            className="Profile__info1"
            onClick={() => navigate("/home/profile")}
          >
            <Avatar
              src={
                loggedInUser[0]?.profileImage
                  ? loggedInUser[0]?.profileImage
                  : "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png"
              }
            />
            <div className="user__info subUser__info">
              <div>
                <h4>
                  {loggedInUser[0]?.name || user?.displayName || user?.phoneNumber }
                </h4>
                <h5>@{result ? result : phoneNumber}</h5>
              </div>
              <ListItemIcon className="done__icon" color="blue">
                <DoneIcon />
              </ListItemIcon>
            </div>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleClose}>
            {t("sidebar.add_exisiting_account")}
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            {t("sidebar.logout")} @{result ? result : phoneNumber}
          </MenuItem>
        </Menu>
      </div>
    </div>
  );
}

export default Sidebar;
