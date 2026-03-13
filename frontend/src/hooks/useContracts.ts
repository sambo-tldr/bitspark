import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllCampaigns,
  getCampaign,
  getPlatformStats,
  getCreatorStats,
  getBackerStats,
  getContribution,
  getCurrentBlockHeight,
  createCampaign,
  contribute,
  finalizeSuccessfulCampaign,
  enableRefunds,
  processRefund,
  satsToBtc,
  btcToSats,
  daysToBlocks,
  getErrorMessage,
  getExplorerUrl,
  type OnChainCampaign,
} from "@/lib/contracts";
import {
  getCampaignMetadata,
  saveCampaignMetadata,
  getDefaultImage,
  type CampaignMetadata,
} from "@/lib/campaignMetadata";
import type { Campaign } from "@/data/mockData";

// =============================================================================
// Convert on-chain campaign to UI campaign
// =============================================================================

export function toUICampaign(
  c: OnChainCampaign,
  currentBlock: number
): Campaign {
  const meta = getCampaignMetadata(c.id);
  const blocksLeft = Math.max(0, c.endBlock - currentBlock);
  const daysLeft = Math.max(0, Math.round(blocksLeft / 144));

  // Derive status
  let status: Campaign["status"];
  if (c.claimed) {
    status = "claimed";
  } else if (c.refundsEnabled) {
    status = "failed";
  } else if (c.raised >= c.goal && blocksLeft === 0) {
    status = "funded";
  } else if (blocksLeft === 0 && c.raised < c.goal) {
    status = "failed";
  } else {
    status = "active";
  }

  const category = meta?.category || "Other";

  return {
    id: String(c.id),
    title: c.title,
    description: c.description,
    shortDescription: c.description.slice(0, 120) + (c.description.length > 120 ? "..." : ""),
    category,
    imageUrl: meta?.imageUrl || getDefaultImage(category),
    goal: satsToBtc(c.goal),
    raised: satsToBtc(c.raised),
    backers: c.contributorsCount,
    daysLeft,
    creator: c.owner,
    creatorAddress: c.owner,
    status,
    featured: false,
    createdAt: new Date().toISOString().split("T")[0], // approx
    updates: 0,
  };
}

// =============================================================================
// Query Keys
// =============================================================================

export const queryKeys = {
  campaigns: ["campaigns"] as const,
  campaign: (id: number) => ["campaign", id] as const,
  platformStats: ["platformStats"] as const,
  creatorStats: (addr: string) => ["creatorStats", addr] as const,
  backerStats: (addr: string) => ["backerStats", addr] as const,
  contribution: (campaignId: number, addr: string) =>
    ["contribution", campaignId, addr] as const,
  blockHeight: ["blockHeight"] as const,
};

// =============================================================================
// Hooks
// =============================================================================

export function useBlockHeight() {
  return useQuery({
    queryKey: queryKeys.blockHeight,
    queryFn: getCurrentBlockHeight,
    refetchInterval: 120_000,
    staleTime: 60_000,
  });
}

export function useCampaigns() {
  const { data: blockHeight } = useBlockHeight();

  return useQuery({
    queryKey: queryKeys.campaigns,
    queryFn: async () => {
      const [campaigns, currentBlock] = await Promise.all([
        getAllCampaigns(),
        blockHeight ? Promise.resolve(blockHeight) : getCurrentBlockHeight(),
      ]);
      return campaigns.map((c) => toUICampaign(c, currentBlock));
    },
    enabled: true,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export function useCampaign(id: number) {
  const { data: blockHeight } = useBlockHeight();

  return useQuery({
    queryKey: queryKeys.campaign(id),
    queryFn: async () => {
      const [campaign, currentBlock] = await Promise.all([
        getCampaign(id),
        blockHeight ? Promise.resolve(blockHeight) : getCurrentBlockHeight(),
      ]);
      if (!campaign) return null;
      return toUICampaign(campaign, currentBlock);
    },
    staleTime: 15_000,
  });
}

export function useRawCampaign(id: number) {
  return useQuery({
    queryKey: [...queryKeys.campaign(id), "raw"],
    queryFn: () => getCampaign(id),
    staleTime: 15_000,
  });
}

export function usePlatformStats() {
  return useQuery({
    queryKey: queryKeys.platformStats,
    queryFn: getPlatformStats,
    staleTime: 30_000,
  });
}

export function useCreatorStats(address: string | undefined) {
  return useQuery({
    queryKey: queryKeys.creatorStats(address || ""),
    queryFn: () => getCreatorStats(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

export function useBackerStats(address: string | undefined) {
  return useQuery({
    queryKey: queryKeys.backerStats(address || ""),
    queryFn: () => getBackerStats(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

export function useContribution(
  campaignId: number,
  address: string | undefined
) {
  return useQuery({
    queryKey: queryKeys.contribution(campaignId, address || ""),
    queryFn: () => getContribution(campaignId, address!),
    enabled: !!address,
    staleTime: 15_000,
  });
}

// =============================================================================
// Mutations
// =============================================================================

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      title: string;
      description: string;
      goalBtc: number;
      durationDays: number;
      metadata: CampaignMetadata;
    }) => {
      const goalSats = btcToSats(params.goalBtc);
      const durationBlocks = daysToBlocks(params.durationDays);
      const result = await createCampaign(
        params.title,
        params.description,
        goalSats,
        durationBlocks
      );
      // After creation, fetch stats to get the new campaign ID
      const stats = await getPlatformStats();
      const newId = stats.totalCampaigns - 1;
      saveCampaignMetadata(newId, params.metadata);
      return { ...result, campaignId: newId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns });
      queryClient.invalidateQueries({ queryKey: queryKeys.platformStats });
    },
  });
}

export function useContribute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      campaignId: number;
      amountBtc: number;
      senderAddress: string;
    }) => {
      const amountSats = btcToSats(params.amountBtc);
      return contribute(params.campaignId, amountSats, params.senderAddress);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.campaign(vars.campaignId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns });
    },
  });
}

export function useClaimFunds() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { campaignId: number }) => {
      return finalizeSuccessfulCampaign(params.campaignId);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.campaign(vars.campaignId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns });
    },
  });
}

export function useEnableRefunds() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { campaignId: number }) => {
      return enableRefunds(params.campaignId);
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.campaign(vars.campaignId),
      });
    },
  });
}

export function useProcessRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      campaignId: number;
      backerAddress: string;
      refundAmountSats: number;
      senderAddress: string;
    }) => {
      return processRefund(
        params.campaignId,
        params.backerAddress,
        params.refundAmountSats,
        params.senderAddress
      );
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.campaign(vars.campaignId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns });
    },
  });
}

export { getErrorMessage, getExplorerUrl, satsToBtc, btcToSats };
