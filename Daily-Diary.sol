// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DailyDiary {
    struct Entry {
        string content;
        uint timestamp;
    }

    mapping (uint => Entry) entries;
    uint entryCount;

    function addEntry(string memory _content) public {
        Entry memory newEntry = Entry({
            content: _content,
            timestamp: block.timestamp
        });
        entries[entryCount] = newEntry;
        entryCount++;
    }

    function getEntry(uint _index) public view returns (string memory, uint) {
        Entry memory entry = entries[_index];
        return (entry.content, entry.timestamp);
    }
}
