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
  const sheet_file = await fs_sync.readFile(`${folder}/fonts.css`, "utf-8");
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
      const font_stretch = e.face.find((a) => a.property === "font-stretch");
      const font_display = e.face.find((a) => a.property === "font-display");
      const src = e.face.find((a) => a.property.includes("src"));
      const unicode_range = e.face.find((a) => a.property === "unicode-range");

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
  const computed_files = sheet.flatMap((a) =>
    a.src.map((b) => b.url.split("/").at(-1))
  );
  const files = await fs_sync.readdir(`${folder}/files`, {
    withFileTypes: true,
  });
  console.log(
    "Removendo %d/%d arquivos...",
    files.length - computed_files.length,
    files.length
  );
  for (const file of files) {
    if (
      ["WOFF", "WOFF2", "TTF", "OTF"].includes(
        file.name.split(".").at(-1).toUpperCase()
      ) &&
      !computed_files.includes(file.name)
    ) {
      await fs_sync.unlink(`${file.path}/${file.name}`);
    }
  }
  await fs_sync.writeFile(`${folder}/fonts.css`, sheet_p, "utf-8");
  console.log("Tudo pronto em %dms!", (performance.now() - a).toFixed(0));
}
