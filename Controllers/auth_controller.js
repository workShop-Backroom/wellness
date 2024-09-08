const User = require("../Models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");



const Conversation = require("../Models/Conversation.js");
const ObjectId = require("mongoose").Types.ObjectId;
const cloudinary = require("cloudinary").v2;
const imageupload = require("../config/imageupload.js");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const JWT_SECRET = process.env.JWT_SECRET;

let mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_ClOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// const register = async (req, res) => {
//   try {
//     console.log("register request received");

//     const { name, email, password, phoneNum } = req.body;
//     if (!name || !email || !password || !phoneNum) {
//       return res.status(400).json({
//         error: "Please fill all the fields",
//       });
//     }

//     const user = await User.findOne({ email });
//     if (user) {
//       return res.status(400).json({
//         error: "User already exists",
//       });
//     }

//     var imageUrl = "";
//     if (req.file != null) {
//       imageUrl = await imageupload(req.file);
//     } else {
//       imageUrl = `https://ui-avatars.com/api/?name=${name}&background=random&bold=true`;
//     }

//     const salt = await bcrypt.genSalt(10);
//     const secPass = await bcrypt.hash(password, salt);

//     const newUser = new User({
//       name,
//       email,
//       password: secPass,
//       phoneNum,
//       profilePic: imageUrl,
//     });

//     await newUser.save();

//     res.status(201).json({
//       message: "User registered successfully",
//     });
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send("Internal Server Error");
//   }
// };


const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Configure storage as needed

const register = async (req, res) => {
  try {
    const { name, email, password, phoneNum } = req.body;

    if (!name || !email || !password || !phoneNum) {
      return res.status(400).json({ error: "Please fill all the fields" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "User already exists" });
    }

    let voiceRecordingUrl = null;
    if (req.file) {
      voiceRecordingUrl = req.file.path; // Save path or URL to the file
    }

    const salt = await bcrypt.genSalt(10);
    const secPass = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: secPass,
      phoneNum,
      voiceRecording: voiceRecordingUrl,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};


const login = async (req, res) => {
  console.log("login request received");

  try {
    const { email, password, otp } = req.body;

    if (!email || (!password && !otp)) {
      return res.status(400).json({
        error: "Please fill all the fields",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        error: "Invalid Credentials",
      });
    }

    if (otp) {
      if (user.otp != otp) {
        return res.status(400).json({
          error: "Invalid otp",
        });
      }
      user.otp = "";
      await user.save();
    } else {
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res.status(400).json({
          error: "Invalid Credentials",
        });
      }
    }

    res.json({
      user: {
        _id: user.id,
        name: user.name,
        email: user.email,
        phoneNum: user.phoneNum,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};


// const authUser = async (req, res) => {
//   const token = req.header("auth-token");
//   if (!token) {
//     res.status(401).send("Please authenticate using a valid token");
//   }

//   try {
//     const data = jwt.verify(token, JWT_SECRET);

//     if (!data) {
//       return res.status(401).send("Please authenticate using a valid token");
//     }

//     const user = await User.findById(data.user.id).select("-password");
//     res.json(user);
//   } catch (error) {
//     console.error(error.message);
//     res.status(500).send("Internal Server Error");
//   }
// };

const allUser = async (req, res) => {
  const requser = req.user;

  try {
    const users = await User.find().select("-password");
    //filter users such bot for other users are not included
    users.forEach((user) => {
      if (user.email.includes("bot") && user.email != requser.email) {
        users.splice(users.indexOf(user), 1);
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const updateprofile = async (req, res) => {
  try {
    const dbuser = await User.findById(req.user.id);

    if (req.body.newpassword) {
      const passwordCompare = await bcrypt.compare(
        req.body.oldpassword,
        dbuser.password
      );
      if (!passwordCompare) {
        return res.status(400).json({
          error: "Invalid Credentials",
        });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.newpassword, salt);
      req.body.password = secPass;

      delete req.body.oldpassword;
      delete req.body.newpassword;
    }
    await User.findByIdAndUpdate(req.user.id, req.body);
    res.status(200).json({ message: "Profile Updated" });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
};

const sendotp = async (req, res) => {
  try {
    console.log("sendotp request received");
    const { email } = req.body;
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({
        error: "User not found",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    user.otp = otp;
    await user.save();

    //delete otp after 5 minutes
    setTimeout(() => {
      user.otp = "";
      user.save();
    }, 300000);

    let mailDetails = {
      from: process.env.EMAIL,
      to: email,
      subject: "Login with your Otp",

      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
          <title>Otp for Login</title>
          <style>
              .container {
                  width: 50%;
                  margin: 0 auto;
                  background: #f4f4f4;
                  padding: 20px;
              }
              h1 {
                  text-align: center;
              }
    
          </style> 
      </head>
      <body>
              <strong><h1>Conversa - online chatting app</h1></strong>
          <div class="container">
              <h2>Your Otp is</h2>
              <strong><p>${otp}</p><strong>
              <p>Use this Otp to login</p>
          </div>
      </body>
      </html>`,
    };

    await mailTransporter.sendMail(mailDetails, function (err, data) {
      if (err) {
        console.log("Error Occurs", err);
        res.status(400).json({ message: "Error Occurs" });
      } else {
        console.log("Email sent successfully");
        res.status(200).json({ message: "OTP sent" });
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};

const updateVoiceAndBot = async (req, res) => {
  try {
    const { voiceRecording, aiBotEnabled } = req.body;

    let voiceRecordingUrl = null;
    if (req.file) {
      voiceRecordingUrl = req.file.path; // Save path or URL to the file
    }

    await User.findByIdAndUpdate(req.user.id, {
      voiceRecording: voiceRecordingUrl,
      aiBotEnabled: aiBotEnabled,
    });

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
};



module.exports = {
  register,
  login,
  allUser,
  updateprofile,
  sendotp,
  updateVoiceAndBot,
};