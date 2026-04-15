async function main() {
  const address = process.env.IDS_LOGGER_ADDRESS;

  if (!address) {
    throw new Error("IDS_LOGGER_ADDRESS is required.");
  }

  const IDSLogger = await ethers.getContractFactory("IDSLogger");
  const idsLogger = IDSLogger.attach(address);
  const logs = await idsLogger.getAllLogs();

  console.log(
    logs.map((entry, index) => ({
      index,
      dataHash: entry.dataHash,
      timestamp: entry.timestamp.toString()
    }))
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
