import React, { useEffect, useState } from "react";
import "../pages.css";
import axios from "axios";
import { useUserAuth } from "../../context/UserAuthContext";

const LoginInfo = () => {
  const user = useUserAuth();
  const [data, setData] = useState([]);

  useEffect(() => {
    try {
      const email = user.user.email;
      const phoneNumber = user.user.phoneNumber;
      const loginInfo = async () => {
        const res = await axios.post("https://twitter-backend-main.onrender.com/loginInfo", {email: email, phoneNumber:phoneNumber});
        setData(res.data);
      };
      loginInfo();
    } 
    catch (error) {
      console.log(error);
    }
  }, [user]);

  const formatTime = (dateString) => {
    const timestampStr = dateString;

    const timestamp = new Date(timestampStr);

    const year = timestamp.getFullYear();
    const month = timestamp.getMonth() + 1;
    const day = timestamp.getDate();

    const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

    return formattedDate;
  };

  return (
    <div className="page">
      {data ? (
        <div className="list">
          <div>
            <h2>Login History</h2>
          </div>
          <div>
            {data
              .map((data) => (
                <ul key={data._id} className="ul">
                  {data.device ? (
                    <li>Device: {data.device}</li>
                  ) : (
                    <li>Device: Desktop</li>
                  )}
                  {data.browser ? (
                    <li>Browser: {data.browser}</li>
                  ) : (
                    <li>Browser: Unkown</li>
                  )}
                  {data.ip ? (
                    <li>
                      IP Address:{" "}
                      <span style={{ color: "blue" }}>{data.ip}</span>
                    </li>
                  ) : (
                    <li>
                      IP Address: <span style={{ color: "blue" }}>Unkown</span>
                    </li>
                  )}
                  {data.os ? <li>OS: {data.os}</li> : <li>Device: Unkown</li>}
                  {data.createdAt ? (
                    <li
                      style={{
                        fontWeight: "400",
                        marginTop: "10px",
                        color: "red",
                      }}
                    >
                      on {formatTime(data.createdAt)}
                    </li>
                  ) : (
                    <li
                      style={{
                        fontWeight: "400",
                        marginTop: "10px",
                        color: "red",
                      }}
                    >
                      {""}
                    </li>
                  )}
                </ul>
              ))
              .reverse()}
          </div>
        </div>
      ) : (
        <p>Data is not available for now</p>
      )}
    </div>
  );
};

export default LoginInfo;
