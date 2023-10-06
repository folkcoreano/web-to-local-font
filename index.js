#!/usr/bin/env node
import fs from "node:fs";
import fs_sync from "node:fs/promises";
import https from "node:https";

const args = process.argv;
const purge = args.some((e) => e === "-p");
const folder = args.some((e) => e === "-f")
  ? args[args.indexOf("-f") + 1]
  : "fonts";
const url = args.some((e) => e === "-u") ? args[args.indexOf("-u") + 1] : false;
if (url) {
  const a = performance.now();
  await fs_sync.mkdir(`${folder}/files/`, { recursive: true });
  const sheet_path = `${folder}/fonts.css`;
  const writer = fs.createWriteStream(sheet_path);
  https.get(url, (response) => {
    response.pipe(writer);
    writer.on("finish", async () => {
      const sheet_file = await fs_sync.readFile(sheet_path, {
        encoding: "utf-8",
      });
      const sheet_files = sheet_file
        .split("@font-face")
        .slice(1)
        .flatMap((a) =>
          a
            .split("src:")
            .at(1)
            .split(";")
            .at(0)
            .trim()
            .split(",")
            .map((b) => b.trim().split(" ").at(0).substring(4).slice(0, -1))
            .map((c) => {
              return {
                url: c,
                nome: c.split("/").at(-1),
              };
            })
        );
      console.log("Baixando %d arquivos...", sheet_files.length);
      const downloads = [];
      let new_css = sheet_file;
      for (const file of sheet_files) {
        const file_writer = fs.createWriteStream(
          `${folder}/files/${file.nome}`
        );
        downloads.push(
          new Promise((resolve, reject) => {
            https.get(file.url, (response) => {
              response.pipe(file_writer);
              file_writer.on("finish", resolve);
            });
          })
        );
        new_css = new_css.replaceAll(file.url, `'files/${file.nome}'`);
      }
      await Promise.all(downloads);
      await fs_sync.writeFile(`${folder}/fonts.css`, new_css, {
        encoding: "utf-8",
      });
      console.log("Tudo pronto em %dms!", (performance.now() - a).toFixed(0));
    });
  });
}
if (purge) {
  const a = performance.now();
  const r = {
    0: "font-family",
    1: "font-style",
    2: "font-weight",
    3: "font-stretch",
    4: "font-display",
    5: "unicode-range",
  };
  const sheet_file = await fs_sync.readFile(`${folder}/fonts.css`, {
    encoding: "utf-8",
  });
  const sheet = sheet_file
    .split("@font-face")
    .map((face) =>
      face.split(";").map((p) => {
        const item = p.split(":");
        return {
          [item.at(0).replace("\n", "").replace("{", "").trim()]: item.at(1),
        };
      })
    )
    .slice(1)
    .map((e) => {
      const obj = {};
      for (const v of e) {
        obj[Object.keys(v)[0]] = Object.values(v)[0];
      }
      return {
        [r[0]]: r[0] in obj ? obj[r[0]].trim() : "",
        [r[1]]: r[1] in obj ? obj[r[1]].trim() : "",
        [r[2]]: r[2] in obj ? obj[r[2]].trim() : "",
        [r[3]]: r[3] in obj ? obj[r[3]].trim() : "",
        [r[4]]: r[4] in obj ? obj[r[4]].trim() : "",
        ["src"]: "src" in obj ? obj["src"].trim() : "",
        [r[5]]: r[5] in obj ? obj[r[5]].trim() : "",
      };
    })
    .map((e) => {
      return {
        ...e,
        src: e.src.split(",").map((f) => {
          const item = f.split("format(");
          const url = item.at(0).trim().substring(5).slice(0, -2);
          const format = item.at(1).trim().substring(1).slice(0, -2);
          return {
            url,
            format,
          };
        }),
      };
    });
  const sheet_p = `${sheet
    .map((m) => {
      return `@font-face {\n${m[r[0]] && `\t${r[0]}: ${m[r[0]]};\n`}${
        m[r[1]] && `\t${r[1]}: ${m[r[1]]};\n`
      }${m[r[4]] && `\t${r[4]}: ${m[r[4]]};\n`}${
        m[r[2]] && `\t${r[2]}: ${m[r[2]]};\n`
      }${m[r[3]] && `\t${r[3]}: ${m[r[3]]};\n`}${
        m["src"] &&
        `\tsrc: ${m["src"].map((e) => {
          return `url('${e.url}') format('${e.format}')`;
        })};\n`
      }${m[r[5]] && `\t${r[5]}: ${m[r[5]]};\n`}}`;
    })
    .join("\n\n")}\n`;
  const sh_files = sheet.flatMap((a) =>
    a.src.map((b) => b.url.split("/").at(-1))
  );
  const files = await fs_sync.readdir(`${folder}/files`);
  console.log(
    "Removendo %d/%d arquivos...",
    files.length - sh_files.length,
    files.length
  );
  for (const file of files) {
    if (
      ["WOFF", "WOFF2", "TTF", "OTF"].includes(
        file.split(".").at(-1).toUpperCase()
      ) &&
      !sh_files.includes(file)
    ) {
      await fs_sync.unlink(`${folder}/${file}`);
    }
  }
  await fs_sync.writeFile(`${folder}/fonts.css`, sheet_p, {
    encoding: "utf-8",
  });
  console.log("Tudo pronto em %dms!", (performance.now() - a).toFixed(0));
}
