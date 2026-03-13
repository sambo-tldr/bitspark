export interface Campaign {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  category: string;
  imageUrl: string;
  goal: number;
  raised: number;
  backers: number;
  daysLeft: number;
  creator: string;
  creatorAddress: string;
  status: 'active' | 'funded' | 'failed' | 'claimed';
  featured?: boolean;
  createdAt: string;
  updates: number;
}

export interface ActivityItem {
  id: string;
  type: 'contribution' | 'campaign_created' | 'milestone';
  user: string;
  amount?: number;
  campaign: string;
  timestamp: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  color: string;
}

export const campaigns: Campaign[] = [
  {
    id: "1",
    title: "Decentralized Mesh Network for Rural Communities",
    description: "Building a self-sustaining mesh network powered by Bitcoin Lightning payments. Each node operator earns sats while providing internet access to underserved rural areas. Our solution uses low-cost hardware and open-source software to create resilient, censorship-resistant connectivity.\n\nThe project aims to deploy 500 nodes across three pilot regions, creating a blueprint that can be replicated globally. Node operators earn Bitcoin through a proof-of-uptime mechanism, creating sustainable incentives for network growth.",
    shortDescription: "Self-sustaining mesh network powered by Bitcoin Lightning for rural connectivity.",
    category: "Technology",
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    goal: 2.5,
    raised: 1.87,
    backers: 342,
    daysLeft: 18,
    creator: "MeshNet Collective",
    creatorAddress: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
    status: "active",
    featured: true,
    createdAt: "2026-01-15",
    updates: 5,
  },
  {
    id: "2",
    title: "Bitcoin Education Platform for Developing Nations",
    description: "A comprehensive, multilingual educational platform teaching Bitcoin fundamentals, Lightning Network usage, and financial sovereignty. Available offline through progressive web app technology, making it accessible even in areas with limited connectivity.",
    shortDescription: "Multilingual Bitcoin education platform with offline support for developing nations.",
    category: "Community",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
    goal: 1.8,
    raised: 1.8,
    backers: 567,
    daysLeft: 0,
    creator: "Bitcoin Academy DAO",
    creatorAddress: "SP1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE",
    status: "funded",
    featured: true,
    createdAt: "2025-12-01",
    updates: 12,
  },
  {
    id: "3",
    title: "Open-Source Bitcoin Hardware Wallet",
    description: "Designing and manufacturing an affordable, fully open-source hardware wallet. All schematics, firmware, and manufacturing processes will be publicly available, enabling anyone to audit, build, or improve upon the design.",
    shortDescription: "Affordable, fully open-source hardware wallet with auditable design.",
    category: "Technology",
    imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80",
    goal: 5.0,
    raised: 3.2,
    backers: 891,
    daysLeft: 32,
    creator: "OpenHW Labs",
    creatorAddress: "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE",
    status: "active",
    featured: true,
    createdAt: "2026-01-20",
    updates: 8,
  },
  {
    id: "4",
    title: "Sats-Powered Indie Game: Lightning Realms",
    description: "A retro-inspired RPG where players earn real satoshis through gameplay. Built on Stacks with Bitcoin settlement, featuring procedurally generated worlds and player-owned assets.",
    shortDescription: "Retro RPG where players earn real satoshis through gameplay on Stacks.",
    category: "Games",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
    goal: 3.0,
    raised: 0.45,
    backers: 128,
    daysLeft: 45,
    creator: "Pixel Sats Studio",
    creatorAddress: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS",
    status: "active",
    createdAt: "2026-02-01",
    updates: 2,
  },
  {
    id: "5",
    title: "Bitcoin-Native Documentary: Sound Money",
    description: "A feature-length documentary exploring how Bitcoin is transforming economies in Africa, Southeast Asia, and Latin America. Filming across 12 countries with real stories of financial empowerment.",
    shortDescription: "Documentary on Bitcoin's economic impact across 12 countries.",
    category: "Creative",
    imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80",
    goal: 4.2,
    raised: 2.1,
    backers: 445,
    daysLeft: 21,
    creator: "Satoshi Films",
    creatorAddress: "SP1P72Z3704VMT3DMHPP2CB8TGQWGDBHD3RPR9GZS",
    status: "active",
    createdAt: "2026-01-10",
    updates: 6,
  },
  {
    id: "6",
    title: "Community Bitcoin Mining Co-op",
    description: "Establishing a community-owned mining operation using stranded renewable energy. Profits are distributed to co-op members via Lightning, with a portion funding local sustainability projects.",
    shortDescription: "Community-owned mining co-op powered by renewable energy.",
    category: "Community",
    imageUrl: "https://images.unsplash.com/photo-1516245834210-c4c142787335?w=800&q=80",
    goal: 8.0,
    raised: 1.2,
    backers: 89,
    daysLeft: 55,
    creator: "Green Hash Collective",
    creatorAddress: "SP31DA6FTSJX2WGTZ69SFY11BH51NZMB0ZZ239N96",
    status: "active",
    createdAt: "2026-02-10",
    updates: 1,
  },
  {
    id: "7",
    title: "Peer-to-Peer Science Funding Protocol",
    description: "A decentralized protocol for funding scientific research directly, bypassing traditional grant systems. Researchers publish proposals, and backers can fund specific experiments with Bitcoin.",
    shortDescription: "Decentralized protocol for direct Bitcoin-based science funding.",
    category: "Science",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    goal: 3.5,
    raised: 3.5,
    backers: 672,
    daysLeft: 0,
    creator: "DeSci Foundation",
    creatorAddress: "SP2C2YFP12AJZB1KT5YCNKJYF58P4RPAG3V83RTAN",
    status: "funded",
    createdAt: "2025-11-15",
    updates: 15,
  },
  {
    id: "8",
    title: "Bitcoin Art Gallery: The Genesis Collection",
    description: "Curating and hosting the world's first physical gallery dedicated to Bitcoin-inspired art. Features 50 artists exploring themes of decentralization, sovereignty, and digital scarcity.",
    shortDescription: "World's first physical gallery for Bitcoin-inspired art.",
    category: "Creative",
    imageUrl: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80",
    goal: 1.5,
    raised: 0.3,
    backers: 45,
    daysLeft: 60,
    creator: "Block Canvas",
    creatorAddress: "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9",
    status: "active",
    createdAt: "2026-02-15",
    updates: 0,
  },
  {
    id: "9",
    title: "Lightning-Powered Podcast Platform",
    description: "Building a podcast hosting and streaming platform with native Lightning tipping. Listeners pay per minute with streaming sats, creating a direct value exchange between creators and audiences.",
    shortDescription: "Podcast platform with native Lightning micropayments.",
    category: "Technology",
    imageUrl: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800&q=80",
    goal: 2.0,
    raised: 0.15,
    backers: 34,
    daysLeft: 40,
    creator: "SatsStream",
    creatorAddress: "SP2X0TBJ10BH5G7S8PB50KFDHX0B0HKN5JZA82HYN",
    status: "active",
    createdAt: "2026-02-12",
    updates: 1,
  },
  {
    id: "10",
    title: "Bitcoin Node Distribution Project",
    description: "Distributing pre-configured Bitcoin full nodes to communities worldwide. Each node comes with educational materials and a year of remote support to help new operators.",
    shortDescription: "Distributing pre-configured Bitcoin nodes with education and support.",
    category: "Community",
    imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
    goal: 1.0,
    raised: 0.0,
    backers: 0,
    daysLeft: 30,
    creator: "Node Runners",
    creatorAddress: "SP1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5",
    status: "active",
    createdAt: "2026-02-20",
    updates: 0,
  },
];

export const categories: Category[] = [
  { id: "technology", name: "Technology", icon: "Cpu", count: 24, color: "from-blue-500/20 to-cyan-500/20" },
  { id: "creative", name: "Creative", icon: "Palette", count: 18, color: "from-purple-500/20 to-pink-500/20" },
  { id: "community", name: "Community", icon: "Users", count: 31, color: "from-green-500/20 to-emerald-500/20" },
  { id: "games", name: "Games", icon: "Gamepad2", count: 12, color: "from-orange-500/20 to-red-500/20" },
  { id: "science", name: "Science", icon: "Microscope", count: 9, color: "from-teal-500/20 to-blue-500/20" },
  { id: "other", name: "Other", icon: "Sparkles", count: 7, color: "from-yellow-500/20 to-amber-500/20" },
];

export const activityFeed: ActivityItem[] = [
  { id: "a1", type: "contribution", user: "SP2J6Z...9EJ7", amount: 0.025, campaign: "Decentralized Mesh Network", timestamp: "2 min ago" },
  { id: "a2", type: "contribution", user: "SP1HTB...8QE", amount: 0.1, campaign: "Bitcoin Education Platform", timestamp: "5 min ago" },
  { id: "a3", type: "campaign_created", user: "SP3FBR...VTE", campaign: "Open-Source Hardware Wallet", timestamp: "12 min ago" },
  { id: "a4", type: "contribution", user: "SP2ZNG...KS", amount: 0.05, campaign: "Lightning Realms", timestamp: "18 min ago" },
  { id: "a5", type: "milestone", user: "SP1P72...GZS", campaign: "Sound Money Documentary", timestamp: "25 min ago" },
  { id: "a6", type: "contribution", user: "SP31DA...N96", amount: 0.5, campaign: "Mining Co-op", timestamp: "31 min ago" },
  { id: "a7", type: "contribution", user: "SP2C2Y...TAN", amount: 0.075, campaign: "DeSci Funding Protocol", timestamp: "38 min ago" },
  { id: "a8", type: "contribution", user: "SP3K8B...BR9", amount: 0.01, campaign: "Bitcoin Art Gallery", timestamp: "45 min ago" },
];

export const platformStats = {
  totalRaised: 142.5,
  projectsFunded: 89,
  activeBackers: 12847,
  activeCampaigns: 156,
};

export const backersList = [
  { address: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7", amount: 0.5, timestamp: "2026-02-20" },
  { address: "SP1HTBVD3JG9C05J7HBJTHGR0GGW7KXW28M5JS8QE", amount: 0.25, timestamp: "2026-02-19" },
  { address: "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE", amount: 1.0, timestamp: "2026-02-18" },
  { address: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS", amount: 0.1, timestamp: "2026-02-17" },
  { address: "SP1P72Z3704VMT3DMHPP2CB8TGQWGDBHD3RPR9GZS", amount: 0.05, timestamp: "2026-02-16" },
];
