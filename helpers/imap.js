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
    emitLogs: true,
  });
}
async function sendFile(id) {}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}


function containsAny(str, substrings) {
  for (var i = 0; i != substrings.length; i++) {
     var substring = substrings[i];
     if (str.indexOf(substring) != - 1) {
       return substring;
     }
  }
  return null; 
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
    let arr = await source.list()
    arr.forEach(async mailbox=>{
      let lock = await source.getMailboxLock(`${mailbox.path}`);
      const folder = Date.now();
      let parsed;
      try {
        const { uid } = await source.fetchOne("*", { uid: true });
        for (let i = 1; i < uid; i++) {
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
            try{
              await dest.mailboxCreate(mailbox.path)
            } catch(e){
              //punch sand
            }
            
            await dest.append(`${mailbox.path}`, buf);
            fs.rmSync(path.resolve(__dirname, "./" + id));
          }
        }
      } catch (e) {
        console.log(e);
        return false;
      } finally {
        lock.release();
      }  
    });    
    console.log(arr)
    await source.logout();
    await dest.logout();
    return true;
  }
}

module.exports = {
  grabIMAP,
};
