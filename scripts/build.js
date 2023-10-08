import fs from "fs";
import os from "os";
import nwbuild from "nw-builder";
import options from "./options.js";

const { name, version } = JSON.parse(
  fs.readFileSync("./src/package.json").toString()
);
const buildName = [name, version, os.platform(), os.arch()].join("-");

nwbuild({
  ...options,
  mode: "build",
  flavor: "normal",
  outDir: `./out/${buildName}`,
  // zip: true,
  app: {
    icon: "./src/icon.ico",
  },
});
