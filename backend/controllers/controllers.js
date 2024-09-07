import otpGenerator from "otp-generator";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import streamifier from "streamifier";
import users from "../models/users.js";
import posts from "../models/post.js";
import OtpModel from "../models/otp.js";
import { otpVerification } from "../otpValidate.js";
import systemInfo from "../models/systemInfo.js";
import { v2 as cloudinary } from "cloudinary";
import { UAParser } from "ua-parser-js";

dotenv.config();

export const register = async (req, res) => {
  const { username, phoneNumber, name, email } = req.body.user;
  const result = await users.create({ username, phoneNumber, name, email });
  res.send(result);
};

export const registerSystemInfo = async (req, res) => {
  console.log(req.body.systemInfo);
  const { email, browser, os, ip, device, phoneNumber, city, country, state } =
    req.body.systemInfo;
  const result = await systemInfo.create({
    email,
    phoneNumber,
    browser,
    os,
    ip,
    device,
    country,
    state,
    city,
  });
  res.send(result);
};

export const user = async (req, res) => {
  const user = await users.find();
  res.send(user);
};

export const loggedInUser = async (req, res) => {
  const email = req.query.email;
  const phoneNumber = req.query.phoneNumber;
  let user;
  if (!phoneNumber) {
    user = await users.find({ email: email });
  } else {
    user = await users.find({ phoneNumber: phoneNumber });
  }
  res.send(user);
};

export const userPost = async (req, res) => {
  console.log("USERPOST", req.query);
  const email = req.query.email;
  const phoneNumber = req.query.phoneNumber;
  let post;
  if (!phoneNumber) {
    post = await posts.find({ email: email });
  } else {
    post = await posts.find({ phoneNumber: phoneNumber });
  }
  res.send(post);
};

export const getPost = async (req, res) => {
  const post = await posts.find();

  res.send(post);
};

export const pst = async (req, res) => {
  try {
    const {
      post,
      profileImage,
      photo,
      username,
      phoneNumber,
      name,
      email,
      audio,
    } = req.body;

    // Create a new post
    const result = await posts.create({
      post,
      profileImage,
      photo,
      username,
      name,
      email,
      audio,
      phoneNumber,
    });
    console.log(result);
    // Send a success response
    res.status(201).json(result);
  } catch (error) {
    console.error("Error in pst function:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the post" });
  }
};

export const uploadAudio = async (req, res) => {
  try {
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    // Create a promise for the upload to use async/await syntax
    const uploadPromise = () => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "video" },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        streamifier.createReadStream(audioFile.buffer).pipe(uploadStream);
      });
    };

    const audioUpload = await uploadPromise();
    console.log(audioUpload);
    res.status(201).json(audioUpload); // Send a proper success status code
  } catch (error) {
    console.error("Error in pst function:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the audio file" });
  }
};
export const userUpdates = async (req, res) => {
  try {
    console.log("QUERY", req.query);
    console.log("BODY", req.body);
    // Extract email and phoneNumber from query parameters
    const email = req.query?.email;
    const phoneNumber = req.query?.phoneNumber;

    // Construct filter based on provided parameters
    let filter = {};
    if (phoneNumber) {
      filter.phoneNumber = phoneNumber; // Clean phone number if necessary
      console.log("phoneFilter", filter);
    } else if (email) {
      filter.email = email;
      console.log("emailFilter", filter.email);
    } else {
      return res
        .status(400)
        .json({ message: "Email or phone number is required." });
    }

    // Extract profile data from the request body
    const profile = req.body;

    // Prepare the update document
    const updateDoc = { $set: profile };
    const options = { upsert: true };

    // Update the document
    const result = await users.updateOne(filter, updateDoc, options);
    const count = await posts.countDocuments({ email: email });
    const count2 = await posts.countDocuments({ phoneNumber: phoneNumber });

    // Check if the count is not zero
    if (count > 0 && count2 > 0) {
      console.log(email);
      console.log(`There are ${count} documents in the collection.`);
      await posts.updateMany(filter, updateDoc, options);
    } else {
      console.log("No documents found in the collection.");
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating user:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the user." });
  }
};

export const sendPhoneOtp = async (req, res) => {
  try {
    const phoneNumber = "+" + req.body.phoneNumber;
    console.log(phoneNumber);
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const cDate = new Date();

    await OtpModel.findOneAndUpdate(
      { phoneNumber },
      { otp, otpExpiration: new Date(cDate.getTime()) },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await fetch('https://gateway.seven.io/api/sms', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.X_RAPID_API, // Use environment variable for API key
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        to: phoneNumber,  // Use data from req.body or fallback to default
        from: 'Twitter Clone App',
        text: `Your OTP is: ${otp}`
      })
    });
    return res.status(200).json({
      success: true,
      msg: otp,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

export const verifyPhoneOtp = async (req, res) => {
  try {
    console.log(req.body.bodyData);
    const otp = req.body.bodyData.otp;
    const phoneNumber = req.body.bodyData.phoneNumber2;

    const otpData = await OtpModel.findOne({
      phoneNumber,
      otp,
    });

    if (!otpData) {
      return res.status(400).json({
        success: false,
        msg: "Your entered wrong OTP!",
      });
    }

    const isOtpExpired = await otpVerification(otpData.otpExpiration);

    if (isOtpExpired) {
      return res.status(400).json({
        success: false,
        msg: "Your OTP has been expired!",
      });
    }

    return res.status(200).json({
      success: true,
      msg: "OTP Verified Successfully!",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

export const verifyEmailOtp = async (req, res) => {
  try {
    console.log(req.body);
    const otp = req.body.bodyData.otp;
    const email = req.body.bodyData.email;

    const otpData = await OtpModel.findOne({
      email,
      otp,
    });
    console.log("otpdata", otpData);

    if (!otpData) {
      return res.status(400).json({
        success: false,
        msg: "Your entered wrong OTP!",
      });
    }

    const isOtpExpired = await otpVerification(otpData.otpExpiration);

    if (isOtpExpired) {
      return res.status(400).json({
        success: false,
        msg: "Your OTP has been expired!",
      });
    }

    return res.status(200).json({
      success: true,
      msg: "OTP Verified Successfully!",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      msg: error.message,
    });
  }
};

export const sendEmailOtp = async (req, res) => {
  const { userEmail } = req.body;

  let config = {
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  };

  let transporter = nodemailer.createTransport(config);

  const otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });

  const cDate = new Date();

  await OtpModel.findOneAndUpdate(
    { userEmail },
    { otp, otpExpiration: new Date(cDate.getTime()) },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  let MailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Mailgen",
      link: "https://mailgen.js/",
    },
  });

  let response = {
    body: {
      name: `${userEmail}`,
      intro: `Your OTP for changing language is : ${otp}`,
    },
  };

  let mail = MailGenerator.generate(response);

  let message = {
    from: process.env.EMAIL,
    to: userEmail,
    subject: "OTP for changing language",
    html: mail,
  };

  transporter
    .sendMail(message)
    .then(() => {
      return res.status(201).json({
        msg: "you should receive an email",
        otp: `${otp}`,
      });
    })
    .catch((error) => {
      return res.status(500).json({ error });
    });
};

export const systeminfo = (req, res) => {
  const ua = req.headers["user-agent"];
  console.log(ua);

  let parser = new UAParser(ua);
  let parserResults = parser.getResult();

  console.log(parserResults);

  res.send(parserResults);
};

export const loginInfo = async (req, res) => {
  const { email } = req.body;
  let { phoneNumber } = req.body;
  phoneNumber = phoneNumber?.replace("+", "");
  console.log("email", email);
  console.log(phoneNumber);
  let user;
  if (!phoneNumber) {
    user = await systemInfo.find({ email: email });
  } else {
    user = await systemInfo.find({ phoneNumber: phoneNumber });
  }
  console.log(user);
  res.send(user);
};
