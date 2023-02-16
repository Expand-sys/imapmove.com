const URL = "http://localhost:40051";
const socket = io(URL, { autoConnect: true });

export default socket;

socket.onAny((event, ...args) => {
  console.log(event, args);
});
socket.on("log", function (data) {
  console.log(data);
  var string = JSON.stringify(data);
  $("#log").append("<li>" + `${string}` + "</li>");
});
form.addEventListener("submit", (e) => {
  e.preventDefault();
  socket.emit("submit", {
    loginSource: $("#loginSource").val(),
    loginDest: $("#loginDest").val(),
    passwordSource: $("#passwordSource").val(),
    passwordDest: $("#passwordDest").val(),
    serverSource: $("#serverSource").val(),
    serverDest: $("#serverDest").val(),
  });
});
