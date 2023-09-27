#!/usr/bin/env node

import Downloader from "nodejs-file-downloader";
import fs from "fs";
import minimist from "minimist";

const argv = minimist(process.argv.slice(2));
const url = argv.f;

async function read_sheet(sheet) {
  console.log("loading...");
  const download_sheet = new Downloader({
    url: sheet,
    directory: "./fonts/",
    fileName: "fonts.css",
  });
  await download_sheet.download();

  const sheet_file = fs.readFileSync("./fonts/fonts.css", {
    encoding: "utf-8",
  });

  const faces = sheet_file.split("@font-face").slice(1);

  const faces_mapped = [];

  for (const face of faces) {
    const src = face
      .split("src: ")
      .at(1)
      .split("unicode-range")
      .at(0)
      .split(", ")
      .map((url) => {
        const meta_name = url
          .split(" format")
          .at(0)
          .split("url(")
          .at(1)
          .split(")")
          .at(0);

        return {
          url: meta_name,
          name: meta_name.split("/").at(-1),
        };
      });

    faces_mapped.push(...src);
  }

  let raw = sheet_file;
  for (const url of faces_mapped) {
    const download = new Downloader({
      url: url.url,
      fileName: url.name,
      directory: "./fonts/files",
      onProgress: (progress) => {
        console.log(progress);
      },
    });
    raw = raw.replaceAll(url.url, `'files/${url.name}'`);
    await download.download();
  }
  fs.writeFileSync("./fonts/fonts.css", raw, { encoding: "utf-8" });
  console.log("terminou!");
}
await read_sheet(url);
