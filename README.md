# BitSpark ⚡

**Bitcoin-Native Crowdfunding on Stacks**

*Spark your ideas with Bitcoin funding*

BitSpark is a decentralized crowdfunding platform built on Stacks that enables creators to raise Bitcoin-backed funding (sBTC) for their projects. Contributors back projects using sBTC (1:1 Bitcoin-backed tokens), ensuring trustless, transparent fundraising.

## 🌟 Features

- **Create Campaigns** - Set funding goals in sBTC, duration, and project descriptions
- **Back Projects** - Contribute sBTC to campaigns you believe in
- **Automatic Refunds** - If a campaign doesn't reach its goal, backers can claim refunds
- **On-Chain Reputation** - Track creator and backer statistics
- **Low Platform Fee** - Only 2% fee on successful campaigns
- **Fully Decentralized** - All logic lives on-chain in Clarity smart contracts

## 🏗️ Architecture

```
bitspark/
├── contracts/
│   └── bitspark.clar       # Main smart contract
├── tests/
│   └── bitspark.test.ts    # Comprehensive test suite (28 tests)
├── frontend/
│   └── src/
│       ├── lib/            # Contract SDK
│       ├── hooks/          # React hooks
│       └── components/     # Example React components
├── Clarinet.toml           # Project configuration
└── README.md
```

## 📋 Smart Contract Functions

### Campaign Management
| Function | Description |
|----------|-------------|
| `create-campaign` | Create a new crowdfunding campaign |
| `update-description` | Update campaign description (owner only) |
| `extend-deadline` | Extend campaign deadline (owner only) |

### Contributions
| Function | Description |
|----------|-------------|
| `contribute` | Contribute sBTC to a campaign |

### Campaign Completion
| Function | Description |
|----------|-------------|
| `finalize-successful-campaign` | Mark campaign as complete (owner, after success) |
| `enable-refunds` | Enable refunds for failed campaign (owner) |
| `process-refund` | Process refund for a backer (owner) |

### Read-Only Functions
| Function | Description |
|----------|-------------|
| `get-campaign` | Get campaign details |
| `get-contribution` | Get user's contribution to a campaign |
| `get-creator-stats` | Get creator reputation stats |
| `get-backer-stats` | Get backer reputation stats |
| `get-platform-stats` | Get platform-wide statistics |
| `is-campaign-active` | Check if campaign is accepting contributions |
| `is-campaign-successful` | Check if campaign reached its goal |
| `get-progress-percentage` | Get funding progress (0-100%) |
| `get-time-remaining` | Get blocks until campaign ends |

## 🚀 Quick Start

### Prerequisites
- [Clarinet](https://docs.hiro.so/clarinet) v2.0+
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/bitspark.git
cd bitspark

# Install test dependencies
npm install

# Run tests
npm test
```

### Development

```bash
# Check contract syntax
clarinet check

# Open Clarinet console for testing
clarinet console

# Start devnet
clarinet devnet start
```

### Using the Console

```clarity
;; Create a campaign (0.01 BTC goal, 30 days)
(contract-call? .bitspark create-campaign 
  u"Build a Bitcoin DEX" 
  u"We are building a decentralized exchange..." 
  u1000000 
  u4320)

;; Get campaign details
(contract-call? .bitspark get-campaign u0)

;; Check campaign status
(contract-call? .bitspark is-campaign-active u0)
```

## 🧪 Testing

The test suite covers all contract functionality:

```bash
npm test
```

```
✓ Campaign Creation (5 tests)
✓ Read-Only Functions (7 tests)
✓ Campaign Updates (5 tests)
✓ Campaign Finalization (3 tests)
✓ Refund System (3 tests)
✓ Admin Functions (2 tests)
✓ Edge Cases (3 tests)

Test Files  1 passed (1)
Tests       28 passed (28)
```

## 🔧 Configuration

### Testnet Addresses (Clarinet.toml)

```toml
[[project.requirements]]
contract_id = "ST1NXBK3K5YYMD6FD41MVNP3JS1GABZ8TRVX023PT.sip-010-trait-ft-standard"

[[project.requirements]]
contract_id = "ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token"
```

### Mainnet Addresses

```toml
[[project.requirements]]
contract_id = "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE.sip-010-trait-ft-standard"

[[project.requirements]]
contract_id = "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token"
```

## 📱 Frontend Integration

### Using the SDK

```typescript
import { createCampaign, contribute, getCampaign } from 'bitspark-frontend';

// Create a campaign
const txId = await createCampaign(
  "My Project",           // title
  "Description...",       // description
  BigInt(100000),        // goal in sats (0.001 BTC)
  4320                    // duration in blocks (~30 days)
);

// Contribute to a campaign
await contribute(
  0,                      // campaign ID
  BigInt(10000),         // amount in sats
  userAddress             // contributor address
);
```

### React Hooks

```tsx
import { useCampaign, useContribute } from 'bitspark-frontend';

function CampaignPage({ id }) {
  const { campaign, loading } = useCampaign(id);
  const { contribute, loading: contributing } = useContribute();
  
  // ...
}
```

## 💰 Fee Structure

| Action | Fee |
|--------|-----|
| Create Campaign | Free |
| Contribute | Free |
| Successful Campaign Claim | 2% |
| Refund | Free |

## 🔒 Security

- **Reentrancy Protection** - State updated before external calls
- **Owner Validation** - Campaign actions restricted to owners
- **Time-Locked** - Funds locked until campaign deadline
- **Post-Conditions** - Frontend enforces exact transfer amounts

## 📄 License

MIT License - see [LICENSE](LICENSE)

## 🤝 Contributing

Contributions welcome! Please read our [Contributing Guide](CONTRIBUTING.md).

## 📞 Support

- [Stacks Discord](https://discord.gg/stacks)
- [GitHub Issues](https://github.com/YOUR_USERNAME/bitspark/issues)

---

**Built with ❤️ on Stacks**
