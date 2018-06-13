const express = require("express");
const multer = require("multer");
const upHandler = multer({
    dest: "uploads/",
});

const app = express();

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/static/index.html");
});

app.listen(3000);
console.log("Listening on port 3000");
