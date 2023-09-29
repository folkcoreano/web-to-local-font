#!/usr/bin/env node

import Downloader from "nodejs-file-downloader";
import { readFile, writeFile } from "node:fs";
import minimist from "minimist";
import ora from "ora";

(async function read_sheet() {
  const a = performance.now();
  const argv = minimist(process.argv.slice(2));
  const url = argv.u;
  const folder = argv.f || "fonts";
  const spinner = ora("folha carregada... ").start();
  const download_sheet = new Downloader({
    url: url,
    directory: folder,
    fileName: "fonts.css",
    cloneFiles: false,
  });
  await download_sheet.download();
  readFile(
    `${folder}/fonts.css`,
    { encoding: "utf-8" },
    async (error, sheet_file) => {
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
      spinner.text = `${faces_mapped.length} font files loaded...`;
      let raw = sheet_file;
      let n_urls = 0;
      const downloads = [];
      for (const url of faces_mapped) {
        n_urls++;
        downloads.push(
          new Promise(async (res, rej) => {
            const download = new Downloader({
              url: url.url,
              fileName: url.name,
              directory: `${folder}/files`,
              cloneFiles: false,
            });
            await download.download();
            res();
          })
        );

        raw = raw.replaceAll(url.url, `'files/${url.name}'`);

        spinner.text = `baixando ${n_urls}/${faces_mapped.length}: ${url.name}... `;
      }
      await Promise.all(downloads);
      writeFile(`${folder}/fonts.css`, raw, { encoding: "utf-8" }, () => {
        spinner.succeed(
          `tudo pronto em ${(performance.now() - a).toFixed(2)}ms!`
        );
      });
    }
  );
})();
