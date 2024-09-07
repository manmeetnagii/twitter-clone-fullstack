import React, { useEffect, useState } from "react";
import Post from "./Post/Post";
import "./Feed.css";
import TweetBox from "./TweetBox/TweetBox";
import { useTranslation } from "react-i18next";

function Feed() {
    const [posts, setPosts] = useState([]);
    const {t} = useTranslation()

    useEffect(() => {
        fetch(`https://twitter-backend-main.onrender.com/post`)
            .then(res => res.json())
            .then(data => {setPosts(data)})
    }, [posts])

    return (
        <div className="feed">
            <div className="feed__header">
                <h2>{t("sidebar.home")}</h2>
            </div>

            <TweetBox />
            
            {
                posts.map(p => <Post key={p._id} p={p} />
                ).reverse()
            }
        </div>
    )
}

export default Feed