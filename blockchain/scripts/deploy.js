const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();
  const IDSLogger = await ethers.getContractFactory("IDSLogger");
  const idsLogger = await IDSLogger.deploy();

  await idsLogger.waitForDeployment();

  const address = await idsLogger.getAddress();
  const network = await ethers.provider.getNetwork();
  const deployment = {
    contractName: "IDSLogger",
    address,
    network: {
      name: network.name,
      chainId: network.chainId.toString()
    },
    deployer: deployer.address,
    deployedAt: new Date().toISOString()
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(deploymentsDir, { recursive: true });
  fs.writeFileSync(
    path.join(deploymentsDir, `${network.name || "localhost"}.json`),
    JSON.stringify(deployment, null, 2)
  );

  console.log("IDSLogger deployed");
  console.log(`Address: ${address}`);
  console.log("Add this to backend/.env:");
  console.log(`IDS_LOGGER_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
