const { expect } = require("chai");
const { ethers, fhevm } = require("hardhat");

describe("SimpleVoting - Fixed FHE Operations", function () {
  let contract;
  let owner, voter1, voter2, voter3, voter4;

  beforeEach(async function () {
    // CRITICAL: Initialize FHEVM before any contract operations
    if (!fhevm.isMock) {
      throw new Error("This test must run in FHEVM mock environment");
    }

    await fhevm.initializeCLIApi();

    [owner, voter1, voter2, voter3, voter4] = await ethers.getSigners();
    
    const Factory = await ethers.getContractFactory("SimpleVoting");
    const deployed = await Factory.deploy();
    await deployed.waitForDeployment();
    contract = deployed;

    console.log(`✅ SimpleVoting deployed at: ${await contract.getAddress()}`);
  });

  it("tests complete FHE voting flow with proper initialization", async function () {
    console.log("Testing complete FHE voting flow...");

    // Step 1: Create session (this should work now with proper FHEVM init)
    const sessionDuration = 300; // 5 minutes
    console.log("Creating session...");
    const tx = await contract.connect(owner).createSession(sessionDuration);
    const receipt = await tx.wait();
    
    // Get session ID from event
    const sessionCreatedEvent = receipt.logs.find(log => {
      try {
        const decoded = contract.interface.parseLog(log);
        return decoded.name === 'SessionCreated';
      } catch {
        return false;
      }
    });
    
    const sessionId = sessionCreatedEvent ? sessionCreatedEvent.args.sessionId : 0n;
    console.log(`✅ Session created with ID: ${sessionId}`);

    // Step 2: Cast encrypted votes (following the working pattern)
    console.log("Testing encrypted vote casting...");
    
    const voters = [voter1, voter2, voter3, voter4];
    const voteChoices = [1, 0, 1, 0]; // YES, NO, YES, NO

    for (let i = 0; i < voters.length; i++) {
      const voter = voters[i];
      const voteChoice = voteChoices[i];
      
      // Create encrypted input (following working pattern)
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), voter.address)
        .add8(BigInt(voteChoice))
        .encrypt();
      
      // Cast vote
      await contract.connect(voter).vote(
        sessionId,
        encrypted.handles[0],
        encrypted.inputProof
      );
      
      console.log(`✅ Vote ${voteChoice} cast by ${voter.address.slice(0, 6)}...`);
    }

    // Step 3: Verify session state before reveal
    const sessionBefore = await contract.getSession(sessionId);
    expect(sessionBefore.creator).to.equal(owner.address);
    expect(sessionBefore.resolved).to.equal(false);
    expect(sessionBefore.yesVotes).to.equal(0); // Not revealed yet
    expect(sessionBefore.noVotes).to.equal(0);  // Not revealed yet

    // Step 4: Advance time and request reveal
    console.log("Testing tally reveal process...");
    
    await ethers.provider.send("evm_increaseTime", [sessionDuration + 1]);
    await ethers.provider.send("evm_mine", []);

    const revealTx = await contract.connect(owner).requestTallyReveal(sessionId);
    await revealTx.wait();

    // Wait for decryption oracle
    await fhevm.awaitDecryptionOracle();

    // Step 5: Verify decrypted results
    const sessionAfter = await contract.getSession(sessionId);
    expect(sessionAfter.resolved).to.equal(true);
    expect(sessionAfter.yesVotes).to.equal(2); // 2 YES votes
    expect(sessionAfter.noVotes).to.equal(2);  // 2 NO votes

    console.log("✅ Complete FHE voting flow works!");
    console.log("✅ FHE.fromExternal() - Vote decryption works");
    console.log("✅ FHE.eq() - Vote comparison works");
    console.log("✅ FHE.select() - Conditional addition works");
    console.log("✅ FHE.add() - Encrypted tally accumulation works");
    console.log("✅ FHE.allowThis() - Decryption permissions work");
    console.log("✅ FHE.toBytes32() - Conversion for decryption works");
    console.log("✅ FHE.requestDecryption() - Oracle request works");
    console.log("✅ FHE.checkSignatures() - Decryption verification works");
  });

  it("tests FHE error handling with proper initialization", async function () {
    console.log("Testing FHE error handling...");

    // Create session
    const sessionId = 0n;
    await contract.connect(owner).createSession(300);

    // Test 1: Invalid input proof should revert
    console.log("Testing invalid input proof...");
    const validEncrypted = await fhevm
      .createEncryptedInput(await contract.getAddress(), voter1.address)
      .add8(1n)
      .encrypt();

    const invalidProof = "0x" + "00".repeat(64); // Invalid proof

    await expect(
      contract.connect(voter1).vote(
        sessionId,
        validEncrypted.handles[0],
        invalidProof
      )
    ).to.be.reverted; // FHE.fromExternal should fail with invalid proof

    console.log("✅ FHE.fromExternal() correctly rejects invalid proofs");

    // Test 2: Valid proof should work
    await contract.connect(voter1).vote(
      sessionId,
      validEncrypted.handles[0],
      validEncrypted.inputProof
    );

    console.log("✅ FHE.fromExternal() accepts valid proofs");

    // Test 3: Double voting should revert
    await expect(
      contract.connect(voter1).vote(
        sessionId,
        validEncrypted.handles[0],
        validEncrypted.inputProof
      )
    ).to.be.revertedWith("Already voted");

    console.log("✅ Double voting prevention works");
  });

  it("tests FHE operations with edge cases", async function () {
    console.log("Testing FHE edge cases...");

    // Create session
    const sessionId = 0n;
    await contract.connect(owner).createSession(300);

    // Test 1: Zero vote
    console.log("Testing zero vote...");
    const zeroVote = await fhevm
      .createEncryptedInput(await contract.getAddress(), voter1.address)
      .add8(0n)
      .encrypt();

    await contract.connect(voter1).vote(
      sessionId,
      zeroVote.handles[0],
      zeroVote.inputProof
    );

    // Test 2: Maximum euint8 value (255)
    console.log("Testing maximum value...");
    const maxVote = await fhevm
      .createEncryptedInput(await contract.getAddress(), voter2.address)
      .add8(255n)
      .encrypt();

    await contract.connect(voter2).vote(
      sessionId,
      maxVote.handles[0],
      maxVote.inputProof
    );

    // Resolve and check
    await ethers.provider.send("evm_increaseTime", [301]);
    await ethers.provider.send("evm_mine", []);

    await contract.connect(owner).requestTallyReveal(sessionId);
    await fhevm.awaitDecryptionOracle();

    const session = await contract.getSession(sessionId);
    expect(session.resolved).to.equal(true);
    expect(session.yesVotes).to.equal(0); // Zero vote
    expect(session.noVotes).to.equal(1);  // Max value vote (treated as 1 for YES/NO)

    console.log("✅ FHE operations handle edge cases correctly");
  });

  it("tests complex FHE computation chains", async function () {
    console.log("Testing complex FHE computation chains...");

    // Create multiple sessions
    const sessionIds = [];
    for (let i = 0; i < 3; i++) {
      const tx = await contract.connect(owner).createSession(300);
      const receipt = await tx.wait();
      const sessionCreatedEvent = receipt.logs.find(log => {
        try {
          const decoded = contract.interface.parseLog(log);
          return decoded.name === 'SessionCreated';
        } catch {
          return false;
        }
      });
      sessionIds.push(sessionCreatedEvent ? sessionCreatedEvent.args.sessionId : BigInt(i));
    }

    console.log(`✅ Created ${sessionIds.length} sessions`);

    // Complex voting pattern across sessions
    const votingPattern = [
      { session: 0, voter: voter1, choice: 1 }, // YES
      { session: 0, voter: voter2, choice: 0 }, // NO
      { session: 1, voter: voter1, choice: 0 }, // NO
      { session: 1, voter: voter3, choice: 1 }, // YES
      { session: 2, voter: voter2, choice: 1 }, // YES
      { session: 2, voter: voter4, choice: 0 }, // NO
    ];

    // Cast all votes
    for (const { session, voter, choice } of votingPattern) {
      const encrypted = await fhevm
        .createEncryptedInput(await contract.getAddress(), voter.address)
        .add8(BigInt(choice))
        .encrypt();

      await contract.connect(voter).vote(
        sessionIds[session],
        encrypted.handles[0],
        encrypted.inputProof
      );
    }

    console.log("✅ Complex voting pattern completed");

    // Resolve all sessions
    await ethers.provider.send("evm_increaseTime", [301]);
    await ethers.provider.send("evm_mine", []);

    for (let i = 0; i < sessionIds.length; i++) {
      await contract.connect(owner).requestTallyReveal(sessionIds[i]);
    }

    await fhevm.awaitDecryptionOracle();

    // Verify results
    const results = [];
    for (let i = 0; i < sessionIds.length; i++) {
      const session = await contract.getSession(sessionIds[i]);
      results.push({ yes: session.yesVotes, no: session.noVotes });
    }

    // Expected results: All sessions should have YES=1, NO=1
    expect(results[0].yes).to.equal(1);
    expect(results[0].no).to.equal(1);
    expect(results[1].yes).to.equal(1);
    expect(results[1].no).to.equal(1);
    expect(results[2].yes).to.equal(1);
    expect(results[2].no).to.equal(1);

    console.log("✅ Complex FHE computation chains work correctly");
  });
});
