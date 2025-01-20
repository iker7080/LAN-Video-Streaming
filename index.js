const express = require("express");
const app = express();
const fs = require("fs");


app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/video", function (req, res) {
  const starttime = Date.now();
  // Ensure there is a range given for the video
  const range = req.headers.range;
  if (!range) {
    return res.status(400).send("Requires Range header");
  }
  console.log(range);

  // get video stats (about 61MB)
  const videoPath = "test_video.mp4";
  const videoSize = fs.statSync("test_video.mp4").size;

  // Parse Range
  // Example: "bytes=32324-"
  const CHUNK_SIZE = (10 ** 6); // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  // Create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // HTTP Status 206 for Partial Content
  res.writeHead(206, headers);

  // create video read stream for this particular chunk
  const videoStream = fs.createReadStream(videoPath, { start, end });

  // Stream the video chunk to the client
  const endtime = Date.now();
  videoStream.pipe(res);
  console.log("Server processing time (milliseconds):",endtime-starttime);
});

app.listen(8100, function () {
  console.log("Listening on port 8100!");
});