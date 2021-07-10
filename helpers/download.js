const { parentPort, workerData } = require("worker_threads");
let reply = await upload(data.source, data.id);
parentPort.on("message", (data) => {
  parentPort.postMessage(reply);
});

async function download(source, id) {
  try {
    let { meta, content } = await source.download(i);
    await content.pipe(
      await fs.createWriteStream(path.resolve(__dirname, "./" + id))
    );
  } catch (e) {
    console.log(e);
    return `Failed to download ${id}`;
  } finally {
    return `Download Succeeded of ${id}`;
  }
}
