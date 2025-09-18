// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, externalEuint8, euint8, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract SimpleVoting is SepoliaConfig {
    struct Session {
        address creator;
        uint256 endTime;
        euint8 yesVotes;
        euint8 noVotes;
        bool resolved;
        uint8 revealedYes;
        uint8 revealedNo;
        uint256 decryptionRequestId;
    }

    Session[] public sessions;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(uint256 => uint256) internal sessionIdByRequestId;

    event SessionCreated(uint256 indexed sessionId, address indexed creator, uint256 endTime);
    event VoteCast(uint256 indexed sessionId, address indexed voter);
    event TallyRevealRequested(uint256 indexed sessionId, uint256 requestId);
    event SessionResolved(uint256 indexed sessionId, uint8 yesVotes, uint8 noVotes);

    function createSession(uint256 durationSeconds) external {
        require(durationSeconds > 0, "Duration must be positive");
        Session memory s = Session({
            creator: msg.sender,
            endTime: block.timestamp + durationSeconds,
            yesVotes: FHE.asEuint8(0),
            noVotes: FHE.asEuint8(0),
            resolved: false,
            revealedYes: 0,
            revealedNo: 0,
            decryptionRequestId: 0
        });
        sessions.push(s);
        emit SessionCreated(sessions.length - 1, msg.sender, s.endTime);
    }

    // Pure YES/NO voting - encrypt the choice (0 or 1) directly
    function vote(
        uint256 sessionId,
        externalEuint8 encryptedVote,
        bytes calldata proof
    ) external {
        require(sessionId < sessions.length, "Invalid session");
        Session storage s = sessions[sessionId];
        require(block.timestamp < s.endTime, "Voting ended");
        require(!hasVoted[sessionId][msg.sender], "Already voted");

        euint8 v = FHE.fromExternal(encryptedVote, proof);
        euint8 yes = FHE.asEuint8(1);  // Yes = 1
        euint8 no = FHE.asEuint8(0);   // No = 0
        euint8 one = FHE.asEuint8(1);

        s.yesVotes = FHE.add(s.yesVotes, FHE.select(FHE.eq(v, yes), one, FHE.asEuint8(0)));
        s.noVotes = FHE.add(s.noVotes, FHE.select(FHE.eq(v, no), one, FHE.asEuint8(0)));

        FHE.allowThis(s.yesVotes);
        FHE.allowThis(s.noVotes);

        hasVoted[sessionId][msg.sender] = true;
        emit VoteCast(sessionId, msg.sender);
    }

    function requestTallyReveal(uint256 sessionId) external {
        require(sessionId < sessions.length, "Invalid session");
        Session storage s = sessions[sessionId];
        require(block.timestamp >= s.endTime, "Voting not ended");
        require(!s.resolved, "Already resolved");
        require(msg.sender == s.creator, "Only creator can request reveal");

        bytes32[] memory cts = new bytes32[](2);
        cts[0] = FHE.toBytes32(s.yesVotes);
        cts[1] = FHE.toBytes32(s.noVotes);

        uint256 requestId = FHE.requestDecryption(cts, this.resolveTallyCallback.selector);
        s.decryptionRequestId = requestId;
        sessionIdByRequestId[requestId] = sessionId;
        emit TallyRevealRequested(sessionId, requestId);
    }

    function resolveTallyCallback(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);

        (uint8 revealedYes, uint8 revealedNo) = abi.decode(cleartexts, (uint8, uint8));

        uint256 sessionId = sessionIdByRequestId[requestId];
        Session storage s = sessions[sessionId];
        s.revealedYes = revealedYes;
        s.revealedNo = revealedNo;
        s.resolved = true;
        emit SessionResolved(sessionId, revealedYes, revealedNo);
    }

    function getSessionCount() external view returns (uint256) {
        return sessions.length;
    }

    function getSession(uint256 sessionId) external view returns (
        address creator,
        uint256 endTime,
        bool resolved,
        uint8 yesVotes,
        uint8 noVotes
    ) {
        require(sessionId < sessions.length, "Invalid session");
        Session storage s = sessions[sessionId];
        return (
            s.creator,
            s.endTime,
            s.resolved,
            s.resolved ? s.revealedYes : 0,
            s.resolved ? s.revealedNo : 0
        );
    }
}
