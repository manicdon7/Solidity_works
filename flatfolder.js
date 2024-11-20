const axios = require('axios');
const fs = require('fs');
const path = require('path');

const apiKey = 'API_KEY'; 
const contractAddress = 'CONTRACT_ADDRESS'; // Contract Address
const outputDir = `contracts_${contractAddress}`; // Output directory

// Fetch source code and dependencies from Etherscan
async function fetchContractSource() {
  const url = `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${contractAddress}&apikey=${apiKey}`;

  try {
    const response = await axios.get(url);
    const contractData = response.data.result[0];

    if (!contractData.SourceCode || contractData.SourceCode === "") {
      console.error("No verified source code found for this address.");
      return;
    }

    const source = JSON.parse(contractData.SourceCode.slice(1, -1)); // Parse the SourceCode JSON
    const sources = source.sources;

    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write each source file
    for (const filePath in sources) {
      const fileContent = sources[filePath].content;
      const outputFilePath = path.join(outputDir, filePath);

      // Ensure the directory exists
      fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });

      // Write the source file
      fs.writeFileSync(outputFilePath, fileContent, 'utf8');
      console.log(`Saved: ${outputFilePath}`);
    }

    console.log("Contracts and imports saved successfully!");
  } catch (error) {
    console.error("Error fetching contract source code:", error);
  }
}

// Execute the script
fetchContractSource();
