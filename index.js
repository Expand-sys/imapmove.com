const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const http = require("http");
const imap = require("imap-simple");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
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
var server = http.createServer();
server.listen(1443);
var io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

io.sockets.on("connection", function (socket) {
  socket.on("submit", async function (data) {
    console.log(data);
    let id = uuidv4();
    let result = await grabIMAP(
      data.loginSource,
      data.loginDest,
      data.passwordSource,
      data.passwordDest,
      data.serverSource,
      data.serverDest,
      socket,
      id
    );
  });
  process.stdout.setEncoding("utf-8");
  process.stdout.on("data", function (data) {
    socket.emit("process_data", data);
  });
});

app.get("/", function (req, res) {
  var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  res.render("index", {
    user: req.user,
    ip: ip,
  });
});

app.get("/finished", function (req, res) {
  res.render("finished");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000...");
});
