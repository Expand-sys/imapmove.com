const { parentPort, workerData } = require("worker_threads");
const fs = require("fs");
let reply = await upload(data.dest, data.id);
parentPort.on("message", (data) => {
  parentPort.postMessage(reply);
});

async function upload(dest, id) {
  try {
    const buf = await Buffer.from(
      await fs.readFileSync(path.resolve(__dirname, "./" + id))
    );
    await dest.append("INBOX", buf);
    fs.rmSync(path.resolve(__dirname, "./" + id));
  } catch (e) {
    console.log(e);
    return `Failed ${id}`;
  } finally {
    return `Uploaded ${id}`;
  }
}
