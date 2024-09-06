import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose from "mongoose";

import {
  register,
  user,
  loggedInUser,
  registerSystemInfo,
  loginInfo,
  userPost,
  getPost,
  userUpdates,
  pst,
  verifyPhoneOtp,
  sendPhoneOtp,
  sendEmailOtp,
  verifyEmailOtp,
  uploadAudio,
  systeminfo,
} from "./controllers/controllers.js";

import multer from "multer";
import { connectCloudinary } from "./cloudniary.js";

dotenv.config();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const port = process.env.PORT;
const uri = process.env.MONGO_URI;

const app = express();
connectCloudinary();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.post("/register", register); //

app.post("/systemInfo", registerSystemInfo); //

app.post("/upload-audio", upload.single("file"), uploadAudio);

app.get("/info", systeminfo);

app.get("/user", user);

app.get("/loggedInUser", loggedInUser); //

app.post("/loginInfo", loginInfo); //

app.get("/userpost", userPost); //

app.get("/post", getPost);

app.post("/post", pst); //

app.patch("/userUpdates", userUpdates);

app.post("/send-phoneOtp", sendPhoneOtp);

app.post("/verify-phoneOtp", verifyPhoneOtp);

app.post("/verify-emailOtp", verifyEmailOtp);

app.post("/send-emailOtp", sendEmailOtp);


mongoose
  .connect(uri)
  .then(console.log("Database Connected"))
  .then(
    app.listen(port || 4000, () => {
      console.log(`Listening on port ${process.env.PORT}`);
    })
  );
