import { describe, it, expect, beforeEach } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";

// Test accounts from simnet
const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!; // Campaign creator
const wallet2 = accounts.get("wallet_2")!; // Backer 1
const wallet3 = accounts.get("wallet_3")!; // Backer 2
const wallet4 = accounts.get("wallet_4")!; // Platform treasury

// Contract name
const contractName = "bitspark";

// Helper to advance chain tip
function advanceBlocks(blocks: number) {
  simnet.mineEmptyBlocks(blocks);
}

// Helper to get campaign
function getCampaign(campaignId: number) {
  return simnet.callReadOnlyFn(
    contractName,
    "get-campaign",
    [Cl.uint(campaignId)],
    deployer
  );
}

describe("BitSpark Crowdfunding Contract", () => {
  // ==========================================================================
  // CAMPAIGN CREATION TESTS
  // ==========================================================================
  
  describe("Campaign Creation", () => {
    it("should create a campaign with valid parameters", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "create-campaign",
        [
          Cl.stringUtf8("Test Campaign"),
          Cl.stringUtf8("A test campaign description"),
          Cl.uint(100000), // 100k sats goal
          Cl.uint(144),    // ~1 day in blocks
        ],
        wallet1
      );
      
      expect(result.type).toBe(ClarityType.ResponseOk);
    });
    
    it("should accept campaign with empty title (no title validation)", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "create-campaign",
        [
          Cl.stringUtf8(""),
          Cl.stringUtf8("Description"),
          Cl.uint(100000),
          Cl.uint(144),
        ],
        wallet1
      );
      
      // Contract allows empty titles - validation is UI concern
      expect(result.type).toBe(ClarityType.ResponseOk);
    });
    
    it("should reject campaign with zero goal", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "create-campaign",
        [
          Cl.stringUtf8("Title"),
          Cl.stringUtf8("Description"),
          Cl.uint(0),
          Cl.uint(144),
        ],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(108)); // ERR_INVALID_AMOUNT
    });
    
    it("should reject campaign with zero duration", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "create-campaign",
        [
          Cl.stringUtf8("Title"),
          Cl.stringUtf8("Description"),
          Cl.uint(100000),
          Cl.uint(0),
        ],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(108)); // ERR_INVALID_AMOUNT (zero duration)
    });
    
    it("should increment campaign counter", () => {
      // Create first campaign
      simnet.callPublicFn(
        contractName,
        "create-campaign",
        [
          Cl.stringUtf8("Campaign 1"),
          Cl.stringUtf8("First campaign"),
          Cl.uint(100000),
          Cl.uint(144),
        ],
        wallet1
      );
      
      // Create second campaign
      const { result } = simnet.callPublicFn(
        contractName,
        "create-campaign",
        [
          Cl.stringUtf8("Campaign 2"),
          Cl.stringUtf8("Second campaign"),
          Cl.uint(200000),
          Cl.uint(288),
        ],
        wallet2
      );
      
      expect(result.type).toBe(ClarityType.ResponseOk);
      // Second campaign should have ID 1 (response includes end-block)
      if (result.type === ClarityType.ResponseOk && result.value.type === ClarityType.Tuple) {
        expect(result.value.value["campaign-id"]).toBeUint(1);
      }
    });
  });

  // ==========================================================================
  // READ-ONLY FUNCTIONS TESTS
  // ==========================================================================
  
  describe("Read-Only Functions", () => {
    beforeEach(() => {
      // Create a test campaign
      simnet.callPublicFn(
        contractName,
        "create-campaign",
        [
          Cl.stringUtf8("Read Test Campaign"),
          Cl.stringUtf8("Testing read functions"),
          Cl.uint(100000),
          Cl.uint(100),
        ],
        wallet1
      );
    });
    
    it("should return campaign details", () => {
      const { result } = getCampaign(0);
      
      expect(result.type).toBe(ClarityType.OptionalSome);
      if (result.type === ClarityType.OptionalSome) {
        const campaign = result.value;
        expect(campaign.type).toBe(ClarityType.Tuple);
      }
    });
    
    it("should return none for non-existent campaign", () => {
      const { result } = getCampaign(999);
      
      expect(result.type).toBe(ClarityType.OptionalNone);
    });
    
    it("should correctly report active campaign", () => {
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "is-campaign-active",
        [Cl.uint(0)],
        deployer
      );
      
      expect(result).toBeBool(true);
    });
    
    it("should report campaign as inactive after deadline", () => {
      advanceBlocks(101);
      
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "is-campaign-active",
        [Cl.uint(0)],
        deployer
      );
      
      expect(result).toBeBool(false);
    });
    
    it("should return zero contribution for non-backer", () => {
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-contribution",
        [Cl.uint(0), Cl.principal(wallet3)],
        deployer
      );
      
      expect(result).toBeUint(0);
    });
    
    it("should return platform stats", () => {
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-platform-stats",
        [],
        deployer
      );
      
      expect(result).toBeTuple({
        "total-campaigns": Cl.uint(1),
        "successful-campaigns": Cl.uint(0),
        "total-raised": Cl.uint(0),
      });
    });
    
    it("should return backer stats", () => {
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-backer-stats",
        [Cl.principal(wallet2)],
        deployer
      );
      
      expect(result).toBeTuple({
        "campaigns-backed": Cl.uint(0),
        "total-contributed": Cl.uint(0),
      });
    });
  });

  // ==========================================================================
  // CAMPAIGN UPDATE TESTS
  // ==========================================================================
  
  describe("Campaign Updates", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        contractName,
        "create-campaign",
        [
          Cl.stringUtf8("Update Test"),
          Cl.stringUtf8("Original description"),
          Cl.uint(100000),
          Cl.uint(100),
        ],
        wallet1
      );
    });
    
    it("should allow owner to update description", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "update-description",
        [Cl.uint(0), Cl.stringUtf8("Updated description")],
        wallet1
      );
      
      expect(result.type).toBe(ClarityType.ResponseOk);
    });
    
    it("should reject description update from non-owner", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "update-description",
        [Cl.uint(0), Cl.stringUtf8("Hacker description")],
        wallet2
      );
      
      expect(result).toBeErr(Cl.uint(101)); // ERR_NOT_CAMPAIGN_OWNER
    });
    
    it("should allow owner to extend deadline", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "extend-deadline",
        [Cl.uint(0), Cl.uint(50)],
        wallet1
      );
      
      expect(result.type).toBe(ClarityType.ResponseOk);
    });
    
    it("should reject deadline extension from non-owner", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "extend-deadline",
        [Cl.uint(0), Cl.uint(50)],
        wallet2
      );
      
      expect(result).toBeErr(Cl.uint(101)); // ERR_NOT_CAMPAIGN_OWNER
    });
    
    it("should reject zero block extension", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "extend-deadline",
        [Cl.uint(0), Cl.uint(0)],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(108)); // ERR_INVALID_AMOUNT (zero duration)
    });
  });

  // ==========================================================================
  // CAMPAIGN FINALIZATION TESTS
  // ==========================================================================
  
  describe("Campaign Finalization", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        contractName,
        "create-campaign",
        [
          Cl.stringUtf8("Finalization Test"),
          Cl.stringUtf8("Testing finalization"),
          Cl.uint(100000),
          Cl.uint(50),
        ],
        wallet1
      );
    });
    
    it("should reject finalization before deadline", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "finalize-successful-campaign",
        [Cl.uint(0)],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(104)); // ERR_CAMPAIGN_ACTIVE
    });
    
    it("should reject finalization if goal not reached", () => {
      advanceBlocks(51);
      
      const { result } = simnet.callPublicFn(
        contractName,
        "finalize-successful-campaign",
        [Cl.uint(0)],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(105)); // ERR_GOAL_NOT_REACHED
    });
    
    it("should reject finalization by non-owner", () => {
      advanceBlocks(51);
      
      const { result } = simnet.callPublicFn(
        contractName,
        "finalize-successful-campaign",
        [Cl.uint(0)],
        wallet2
      );
      
      expect(result).toBeErr(Cl.uint(101)); // ERR_NOT_CAMPAIGN_OWNER
    });
  });

  // ==========================================================================
  // REFUND SYSTEM TESTS
  // ==========================================================================
  
  describe("Refund System", () => {
    beforeEach(() => {
      simnet.callPublicFn(
        contractName,
        "create-campaign",
        [
          Cl.stringUtf8("Refund Test"),
          Cl.stringUtf8("Testing refunds"),
          Cl.uint(1000000), // High goal - won't be reached
          Cl.uint(20),
        ],
        wallet1
      );
    });
    
    it("should reject enabling refunds before deadline", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "enable-refunds",
        [Cl.uint(0)],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(104)); // ERR_CAMPAIGN_ACTIVE
    });
    
    it("should allow enabling refunds after failed campaign", () => {
      advanceBlocks(21);
      
      const { result } = simnet.callPublicFn(
        contractName,
        "enable-refunds",
        [Cl.uint(0)],
        wallet1
      );
      
      expect(result.type).toBe(ClarityType.ResponseOk);
    });
    
    it("should reject enabling refunds by non-owner", () => {
      advanceBlocks(21);
      
      const { result } = simnet.callPublicFn(
        contractName,
        "enable-refunds",
        [Cl.uint(0)],
        wallet2
      );
      
      expect(result).toBeErr(Cl.uint(101)); // ERR_NOT_CAMPAIGN_OWNER
    });
  });

  // ==========================================================================
  // sBTC CONTRIBUTION TESTS (Core Crowdfunding Flow)
  // ==========================================================================
  
  describe("sBTC Contributions", () => {
    const mockSbtcContract = "mock-sbtc";
    
    beforeEach(() => {
      // Create a campaign
      simnet.callPublicFn(
        contractName,
        "create-campaign",
        [
          Cl.stringUtf8("sBTC Test Campaign"),
          Cl.stringUtf8("Testing contributions with sBTC"),
          Cl.uint(50000), // 50k sats goal
          Cl.uint(100),   // 100 blocks duration
        ],
        wallet1
      );
      
      // Mint mock sBTC to backers for testing
      simnet.callPublicFn(
        mockSbtcContract,
        "mint",
        [Cl.uint(100000), Cl.principal(wallet2)], // 100k sats to backer 1
        deployer
      );
      simnet.callPublicFn(
        mockSbtcContract,
        "mint",
        [Cl.uint(100000), Cl.principal(wallet3)], // 100k sats to backer 2
        deployer
      );
    });
    
    it("should allow contribution with sBTC", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "contribute",
        [
          Cl.uint(0),      // campaign-id
          Cl.uint(10000),  // 10k sats
          Cl.contractPrincipal(deployer.split(".")[0], "mock-sbtc"),
        ],
        wallet2
      );
      
      expect(result.type).toBe(ClarityType.ResponseOk);
    });
    
    it("should update campaign raised amount after contribution", () => {
      simnet.callPublicFn(
        contractName,
        "contribute",
        [
          Cl.uint(0),
          Cl.uint(25000), // 25k sats
          Cl.contractPrincipal(deployer.split(".")[0], "mock-sbtc"),
        ],
        wallet2
      );
      
      const campaign = getCampaign(0);
      const raised = campaign.result.value.value.raised.value;
      expect(raised).toBe(25000n);
    });
    
    it("should track contributor count correctly", () => {
      // First backer
      simnet.callPublicFn(
        contractName,
        "contribute",
        [Cl.uint(0), Cl.uint(10000), Cl.contractPrincipal(deployer.split(".")[0], "mock-sbtc")],
        wallet2
      );
      
      // Second backer
      simnet.callPublicFn(
        contractName,
        "contribute",
        [Cl.uint(0), Cl.uint(10000), Cl.contractPrincipal(deployer.split(".")[0], "mock-sbtc")],
        wallet3
      );
      
      const campaign = getCampaign(0);
      const contributorsCount = campaign.result.value.value["contributors-count"].value;
      expect(contributorsCount).toBe(2n);
    });
    
    it("should track individual contribution amounts", () => {
      simnet.callPublicFn(
        contractName,
        "contribute",
        [Cl.uint(0), Cl.uint(15000), Cl.contractPrincipal(deployer.split(".")[0], "mock-sbtc")],
        wallet2
      );
      
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-contribution",
        [Cl.uint(0), Cl.principal(wallet2)],
        deployer
      );
      
      expect(result).toBeUint(15000);
    });
    
    it("should update backer stats after contribution", () => {
      simnet.callPublicFn(
        contractName,
        "contribute",
        [Cl.uint(0), Cl.uint(20000), Cl.contractPrincipal(deployer.split(".")[0], "mock-sbtc")],
        wallet2
      );
      
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-backer-stats",
        [Cl.principal(wallet2)],
        deployer
      );
      
      expect(result.value["campaigns-backed"].value).toBe(1n);
      expect(result.value["total-contributed"].value).toBe(20000n);
    });
    
    it("should reject zero contribution amount", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "contribute",
        [Cl.uint(0), Cl.uint(0), Cl.contractPrincipal(deployer.split(".")[0], "mock-sbtc")],
        wallet2
      );
      
      expect(result).toBeErr(Cl.uint(108)); // ERR_INVALID_AMOUNT
    });
    
    it("should reject contribution to ended campaign", () => {
      advanceBlocks(101); // Past deadline
      
      const { result } = simnet.callPublicFn(
        contractName,
        "contribute",
        [Cl.uint(0), Cl.uint(10000), Cl.contractPrincipal(deployer.split(".")[0], "mock-sbtc")],
        wallet2
      );
      
      expect(result).toBeErr(Cl.uint(103)); // ERR_CAMPAIGN_ENDED
    });
    
    it("should reject contribution to non-existent campaign", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "contribute",
        [Cl.uint(999), Cl.uint(10000), Cl.contractPrincipal(deployer.split(".")[0], "mock-sbtc")],
        wallet2
      );
      
      expect(result).toBeErr(Cl.uint(102)); // ERR_CAMPAIGN_NOT_FOUND
    });
    
    it("should allow multiple contributions from same backer", () => {
      // First contribution
      simnet.callPublicFn(
        contractName,
        "contribute",
        [Cl.uint(0), Cl.uint(10000), Cl.contractPrincipal(deployer.split(".")[0], "mock-sbtc")],
        wallet2
      );
      
      // Second contribution
      simnet.callPublicFn(
        contractName,
        "contribute",
        [Cl.uint(0), Cl.uint(15000), Cl.contractPrincipal(deployer.split(".")[0], "mock-sbtc")],
        wallet2
      );
      
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-contribution",
        [Cl.uint(0), Cl.principal(wallet2)],
        deployer
      );
      
      expect(result).toBeUint(25000); // 10k + 15k
    });
  });

  // ==========================================================================
  // SUCCESSFUL CAMPAIGN FINALIZATION TESTS
  // ==========================================================================
  
  describe("Successful Campaign Finalization", () => {
    const sbtcContract = "mock-sbtc";
    const sbtcDeployer = "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4";
    
    beforeEach(() => {
      // Create campaign with achievable goal
      simnet.callPublicFn(
        contractName,
        "create-campaign",
        [
          Cl.stringUtf8("Successful Campaign"),
          Cl.stringUtf8("This will reach its goal"),
          Cl.uint(30000), // 30k sats goal
          Cl.uint(50),
        ],
        wallet1
      );
      
      // Mint sBTC to backer
      simnet.callPublicFn(sbtcContract, "mint", [Cl.uint(50000), Cl.principal(wallet2)], sbtcDeployer);
      
      // Contribute enough to reach goal
      simnet.callPublicFn(
        contractName,
        "contribute",
        [Cl.uint(0), Cl.uint(35000), Cl.contractPrincipal(deployer.split(".")[0], "mock-sbtc")],
        wallet2
      );
    });
    
    it("should allow finalization after goal reached and deadline passed", () => {
      advanceBlocks(51); // Past deadline
      
      const { result } = simnet.callPublicFn(
        contractName,
        "finalize-successful-campaign",
        [Cl.uint(0)],
        wallet1
      );
      
      expect(result.type).toBe(ClarityType.ResponseOk);
    });
    
    it("should mark campaign as claimed after finalization", () => {
      advanceBlocks(51);
      
      simnet.callPublicFn(
        contractName,
        "finalize-successful-campaign",
        [Cl.uint(0)],
        wallet1
      );
      
      const campaign = getCampaign(0);
      // Clarity booleans: BoolTrue type (7) or BoolFalse type (8)
      expect(campaign.result.value.value.claimed.type).toBe(ClarityType.BoolTrue);
    });
    
    it("should update platform stats after successful campaign", () => {
      advanceBlocks(51);
      
      simnet.callPublicFn(
        contractName,
        "finalize-successful-campaign",
        [Cl.uint(0)],
        wallet1
      );
      
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-platform-stats",
        [],
        deployer
      );
      
      expect(result.value["successful-campaigns"].value).toBe(1n);
      expect(result.value["total-raised"].value).toBe(35000n);
    });
    
    it("should update creator stats after finalization", () => {
      advanceBlocks(51);
      
      simnet.callPublicFn(
        contractName,
        "finalize-successful-campaign",
        [Cl.uint(0)],
        wallet1
      );
      
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-creator-stats",
        [Cl.principal(wallet1)],
        deployer
      );
      
      expect(result.value["campaigns-successful"].value).toBe(1n);
      expect(result.value["total-raised"].value).toBe(35000n);
    });
    
    it("should reject double finalization", () => {
      advanceBlocks(51);
      
      // First finalization
      simnet.callPublicFn(
        contractName,
        "finalize-successful-campaign",
        [Cl.uint(0)],
        wallet1
      );
      
      // Try to finalize again
      const { result } = simnet.callPublicFn(
        contractName,
        "finalize-successful-campaign",
        [Cl.uint(0)],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(106)); // ERR_ALREADY_CLAIMED
    });
  });

  // ==========================================================================
  // REFUND PROCESSING TESTS
  // ==========================================================================
  
  describe("Refund Processing", () => {
    const sbtcContract = "mock-sbtc";
    const sbtcDeployer = "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4";
    
    beforeEach(() => {
      // Create campaign with high goal (won't be reached)
      simnet.callPublicFn(
        contractName,
        "create-campaign",
        [
          Cl.stringUtf8("Failed Campaign"),
          Cl.stringUtf8("This won't reach its goal"),
          Cl.uint(1000000), // 1M sats goal - unreachable
          Cl.uint(30),
        ],
        wallet1
      );
      
      // Mint sBTC to backers and campaign owner (for refunds)
      simnet.callPublicFn(sbtcContract, "mint", [Cl.uint(50000), Cl.principal(wallet2)], sbtcDeployer);
      simnet.callPublicFn(sbtcContract, "mint", [Cl.uint(50000), Cl.principal(wallet3)], sbtcDeployer);
      simnet.callPublicFn(sbtcContract, "mint", [Cl.uint(100000), Cl.principal(wallet1)], sbtcDeployer); // Owner needs funds for refunds
      
      // Small contributions - won't reach goal
      simnet.callPublicFn(
        contractName,
        "contribute",
        [Cl.uint(0), Cl.uint(20000), Cl.contractPrincipal(deployer.split(".")[0], "mock-sbtc")],
        wallet2
      );
      simnet.callPublicFn(
        contractName,
        "contribute",
        [Cl.uint(0), Cl.uint(15000), Cl.contractPrincipal(deployer.split(".")[0], "mock-sbtc")],
        wallet3
      );
    });
    
    it("should process refund for contributor", () => {
      advanceBlocks(31); // Past deadline
      
      // Enable refunds
      simnet.callPublicFn(contractName, "enable-refunds", [Cl.uint(0)], wallet1);
      
      // Process refund
      const { result } = simnet.callPublicFn(
        contractName,
        "process-refund",
        [
          Cl.uint(0),
          Cl.principal(wallet2),
          Cl.contractPrincipal(deployer.split(".")[0], "mock-sbtc"),
        ],
        wallet1
      );
      
      expect(result.type).toBe(ClarityType.ResponseOk);
    });
    
    it("should clear contribution record after refund", () => {
      advanceBlocks(31);
      simnet.callPublicFn(contractName, "enable-refunds", [Cl.uint(0)], wallet1);
      
      simnet.callPublicFn(
        contractName,
        "process-refund",
        [Cl.uint(0), Cl.principal(wallet2), Cl.contractPrincipal(deployer.split(".")[0], "mock-sbtc")],
        wallet1
      );
      
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-contribution",
        [Cl.uint(0), Cl.principal(wallet2)],
        deployer
      );
      
      expect(result).toBeUint(0);
    });
    
    it("should update campaign raised amount after refund", () => {
      advanceBlocks(31);
      simnet.callPublicFn(contractName, "enable-refunds", [Cl.uint(0)], wallet1);
      
      simnet.callPublicFn(
        contractName,
        "process-refund",
        [Cl.uint(0), Cl.principal(wallet2), Cl.contractPrincipal(deployer.split(".")[0], "mock-sbtc")],
        wallet1
      );
      
      const campaign = getCampaign(0);
      const raised = campaign.result.value.value.raised.value;
      expect(raised).toBe(15000n); // Only wallet3's contribution remains
    });
    
    it("should reject refund without enabling first", () => {
      advanceBlocks(31);
      
      const { result } = simnet.callPublicFn(
        contractName,
        "process-refund",
        [Cl.uint(0), Cl.principal(wallet2), Cl.contractPrincipal(deployer.split(".")[0], "mock-sbtc")],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(111)); // ERR_REFUNDS_NOT_ENABLED
    });
    
    it("should reject refund for non-contributor", () => {
      advanceBlocks(31);
      simnet.callPublicFn(contractName, "enable-refunds", [Cl.uint(0)], wallet1);
      
      const { result } = simnet.callPublicFn(
        contractName,
        "process-refund",
        [Cl.uint(0), Cl.principal(wallet4), Cl.contractPrincipal(deployer.split(".")[0], "mock-sbtc")],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(107)); // ERR_NO_CONTRIBUTION
    });
    
    it("should reject refund by non-campaign-owner", () => {
      advanceBlocks(31);
      simnet.callPublicFn(contractName, "enable-refunds", [Cl.uint(0)], wallet1);
      
      const { result } = simnet.callPublicFn(
        contractName,
        "process-refund",
        [Cl.uint(0), Cl.principal(wallet2), Cl.contractPrincipal(deployer.split(".")[0], "mock-sbtc")],
        wallet2 // Backer trying to process their own refund (should be owner)
      );
      
      expect(result).toBeErr(Cl.uint(101)); // ERR_NOT_CAMPAIGN_OWNER
    });
    
    it("should reject enabling refunds if goal was reached", () => {
      // Create new campaign with small goal
      simnet.callPublicFn(
        contractName,
        "create-campaign",
        [Cl.stringUtf8("Small Goal"), Cl.stringUtf8("Easy to reach"), Cl.uint(1000), Cl.uint(30)],
        wallet1
      );
      
      // Meet the goal
      simnet.callPublicFn(
        contractName,
        "contribute",
        [Cl.uint(1), Cl.uint(2000), Cl.contractPrincipal(deployer.split(".")[0], "mock-sbtc")],
        wallet2
      );
      
      advanceBlocks(31);
      
      const { result } = simnet.callPublicFn(
        contractName,
        "enable-refunds",
        [Cl.uint(1)],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(112)); // ERR_GOAL_REACHED
    });
    
    it("should reject double refund for same contributor", () => {
      advanceBlocks(31);
      simnet.callPublicFn(contractName, "enable-refunds", [Cl.uint(0)], wallet1);
      
      // First refund
      simnet.callPublicFn(
        contractName,
        "process-refund",
        [Cl.uint(0), Cl.principal(wallet2), Cl.contractPrincipal(deployer.split(".")[0], "mock-sbtc")],
        wallet1
      );
      
      // Try second refund
      const { result } = simnet.callPublicFn(
        contractName,
        "process-refund",
        [Cl.uint(0), Cl.principal(wallet2), Cl.contractPrincipal(deployer.split(".")[0], "mock-sbtc")],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(107)); // ERR_NO_CONTRIBUTION (already cleared)
    });
  });

  // ==========================================================================
  // ADMIN FUNCTIONS TESTS
  // ==========================================================================
  
  describe("Admin Functions", () => {
    it("should allow contract owner to set fee treasury", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "set-fee-treasury",
        [Cl.principal(wallet4)],
        deployer
      );
      
      expect(result.type).toBe(ClarityType.ResponseOk);
    });
    
    it("should reject fee treasury update from non-owner", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "set-fee-treasury",
        [Cl.principal(wallet4)],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(100)); // ERR_OWNER_ONLY (contract admin)
    });
  });

  // ==========================================================================
  // EDGE CASES AND BOUNDARY TESTS
  // ==========================================================================
  
  describe("Edge Cases", () => {
    it("should handle operations on non-existent campaign", () => {
      const { result } = simnet.callPublicFn(
        contractName,
        "update-description",
        [Cl.uint(999), Cl.stringUtf8("Test")],
        wallet1
      );
      
      expect(result).toBeErr(Cl.uint(102)); // ERR_CAMPAIGN_NOT_FOUND
    });
    
    it("should return zero time remaining for non-existent campaign", () => {
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-time-remaining",
        [Cl.uint(999)],
        deployer
      );
      
      expect(result).toBeUint(0);
    });
    
    it("should return zero time remaining for ended campaign", () => {
      // Create short campaign
      simnet.callPublicFn(
        contractName,
        "create-campaign",
        [
          Cl.stringUtf8("Short Campaign"),
          Cl.stringUtf8("Ends quickly"),
          Cl.uint(100000),
          Cl.uint(5),
        ],
        wallet1
      );
      
      // Advance past end
      advanceBlocks(10);
      
      const { result } = simnet.callReadOnlyFn(
        contractName,
        "get-time-remaining",
        [Cl.uint(0)],
        deployer
      );
      
      expect(result).toBeUint(0);
    });
  });
});
