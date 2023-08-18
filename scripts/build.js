import fs from "fs";
import os from "os";
import nwbuild from "nw-builder";

const { name, version } = JSON.parse(
  fs.readFileSync("./src/package.json").toString()
);
const buildName = [name, version, os.platform(), os.arch()].join("-");

nwbuild({
  version: "latest",
  flavor: "normal",
  // platform: "win",
  // arch: "x64",
  downloadUrl: "https://dl.nwjs.io",
  manifestUrl: "https://nwjs.io/versions",
  cacheDir: "./cache",
  srcDir: "./src",
  outDir: `./out/${buildName}`,
  // zip: true,
  glob: false,
  cache: true,
  ffmpeg: false,
  app: {
    icon: "./src/icon.ico",
  },
});
