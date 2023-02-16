const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

//models
const users = require("../models/user");
const admins = require("../models/admin");
const projectManagers = require("../models/project-manager");
const projects = require("../models/projects");
const issues = require("../models/issues");
const comments = require("../models/comments");

const jwt = require("jsonwebtoken");
const db = "mongodb://127.0.0.1:27017/pms";
mongoose.Promise = global.Promise;

mongoose.connect(
  db,
  { useNewUrlParser: true, useUnifiedTopology: true },
  function (err) {
    if (err) {
      console.error("Error! " + err);
    } else {
      console.log("Connected to mongodb");
    }
  }
);

const verifyToken = async (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).send("Unauthorized request");
  }
  let token = req.headers.authorization.split(" ")[1];
  if (token === "null") {
    return res.status(401).send("Unauthorized request");
  }
  let payload = jwt.verify(token, "secretKey");
  if (!payload) {
    return res.status(401).send("Unauthorized request");
  }
  req.userId = payload.subject;
  next();
};

router.post("/register", async (req, res) => {
  try {
    let userData = req.body;
    const user = await users.findOne({ email: userData["email"] });
    if (!user) {
      let newUser = new users(userData);
      await newUser.save((err, registeredUser) => {
        if (err) {
          console.log(err);
        } else {
          let payload = { subject: registeredUser._id };
          let token = jwt.sign(payload, "secretKey");
          console.log(token);
          res.status(200).send({ token });
        }
      });
    } else {
      res.status(401).send("User already exists");
    }
  } catch (err) {
    console.log(err);
  }
});

router.post("/login", async (req, res) => {
  try {
    let userData = req.body;
    const user = await users.findOne({ email: userData.email });
    if (!user) {
      res.status(401).send("Invalid Email");
    } else if (user.password !== userData.password) {
      res.status(401).send("Invalid Password");
    } else {
      // let tokenInHeader = req.headers["x-access-token"];
      let tokenInHeader =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJqZWN0IjoiNjNlYTFiNzI2ZWFlODg0M2U4OTAxZDY2IiwiaWF0IjoxNjc2Mjg2ODM1fQ.QvYJoVslMB9QWOSSxvvbDL8IlbSFTDZuZaloO6Zq76Y";
      let payload = { subject: user._id };
      let token = jwt.sign(payload, "secretKey");
      if (!tokenInHeader) {
        res.status(401).send("Unauthorized request");
      } else if (token !== tokenInHeader) {
        res.status(401).send("Token Mismatch");
      } else {
        res.status(200).send({ token, user });
      }
    }
  } catch (err) {
    console.log(err);
  }
});

router.get("/:id", async (req, res) => {
  try {
    let userData = req.params;
    console.log(userData.id);
    const user = await users.findById(userData.id);
    if (!user) {
      res.status(401).send("User Does not Exists");
    } else {
      console.log("inside fetch by id user");
      res.status(200).send({ user });
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
