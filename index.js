const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const _ = require("lodash");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("config");
require('./startup/prod')(app);

// if (!config.get("jwtPrivateKey")) {
//   console.error("JWT private key is not set!");
//   process.exit(1);
// }

const port = 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});

mongoose.connect("mongodb+srv://akbarali:akbarali2206@cluster0.1t6ltwf.mongodb.net/dars?retryWrites=true&w=majority")
  .then(() => {
    console.log("Mongodbga muvaffiqyatli ulanildi...");
  })
  .catch((err) => {
    console.log("Mongobga ulanishda qandaydir hgatolik yuz berddi!", err);
  });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 1000,
  },
});

// userSchema.generateToken = function () {
//   const token = jwt.sign({ _id: this._id }, config.get("jwtPrivateKey"));
//   return token;
// };

const User = mongoose.model("User", userSchema);

let validat = false;
app.post("/api/users/login", async (req, res) => {
  const user = await User.findOne({
    name: req.body.name,
    password: req.body.password,
  });
  if (user) {
    validat = user;
  } else {
    res.status(400);
  }
});

app.get("/api/users/login", async (req, res) => {
  res.status(200).send(validat);
});

app.post("/api/users", async (req, res) => {
  if (!req.body) {
    return res.status(400).send("body is required");
  }
  const user = new User(_.pick(req.body, ["name", "password"]));
  const salt = await bcrypt.genSalt();
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();
  res.status(201).send(_.pick(user, ["_id", "name", "password"]));
  console.log(user);
});
// app.post("/api/login", async (req, res) => {
//   if (!req.body) {
//     return res.status(400).send("body is required");
//   }
//   let user = await User.findOne({ name: req.body.name });
//   if (!user) {
//     return res.status(404).send("User not found");
//   }
//   const isValidPassword = await bcrypt.compare(
//     req.body.password,
//     user.password
//   );
//   if (!isValidPassword) {
//     return res.status(400).send("Invalid password");
//   }

//   const token = user.generateToken();
//   res.header("x-auth-token", token).send(isValidPassword);
// });

app.get("/api/users", async (req, res) => {
  const users = await User.find();
  res.status(200).send(users);
});
