import fs from "fs";
import os from "os";
import nwbuild from "nw-builder";
import archiver from "archiver";

const { name, version } = JSON.parse(
  fs.readFileSync("./src/package.json").toString()
);
const buildName = [name, version, os.platform(), os.arch()].join("-");
const outDir = `./out/${buildName}`;
const outZip = `./out/${buildName}.zip`;

function build() {
  return nwbuild({
    version: "latest",
    flavor: "normal",
    // platform: "win",
    // arch: "x64",
    downloadUrl: "https://dl.nwjs.io",
    manifestUrl: "https://nwjs.io/versions",
    cacheDir: "./cache",
    outDir,
    srcDir: "./src",
    glob: false,
    cache: true,
    ffmpeg: false,
    app: {
      icon: "./src/icon.ico",
    },
  });
}

function pack() {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outZip);
    const archive = archiver("zip", { zlib: { level: 9 } });
    output.on("close", () => {
      console.log(archive.pointer() + " total bytes");
      resolve();
    });
    output.on("end", () => console.log("Data has been drained"));
    archive.on("warning", (err) => reject(err));
    archive.on("error", (err) => reject(err));
    archive.pipe(output);
    archive.directory(outDir, buildName);
    archive.finalize();
  });
}

(async () => {
  await build();
  await pack();
})();
