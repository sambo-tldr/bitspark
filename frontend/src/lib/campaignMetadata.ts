// Off-chain campaign metadata stored in localStorage
// Used for fields not stored on-chain: imageUrl, category, shortDescription

const STORAGE_KEY = "bitspark_campaign_metadata";

export interface CampaignMetadata {
  imageUrl: string;
  category: string;
  shortDescription: string;
}

function loadAll(): Record<string, CampaignMetadata> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, CampaignMetadata>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function saveCampaignMetadata(campaignId: number, meta: CampaignMetadata) {
  const all = loadAll();
  all[String(campaignId)] = meta;
  saveAll(all);
}

export function getCampaignMetadata(campaignId: number): CampaignMetadata | null {
  const all = loadAll();
  return all[String(campaignId)] || null;
}

// Default placeholder images by category
const CATEGORY_IMAGES: Record<string, string> = {
  technology: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
  creative: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80",
  community: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
  games: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
  science: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
  other: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
};

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80";

export function getDefaultImage(category?: string): string {
  if (category) return CATEGORY_IMAGES[category.toLowerCase()] || DEFAULT_IMAGE;
  return DEFAULT_IMAGE;
}
