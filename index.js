#!/usr/bin/env node
import Downloader from "nodejs-file-downloader";
import { readFile, writeFile, readdir, rm } from "node:fs";
import minimist from "minimist";
import ora from "ora";
const argv = minimist(process.argv.slice(2));
const folder = argv.f || "fonts";
const url = argv.u;
const purge = argv.p;

if (url) {
  const a = performance.now();
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
      if (error) return;
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
}

if (purge) {
  const a = performance.now();
  readFile(
    `${folder}/fonts.css`,
    { encoding: "utf-8" },
    async (error, sheet_file) => {
      if (error) return;
      const spinner = ora("folha carregada... ").start();
      const sheet = sheet_file
        .split("@font-face")
        .map((face) => {
          return {
            face: face.split(";").map((p) => {
              const item = p.split(":");
              return {
                property: item.at(0).replace("\n", "").replace("{", "").trim(),
                value: item.at(1),
              };
            }),
          };
        })
        .slice(1)
        .map((e) => {
          const font_family = e.face.find((a) => a.property === "font-family");
          const font_style = e.face.find((a) => a.property === "font-style");
          const font_weight = e.face.find((a) => a.property === "font-weight");
          const font_stretch = e.face.find(
            (a) => a.property === "font-stretch"
          );
          const font_display = e.face.find(
            (a) => a.property === "font-display"
          );
          const src = e.face.find((a) => a.property.includes("src"));
          const unicode_range = e.face.find(
            (a) => a.property === "unicode-range"
          );

          return {
            ["font-family"]: font_family ? font_family.value.trim() : "",
            ["font-style"]: font_style ? font_style.value.trim() : "",
            ["font-weight"]: font_weight ? font_weight.value.trim() : "",
            ["font-stretch"]: font_stretch ? font_stretch.value.trim() : "",
            ["font-display"]: font_display ? font_display.value.trim() : "",
            ["src"]: src ? src.value.trim() : "",
            ["unicode-range"]: unicode_range ? unicode_range.value.trim() : "",
          };
        })
        .map((e) => {
          return {
            ...e,
            src: e.src.split(",").map((f) => {
              const a = f.split("format(");
              const url = a.at(0).trim().substring(5).slice(0, -2);
              const format = a.at(1).trim().substring(1).slice(0, -2);
              return {
                url,
                format,
              };
            }),
          };
        });

      const sheet_p = sheet
        .map((m) => {
          return `@font-face {\n${
            m["font-family"] && `font-family: ${m["font-family"]};\n`
          }${m["font-style"] && `font-style: ${m["font-style"]};\n`}${
            m["font-display"] && `font-display: ${m["font-display"]};\n`
          }${m["font-weight"] && `font-weight: ${m["font-weight"]};\n`}${
            m["font-stretch"] && `font-stretch: ${m["font-stretch"]};\n`
          }${
            m["src"] &&
            `src: ${m["src"].map((e) => {
              return `url('${e.url}') format('${e.format}')`;
            })};\n`
          }${m["unicode-range"] && `unicode-range: ${m["unicode-range"]};\n`}}`;
        })
        .join("\n\n");

      writeFile(`${folder}/fonts.css`, sheet_p, { encoding: "utf-8" }, () => {
        readdir(`${folder}/files`, (error, files) => {
          if (error) return;
          const computed_files = sheet
            .flatMap((e) => e.src.map((a) => a.url))
            .map((e) => e.split("/").at(-1));
          for (const file of files) {
            if (!computed_files.includes(file)) {
              rm(`${folder}/files/${file}`, () => {});
            }
          }
          spinner.succeed(
            `tudo pronto em ${(performance.now() - a).toFixed(2)}ms!`
          );
        });
      });
    }
  );
}
