import React from "react";
import "./Widgets.css";
import {
  TwitterTimelineEmbed,
  TwitterTweetEmbed,
} from "react-twitter-embed";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";

function Widgets() {

  const {t} = useTranslation();

  return (
    <div className="widgets">
      <div className="widgets__input">
        <SearchIcon className="widgets__searchIcon" />
        <input placeholder={t("widget.Search_Twitter")} type="text" />
      </div>
 

      <div className="widgets__widgetContainer">
        <h2>{t("widget.Whats_happening")}</h2>

        <TwitterTweetEmbed tweetId={"1557187138352861186"} />

        <TwitterTimelineEmbed
          sourceType="profile"
          screenName="elonmusk"
          options={{ height: 400 }}
        />


      </div>
    </div>
  );
}

export default Widgets;