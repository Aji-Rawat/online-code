const express = require("express");
const cors = require("cors");

const { generateFile } = require("./generateFile");
const { executeCpp } = require("./executeCpp");
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  return res.json({ hello: "World!" });
});

app.post("/run", async (req, res) => {
  const { language = "cpp", code } = req.body; // es6 syntax

  if (code === undefined) {
    return res.status(400).json({ success: false, error: "Empty code body" });
  }
  try {
    // we need to generate a c++ file with the content from the request
    const filepath = await generateFile(language, code);

    // we need to run the file and send the response back
    const output = await executeCpp(filepath);

    return res.json({ filepath, output });
  } catch (err) {
    res.status(500).json({ err });
  }
});

app.listen(5000, () => {
  console.log("Listteing on pport 5000");
});
