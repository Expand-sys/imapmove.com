const { ImapFlow } = require("imapflow");
const fs = require("fs");
const simpleParser = require("mailparser").simpleParser;
const path = require("path");
const { Worker } = require("worker_threads");
const { StaticPool } = require("node-worker-threads-pool");

function client(login, password, server) {
  return new ImapFlow({
    host: server,
    port: 993,
    secure: true,
    auth: {
      user: login,
      pass: password,
    },
    emitLogs: true,
  });
}
async function sendFile(id) {}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function grabIMAP(
  loginSource,
  loginDest,
  passwordSource,
  passwordDest,
  serverSource,
  serverDest,
  socket,
  id
) {
  let source, dest;
  try {
    source = client(loginSource, passwordSource, serverSource);
    await source.connect();
    dest = client(loginDest, passwordDest, serverDest);
    await dest.connect();
  } catch (e) {
    console.log(e);
  }
  source.on("log", (entry) => {
    socket.emit(`log`, {
      log: entry,
    });
  });
  if (source == undefined || dest == undefined) {
    return false;
  } else {
    let lock = await source.getMailboxLock("INBOX");
    const folder = Date.now();
    let parsed;
    try {
      const { uid } = await source.fetchOne("*", { uid: true });
      const pool1 = new StaticPool({
        size: 8,
        task: "./helpers/download.js",
      });
      const pool2 = new StaticPool({
        size: 8,
        task: "./helpers/upload.js",
      });

      for (i = 1; i < uid; i++) {
        let num = i;
        pool1
          .exec({
            id: num,
            source: source,
          })
          .then((result) => {
            console.log(result);
          });
        pool2
          .exec({
            id: num,
            dest: dest,
          })
          .then((result) => {
            console.log(result);
          });
      }
    } catch (e) {
      console.log(e);
      return false;
    } finally {
      lock.release();
    }
    await source.logout();
    await dest.logout();
    return true;
  }
}

module.exports = {
  grabIMAP,
};
