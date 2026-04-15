// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract IDSLogger {
    struct Log {
        string dataHash;
        uint256 timestamp;
    }

    Log[] private logs;

    event LogAdded(uint256 indexed index, string dataHash, uint256 timestamp);

    function addLog(string memory _hash) public {
        require(bytes(_hash).length > 0, "Hash is required");

        logs.push(Log({
            dataHash: _hash,
            timestamp: block.timestamp
        }));

        emit LogAdded(logs.length - 1, _hash, block.timestamp);
    }

    function getLog(uint256 index) public view returns (string memory dataHash, uint256 timestamp) {
        require(index < logs.length, "Log index out of bounds");

        Log memory entry = logs[index];
        return (entry.dataHash, entry.timestamp);
    }

    function getAllLogs() public view returns (Log[] memory) {
        return logs;
    }
}
