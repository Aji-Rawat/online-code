const { exec } = require("child_process");

const executePy = (filepath) => {
  return new Promise((resolve, reject) => {
    exec(
      // exec is executing the py file, filepath tells us where file is present , and outPath is where we want to store the output, ./a.out --> ./jobId.exe
      `python ${filepath}`,
      (error, stdout, stderr) => {
        error && reject({ error, stderr });
        stderr && reject(stderr);

        //if (error || stderr) reject({ error, stderr });
        resolve(stdout);
      }
    );
  });
};

module.exports = {
  executePy,
};
