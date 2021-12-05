import fs from "fs";
import path from "path";
import https from "https";
import YAML from "yaml";
import { parse } from "marked";
import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { minify } from "html-minifier-terser";

const window = new JSDOM("").window;
const DOMPurify = createDOMPurify(window);

const DIST_DIR = "dist";

const DEFAULT_AVATAR =
  "data:image/png;base64,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";

const options = {
  headers: {
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
    "User-Agent": "actions/get-gist-action",
  },
};

const promises = [];

const data = YAML.parse(fs.readFileSync("deploy.yml", "utf8"));

const decorateHTML = function (content, options) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${
    options.title ? `${options.title} | ${data.title}` : data.title
  }</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,300italic,700,700italic">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/milligram/1.4.1/milligram.min.css">
  ${(options.styleSheets || []).map(
    (s) => `<link rel="stylesheet" href="${s}">`
  )}
  ${
    options.favicon
      ? '<link rel="icon" type="image/x-icon" href="favicon.ico">'
      : ""
  }
</head>
<body><main class="wrapper">${DOMPurify.sanitize(content)}</main></body>
</html>`;
};

const generateIndex = async function (index) {
  return await minify(
    decorateHTML(
      [
        `<header class="container center header">`,
        `<img src="${
          data.gravatar
            ? `https://gravatar.com/avatar/${data.gravatar}?s=200`
            : DEFAULT_AVATAR
        }" alt="Avatar" class="img avatar">`,
        `<h1 class="title">${data.title}</h1>`,
        `</header>`,
        `<section class="container center">`,
        ...index.map(
          (i) =>
            `<a class="button button--link" href="${i.url}"><p class="button__text">${i.title}</p></a>`
        ),
        `</section>`,
      ].join(""),
      {
        title: `Home`,
        favicon: data.index.copy?.find((f) => f.output === "favicon.ico"),
        styleSheets: data.index.styleSheets,
      }
    )
  );
};

const writeFile = async function (_filename, file, options) {
  let filename = _filename;
  let content = undefined;
  switch (filename.split(".")[1]) {
    case "md":
      filename = filename.replace(".md", ".html");
      content = await minify(
        `<section class="container">${decorateHTML(
          parse(file["content"]),
          options
        )}</section>`,
        {
          collapseWhitespace: true,
          removeComments: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
        }
      );
      break;
    default:
      content = file["content"];
  }
  fs.writeFileSync(filename, content);
  console.log(`Gist ${_filename} is written to ${filename} successfully.`);
};

if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}
for (let copy of data.index.copy) {
  let filename = path.join(DIST_DIR, copy.output);
  fs.copyFileSync(copy.input, filename);
  console.log(`File ${copy.input} is written to ${filename} successfully.`);
}

for (let linkConfig of data.links) {
  let outputDir = path.join(DIST_DIR, linkConfig.outputDir);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (let copy of linkConfig.copy || []) {
    let filename = path.join(outputDir, copy.output);
    fs.copyFileSync(copy.input, filename);
    console.log(`File ${copy.input} is written to ${filename} successfully.`);
  }

  if (linkConfig.gistID) {
    promises.push(
      new Promise((resolve, reject) =>
        https
          .get(
            `https://api.github.com/gists/${linkConfig.gistID}`,
            options,
            (resp) => {
              if (resp.statusCode !== 200) {
                reject(`Got an error: ${resp.statusCode}`);
              }

              let data = "";
              resp.on("data", (chunk) => {
                data += chunk;
              });

              resp.on("end", async () => {
                console.log(
                  `Gotten gist ${linkConfig.gistID} successfully from GitHub.`
                );
                let parsed = JSON.parse(data);
                let options = {
                  title: parsed.description,
                  favicon:
                    parsed.files["favicon.ico"] !== undefined ||
                    linkConfig.copy?.find((f) => f.output === "favicon.ico"),
                };
                let files = Object.values(parsed.files);
                for (let file of files) {
                  await writeFile(
                    path.join(outputDir, file.filename),
                    file,
                    options
                  );
                }
                resolve({
                  title: parsed.description,
                  url: linkConfig.outputDir,
                });
              });
            }
          )
          .on("error", (err) => {
            reject(`Error getting gist: ${err.message}`);
          })
      )
    );
  }
}

const index = await Promise.all(promises);

const indexContent = await generateIndex(index);

fs.writeFileSync(path.join(DIST_DIR, "index.html"), indexContent);
