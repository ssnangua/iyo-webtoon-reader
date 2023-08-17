import nwbuild from "nw-builder";

nwbuild({
  mode: "run",
  flavor: "sdk",
  srcDir: "./src",
  glob: false,
});
