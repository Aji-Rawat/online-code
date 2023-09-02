const { exec } = require("child_process");
const { error } = require("console");
const fs = require("fs");
const path = require("path");

const outputPath = path.join(__dirname, "outputs");
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}
const executeCpp = (filepath) => {
  //[6ad2e5ce-edf7-414b-b1c6-69f860e0be2b.cpp]

  const jobId = path.basename(filepath).split(".")[0];
  const outPath = path.join(outputPath, `${jobId}.exe`);

  return new Promise((resolve, reject) => {
    exec(
      // exec is executing the cpp file, filepath tells us where file is present , and outPath is where we want to store the output, ./a.out --> ./jobId.exe
      `g++ "${filepath}" -o "${outPath}" && cd "${outputPath}" && .\\${jobId}.exe`,
      (error, stdout, stderr) => {
        // error && reject({ error, stderr });
        // stderr && reject(stderr);

        if (error || stderr) reject({ error, stderr });
        resolve(stdout);
      }
    );
  });
};

module.exports = {
  executeCpp,
};