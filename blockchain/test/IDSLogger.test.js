const { expect } = require("chai");

describe("IDSLogger", function () {
  it("stores and returns IDS log hashes", async function () {
    const IDSLogger = await ethers.getContractFactory("IDSLogger");
    const idsLogger = await IDSLogger.deploy();
    await idsLogger.waitForDeployment();

    await idsLogger.addLog("abc123");
    await idsLogger.addLog("def456");

    const firstLog = await idsLogger.getLog(0);
    const allLogs = await idsLogger.getAllLogs();

    expect(firstLog.dataHash).to.equal("abc123");
    expect(allLogs).to.have.lengthOf(2);
    expect(allLogs[1].dataHash).to.equal("def456");
  });
});
