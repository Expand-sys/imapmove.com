const { ImapFlow } = require("imapflow");
const fs = require("fs");
const simpleParser = require("mailparser").simpleParser;
const path = require("path");

function client(login, password, server) {
  return new ImapFlow({
    host: server,
    port: 993,
    secure: true,
    auth: {
      user: login,
      pass: password,
    },
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

  if (source == undefined || dest == undefined) {
    return false;
  } else {
    let lock = await source.getMailboxLock("INBOX");
    const folder = Date.now();
    let parsed;
    try {
      const { uid } = await source.fetchOne("*", { uid: true });
      for (i = 1; i < uid; i++) {
        try {
          let { meta, content } = await source.download(i);
          await content.pipe(
            await fs.createWriteStream(path.resolve(__dirname, "./" + id))
          );
        } catch (e) {
          console.log(e);
          return false;
        } finally {
          await sleep(100);
          const buf = await Buffer.from(
            await fs.readFileSync(path.resolve(__dirname, "./" + id))
          );
          await dest.append("INBOX", buf);
          fs.rmSync(path.resolve(__dirname, "./" + id));
        }
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
