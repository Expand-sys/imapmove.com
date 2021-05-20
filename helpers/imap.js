const { ImapFlow } = require("imapflow");
const fs = require("fs");
const simpleParser = require("mailparser").simpleParser;

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

async function grabIMAP(
  loginSource,
  loginDest,
  passwordSource,
  passwordDest,
  serverSource,
  serverDest
) {
  const source = client(loginSource, passwordSource, serverSource);
  await source.connect();
  const dest = client(loginDest, passwordDest, serverDest);
  await dest.connect();

  let lock = await source.getMailboxLock("INBOX");
  const folder = Date.now();
  let parsed;
  try {
    const { uid } = await source.fetchOne("*", { uid: true });
    for (i = 1; i < uid; i++) {
      try {
        let { meta, content } = await source.download(i);
        await content.pipe(fs.createWriteStream("tmp.eml"));
      } catch (e) {
        console.log(e);
      } finally {
        const buf = Buffer.from(fs.readFileSync("./tmp.eml"));
        await dest.append("INBOX", buf);
      }
    }
  } catch (e) {
    console.log(e);
  } finally {
    lock.release();
  }
  await source.logout();
  await dest.logout();
  return "yes";
}

module.exports = {
  grabIMAP,
};
