const axios = require('axios');
const fs = require('fs');
const path = require('path');
const apiKey = 'API_KEY';
const contractAddress = 'CONTRACT_ADDRESS';
const solidityVersion = '^0.8.0';

async function fetchContractSource() {
  const url = `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${apiKey}`;

  try {
    const response = await axios.get(url);
    const contractData = response.data.result[0];

    if (contractData.SourceCode === "") {
      console.log("No verified source code found for this address.");
      return;
    }

    const sources = JSON.parse(contractData.SourceCode.slice(1, -1)).sources;
    let flattenedCode = `// SPDX-License-Identifier: MIT\npragma solidity ${solidityVersion};\n\n`;

    for (let file in sources) {
      flattenedCode += await resolveImports(sources[file].content, path.dirname(file));
    }

    fs.writeFileSync(`${contractAddress}_flattened.sol`, flattenedCode);
    console.log("Contract flattened successfully!");
  } catch (error) {
    console.error("Error fetching contract source code:", error);
  }
}

async function resolveImports(content, dir) {
  let lines = content.split('\n');
  let result = "";

  for (let line of lines) {
    if (line.trim().startsWith("pragma solidity")) ;
      continue;
    }

    if (line.trim().startsWith("import")) {
      let importPath = line.match(/"(.*)"/)[1];
      let absolutePath = path.resolve(dir, importPath);

      // Adjust import path for standard libraries like OpenZeppelin
      if (importPath.startsWith('@')) {
        absolutePath = path.resolve(`node_modules/${importPath}`);
      }

      // Fetch from GitHub if not found locally
      if (!fs.existsSync(absolutePath)) {
        const githubUrl = `https://raw.githubusercontent.com/OpenZeppelin/openzeppelin-contracts/master/${importPath.replace('@openzeppelin/', '')}`;
        try {
          const response = await axios.get(githubUrl);
          fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
          fs.writeFileSync(absolutePath, response.data);
        } catch (error) {
          console.error(`Error fetching import from GitHub: ${importPath}`, error);
          continue; // Skip this import if it can't be resolved
        }
      }

      try {
        let importContent = fs.readFileSync(absolutePath, 'utf8');
        result += await resolveImports(importContent, path.dirname(absolutePath));
      } catch (error) {
        console.error(`Error resolving import: ${importPath}`, error);
        continue; // Skip this import if it can't be resolved
      }
    } else {
      result += line + '\n';
    }
  }

  return result;
}

fetchContractSource();
