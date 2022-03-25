/**
 *
 * setup-package.js
 *
 * This file is used by publish system to build a clean npm package with the compiled js files in the root of the package.
 * It will not be included in the npm package.
 *
 **/

import fs from "fs";

// This script is called from within the build folder. It is important to include it in .npmignore, so it will not get published.
const sourceDirectory = __dirname + "/..";
const destinationDirectory = __dirname;

function main() {
  // Generate publish-ready package.json
  const source = fs
    .readFileSync(__dirname + "/../package.json")
    .toString("utf-8");
  const sourceObj = JSON.parse(source);
  sourceObj.scripts = {};
  sourceObj.devDependencies = {};
  fs.writeFileSync(
    `${destinationDirectory}/package.json`,
    Buffer.from(JSON.stringify(sourceObj, null, 2), "utf-8")
  );
  fs.copyFileSync(
    `${sourceDirectory}/README.md`,
    `${destinationDirectory}/README.md`
  );
  fs.copyFileSync(
    `${sourceDirectory}/LICENSE.md`,
    `${destinationDirectory}/.npmignore`
  );
  fs.copyFileSync(
    `${sourceDirectory}/.npmignore`,
    `${destinationDirectory}/.npmignore`
  );
}

main();
