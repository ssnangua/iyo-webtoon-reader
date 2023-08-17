const path = require("path");
const StreamZip = require("node-stream-zip");

const imageRule = /\.(jpg|jpeg|png|webp|gif|bmp)$/i;

let zips = [];

async function load(file) {
  const zip = new StreamZip.async({ file });
  zips.push(zip);

  // const entriesCount = await zip.entriesCount;
  // console.log(`Entries read: ${entriesCount}`);

  const entries = await zip.entries();
  return Object.values(entries)
    .filter((entry) => !entry.isDirectory && imageRule.test(entry.name))
    .map((entry) => {
      return {
        folder: path.basename(file),
        zip,
        name: entry.name,
      };
    });
}

function closeAll() {
  zips.forEach((zip) => zip.close());
  zips = [];
}

export default {
  load,
  closeAll,
};
