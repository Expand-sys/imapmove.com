const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoose = require("mongoose");
const io = require("socket.io");
const imap = require("imap-simple");
const path = require("path");
const { grabIMAP } = require("./helpers/imap.js");
const app = express();
const fs = require("fs");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.set("trust proxy", 1);
app.use(
  session({
    secret: "expand dog",
    resave: true,
    saveUninitialized: true,
  })
);

app.get("/", function (req, res) {
  var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  res.render("index", {
    user: req.user,
    ip: ip,
  });
});



app.post("/transfer", async function (req, res) {
  const id = Date.now().toString()
  console.log(id)
  const {
    loginSource,
    loginDest,
    passwordSource,
    passwordDest,
    serverSource,
    serverDest,
  } = req.body;
  if (
    loginSource == "" ||
    loginDest == "" ||
    passwordSource == "" ||
    passwordDest == "" ||
    serverSource == "" ||
    serverDest == ""
  ) {
    res.render("index", {
      loginSource: loginSource,
      loginDest: loginDest,
      passwordSource: passwordSource,
      passwordDest: passwordDest,
      serverSource: serverSource,
      serverDest: serverDest,
    })
  } else {
    let result = await grabIMAP(
        loginSource,
        loginDest,
        passwordSource,
        passwordDest,
        serverSource,
        serverDest,
        id
      )

      if(result == false){
        res.render("index", {
          loginSource: loginSource,
          loginDest: loginDest,
          passwordSource: passwordSource,
          passwordDest: passwordDest,
          serverSource: serverSource,
          serverDest: serverDest,
        })
      }else{
        res.redirect("/finished");
      }


  }
});
app.get("/finished", function (req, res) {
  res.render("finished");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000...");
});
