const express = require("express");
require("dotenv").config();
const path = require("path");
const fs = require("fs");
const app = express();

// config
let configValues = "config = {";
configValues += `clientUrl: "${process.env.CLIENT_URL}",`;
configValues += `apiUrl: "${process.env.API_URL}",`;
configValues += "};";

fs.writeFile(path.join(__dirname, "public", "js", "config.js"), configValues, () => {
    console.log("config file created");
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/*", function (req, res) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`App listening on port ${port}...`));