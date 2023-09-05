const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { generateFile } = require("./generateFile");
const { executeCpp } = require("./executeCpp");
const { executePy } = require("./executePy");
const Job = require("./models/Job");
main().catch((err) => console.log(err));

async function main() {
  await mongoose
    .connect("mongodb://127.0.0.1:27017/compilerapp")
    .then(() => console.log("Successfully connected to MongoDB!"))
    .catch((err) => console.error("Connection error:", err));
}

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/status", async (req, res) => {
  // GET/status?id = <jobid>
  const jobId = req.query.id;
  console.log("status requested", jobId);

  if (jobId == undefined) {
    return res
      .status(400)
      .json({ success: false, error: "missing id query param" });
  }
  try {
    const job = await Job.findById(jobId);

    if (job === undefined) {
      return res.json(404).json({ success: false, error: "Invalid jobID" }); // HTTP CODE 404: the requested resource could not be found but may be available in the future
    }

    return res.status(200).json({ success: true, job }); //HTTP CODE 200: the standard response for successful HTTP request
  } catch (err) {
    return res.status(400).json({ success: false, error: JSON.stringify(err) });
  }
});

app.post("/run", async (req, res) => {
  const { language = "cpp", code } = req.body; // es6 syntax

  console.log(language, code.length);

  if (code === undefined) {
    return res.status(400).json({ success: false, error: "Empty code body" });
  }

  let job;
  try {
    // we need to generate a c++ file with the content from the request
    const filepath = await generateFile(language, code);

    job = await new Job({ language, filepath }).save();
    const jobId = job["_id"];
    console.log(job);

    res.status(201).json({ success: true, jobId }); // HTTP Code 201: request has succeeded and has led to the creation of a resource.

    // we need to run the file and send the response back
    let output;
    job["startedAt"] = new Date();
    if (language === "cpp") {
      output = await executeCpp(filepath);
    } else {
      output = await executePy(filepath);
    }

    job["completedAt"] = new Date();
    job["status"] = "success";
    job["output"] = output;

    await job.save();

    console.log(job);
    //return res.json({ filepath, output });
  } catch (err) {
    job["completedAt"] = new Date();
    job["status"] = "error";
    job["output"] = JSON.stringify(err); // JSON.stringify can be helpful in converting complicated objects to  a JSON  string
    await job.save();

    console.log(job);
    // res.status(500).json({ err });
  }
});

app.listen(5000, () => {
  console.log("Listening on PORT 5000");
});
