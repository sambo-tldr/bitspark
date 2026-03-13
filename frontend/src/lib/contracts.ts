import {
  fetchCallReadOnlyFunction,
  Cl,
  Pc,
  cvToValue,
  type ClarityValue,
} from "@stacks/transactions";
import { request } from "@stacks/connect";
import type { TransactionResult } from "@stacks/connect/dist/types/methods";

// =============================================================================
// Contract Configuration
// =============================================================================

const NETWORK = "testnet";
const API_BASE =
  import.meta.env.DEV ? "/api/hiro" : "https://api.testnet.hiro.so";

export const CONTRACT = {
  address: "STPP4Y3421BSP7R7TSJNZ7NGG5GX63HXQERB2WDP",
  name: "bitspark",
  principal: "STPP4Y3421BSP7R7TSJNZ7NGG5GX63HXQERB2WDP.bitspark",
} as const;

export const SBTC = {
  address: "ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT",
  name: "sbtc-token",
  principal: "ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token",
  assetName: "sbtc-token",
} as const;

// Platform fee: 2% (200 basis points)
export const PLATFORM_FEE_BPS = 200;
export const FEE_DENOMINATOR = 10000;

// 1 BTC = 100,000,000 sats
export const SATS_PER_BTC = 100_000_000;

// Error code mapping
export const ERROR_MESSAGES: Record<number, string> = {
  100: "Only the contract owner can perform this action",
  101: "Only the campaign owner can perform this action",
  102: "Campaign not found",
  103: "Campaign has ended",
  104: "Campaign is still active",
  105: "Funding goal not reached",
  106: "Funds already claimed",
  107: "No contribution found",
  108: "Invalid amount",
  109: "Campaign failed",
  110: "Transfer failed — do you have enough sBTC?",
  111: "Refunds not yet enabled for this campaign",
  112: "Goal already reached — refunds not available",
};

// =============================================================================
// Helpers
// =============================================================================

export function satsToBtc(sats: number | bigint | undefined | null): number {
  const n = Number(sats);
  return Number.isFinite(n) ? n / SATS_PER_BTC : 0;
}

/**
 * Recursively unwrap cvToValue / cvToJSON wrappers.
 * cvToValue wraps nested Clarity values in { type: string, value: ... } objects.
 * This peels those wrappers off so we get raw JS values (bigint, string, bool).
 */
function unwrapCV(v: unknown): unknown {
  if (v == null || typeof v !== "object") return v;
  const obj = v as Record<string, unknown>;
  // cvToJSON wrapper: { type: string, value: ... } (and optionally success)
  if ("type" in obj && "value" in obj && typeof obj.type === "string") {
    return unwrapCV(obj.value);
  }
  // Plain object (tuple data) — recursively unwrap each key
  if (Object.getPrototypeOf(v) === Object.prototype) {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(obj)) {
      out[k] = unwrapCV(val);
    }
    return out;
  }
  return v;
}

/** Safely convert an unwrapped Clarity value to a finite number (handles bigint, string, null). */
function safeNum(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "bigint") return Number(v);
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function btcToSats(btc: number): number {
  return Math.round(btc * SATS_PER_BTC);
}

export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

function parseErrorCode(err: unknown): number | null {
  const str = String(err);
  const match = str.match(/\(err u(\d+)\)/);
  return match ? parseInt(match[1], 10) : null;
}

export function getErrorMessage(err: unknown): string {
  const code = parseErrorCode(err);
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  return "Transaction failed. Please try again.";
}

// Approximate blocks to time (Stacks ~10 min per block)
export function blocksToTimeString(blocks: number): string {
  if (blocks <= 0) return "Ended";
  const minutes = blocks * 10;
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

// Days to blocks (approx 144 blocks/day)
export function daysToBlocks(days: number): number {
  return Math.round(days * 144);
}

// =============================================================================
// On-chain Campaign Type
// =============================================================================

export interface OnChainCampaign {
  id: number;
  owner: string;
  title: string;
  description: string;
  goal: number; // sats
  raised: number; // sats
  contributorsCount: number;
  startBlock: number;
  endBlock: number;
  claimed: boolean;
  refundsEnabled: boolean;
}

export interface PlatformStats {
  totalCampaigns: number;
  successfulCampaigns: number;
  totalRaised: number; // sats
}

export interface CreatorStats {
  campaignsCreated: number;
  campaignsSuccessful: number;
  totalRaised: number;
}

export interface BackerStats {
  campaignsBacked: number;
  totalContributed: number;
}

// =============================================================================
// Read-Only Functions
// =============================================================================

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function callReadOnly(
  functionName: string,
  functionArgs: ClarityValue[],
  senderAddress?: string,
  retries = 3
): Promise<ClarityValue> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fetchCallReadOnlyFunction({
        contractAddress: CONTRACT.address,
        contractName: CONTRACT.name,
        functionName,
        functionArgs,
        senderAddress: senderAddress || CONTRACT.address,
        network: NETWORK,
      });
    } catch (err: unknown) {
      const is429 =
        err instanceof Error &&
        (err.message.includes("429") || err.message.includes("Too Many"));
      if (is429 && attempt < retries - 1) {
        await sleep(1000 * 2 ** attempt); // exponential back-off
        continue;
      }
      throw err;
    }
  }
  throw new Error("callReadOnly: max retries exceeded");
}

export async function getCampaign(campaignId: number): Promise<OnChainCampaign | null> {
  const result = await callReadOnly("get-campaign", [Cl.uint(campaignId)]);
  const raw = cvToValue(result);
  if (!raw) return null;
  const val = unwrapCV(raw) as Record<string, unknown>;

  return {
    id: campaignId,
    owner: String(val.owner ?? ""),
    title: String(val.title ?? ""),
    description: String(val.description ?? ""),
    goal: safeNum(val.goal),
    raised: safeNum(val.raised),
    contributorsCount: safeNum(val["contributors-count"]),
    startBlock: safeNum(val["start-block"]),
    endBlock: safeNum(val["end-block"]),
    claimed: Boolean(val.claimed),
    refundsEnabled: Boolean(val["refunds-enabled"]),
  };
}

export async function getContribution(
  campaignId: number,
  contributor: string
): Promise<number> {
  const result = await callReadOnly("get-contribution", [
    Cl.uint(campaignId),
    Cl.standardPrincipal(contributor),
  ]);
  return Number(cvToValue(result)) || 0;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const result = await callReadOnly("get-platform-stats", []);
  const val = unwrapCV(cvToValue(result)) as Record<string, unknown>;
  return {
    totalCampaigns: safeNum(val["total-campaigns"]),
    successfulCampaigns: safeNum(val["successful-campaigns"]),
    totalRaised: safeNum(val["total-raised"]),
  };
}

export async function getCreatorStats(creator: string): Promise<CreatorStats> {
  const result = await callReadOnly("get-creator-stats", [
    Cl.standardPrincipal(creator),
  ]);
  const val = unwrapCV(cvToValue(result)) as Record<string, unknown>;
  return {
    campaignsCreated: safeNum(val["campaigns-created"]),
    campaignsSuccessful: safeNum(val["campaigns-successful"]),
    totalRaised: safeNum(val["total-raised"]),
  };
}

export async function getBackerStats(backer: string): Promise<BackerStats> {
  const result = await callReadOnly("get-backer-stats", [
    Cl.standardPrincipal(backer),
  ]);
  const val = unwrapCV(cvToValue(result)) as Record<string, unknown>;
  return {
    campaignsBacked: safeNum(val["campaigns-backed"]),
    totalContributed: safeNum(val["total-contributed"]),
  };
}

export async function isCampaignActive(campaignId: number): Promise<boolean> {
  const result = await callReadOnly("is-campaign-active", [
    Cl.uint(campaignId),
  ]);
  return cvToValue(result) === true;
}

export async function isCampaignSuccessful(campaignId: number): Promise<boolean> {
  const result = await callReadOnly("is-campaign-successful", [
    Cl.uint(campaignId),
  ]);
  return cvToValue(result) === true;
}

export async function getProgressPercentage(campaignId: number): Promise<number> {
  const result = await callReadOnly("get-progress-percentage", [
    Cl.uint(campaignId),
  ]);
  return Number(cvToValue(result));
}

export async function getTimeRemaining(campaignId: number): Promise<number> {
  const result = await callReadOnly("get-time-remaining", [
    Cl.uint(campaignId),
  ]);
  return Number(cvToValue(result));
}

// =============================================================================
// Fetch All Campaigns (iterate through nonce)
// =============================================================================

export async function getAllCampaigns(): Promise<OnChainCampaign[]> {
  const stats = await getPlatformStats();
  const total = stats.totalCampaigns;

  const campaigns: OnChainCampaign[] = [];
  // Fetch in batches of 5 to avoid rate limits
  const BATCH_SIZE = 5;
  for (let start = 0; start < total; start += BATCH_SIZE) {
    const batch = [];
    for (let i = start; i < Math.min(start + BATCH_SIZE, total); i++) {
      batch.push(getCampaign(i));
    }
    const results = await Promise.all(batch);
    for (const c of results) {
      if (c) campaigns.push(c);
    }
    // Small delay between batches to reduce rate-limit pressure
    if (start + BATCH_SIZE < total) await sleep(200);
  }

  return campaigns;
}

// =============================================================================
// Fetch current Stacks block height
// =============================================================================

export async function getCurrentBlockHeight(): Promise<number> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`${API_BASE}/v2/info`);
      if (res.status === 429) throw new Error("429 Too Many Requests");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return data.stacks_tip_height;
    } catch (err) {
      lastErr = err;
      if (attempt < 2) await sleep(1000 * 2 ** attempt);
    }
  }
  throw lastErr;
}

// =============================================================================
// Write Functions (Wallet Transactions)
// =============================================================================

export async function createCampaign(
  title: string,
  description: string,
  goalSats: number,
  durationBlocks: number
): Promise<TransactionResult> {
  return request("stx_callContract", {
    contract: CONTRACT.principal,
    functionName: "create-campaign",
    functionArgs: [
      Cl.stringUtf8(title),
      Cl.stringUtf8(description),
      Cl.uint(goalSats),
      Cl.uint(durationBlocks),
    ],
    network: NETWORK,
    postConditionMode: "allow",
  });
}

export async function contribute(
  campaignId: number,
  amountSats: number,
  senderAddress: string
): Promise<TransactionResult> {
  // Post-condition: sender will send exactly amountSats of sBTC
  const postCondition = Pc.principal(senderAddress)
    .willSendEq(amountSats)
    .ft(SBTC.principal, SBTC.assetName);

  return request("stx_callContract", {
    contract: CONTRACT.principal,
    functionName: "contribute",
    functionArgs: [
      Cl.uint(campaignId),
      Cl.uint(amountSats),
      Cl.contractPrincipal(SBTC.address, SBTC.name),
    ],
    network: NETWORK,
    postConditions: [postCondition],
    postConditionMode: "deny",
  });
}

export async function finalizeSuccessfulCampaign(
  campaignId: number
): Promise<TransactionResult> {
  return request("stx_callContract", {
    contract: CONTRACT.principal,
    functionName: "finalize-successful-campaign",
    functionArgs: [Cl.uint(campaignId)],
    network: NETWORK,
    postConditionMode: "allow",
  });
}

export async function enableRefunds(
  campaignId: number
): Promise<TransactionResult> {
  return request("stx_callContract", {
    contract: CONTRACT.principal,
    functionName: "enable-refunds",
    functionArgs: [Cl.uint(campaignId)],
    network: NETWORK,
    postConditionMode: "allow",
  });
}

export async function processRefund(
  campaignId: number,
  backerAddress: string,
  refundAmountSats: number,
  senderAddress: string
): Promise<TransactionResult> {
  // Post-condition: campaign owner sends back the exact refund amount
  const postCondition = Pc.principal(senderAddress)
    .willSendEq(refundAmountSats)
    .ft(SBTC.principal, SBTC.assetName);

  return request("stx_callContract", {
    contract: CONTRACT.principal,
    functionName: "process-refund",
    functionArgs: [
      Cl.uint(campaignId),
      Cl.standardPrincipal(backerAddress),
      Cl.contractPrincipal(SBTC.address, SBTC.name),
    ],
    network: NETWORK,
    postConditions: [postCondition],
    postConditionMode: "deny",
  });
}

export async function extendDeadline(
  campaignId: number,
  additionalBlocks: number
): Promise<TransactionResult> {
  return request("stx_callContract", {
    contract: CONTRACT.principal,
    functionName: "extend-deadline",
    functionArgs: [Cl.uint(campaignId), Cl.uint(additionalBlocks)],
    network: NETWORK,
    postConditionMode: "allow",
  });
}

export async function updateDescription(
  campaignId: number,
  newDescription: string
): Promise<TransactionResult> {
  return request("stx_callContract", {
    contract: CONTRACT.principal,
    functionName: "update-description",
    functionArgs: [Cl.uint(campaignId), Cl.stringUtf8(newDescription)],
    network: NETWORK,
    postConditionMode: "allow",
  });
}

// =============================================================================
// Hiro API helpers (for tx history, etc.)
// =============================================================================

export async function getTransactionStatus(txId: string) {
  const res = await fetch(`${API_BASE}/extended/v1/tx/${encodeURIComponent(txId)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function getExplorerUrl(txId: string): string {
  return `https://explorer.hiro.so/txid/${txId}?chain=testnet`;
}

export function getAddressExplorerUrl(address: string): string {
  return `https://explorer.hiro.so/address/${address}?chain=testnet`;
}
