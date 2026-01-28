# Trap Detector

Base固定の署名/承認リクエスト解析ツール。x402による課金API（$0.05/回）を提供。

## Features

- **Calldata Analysis**: `approve`, `setApprovalForAll`等の関数呼び出しをデコードしリスクを検出
- **EIP-712 TypedData**: EIP-2612 Permit等の署名リクエストを解析しフィッシングを検出
- **Risk Detection**: 無制限承認、未知のコントラクト、ドメイン不一致等の危険を警告
- **Multi-language**: 日本語/英語対応

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **x402 SDK**: @x402/next, @x402/evm, @x402/core
- **RPC**: viem (Base Mainnet/Sepolia)
- **UI**: Tailwind CSS

## Getting Started

### Installation

```bash
npm install
```

### Environment Variables

`.env.example`を`.env.local`にコピーして設定:

```bash
cp .env.example .env.local
```

```env
# x402 Payment Configuration
X402_PAYTO=0x...                    # 受取アドレス
X402_PRICE=$0.05                    # 価格
X402_NETWORK=eip155:8453            # Base Mainnet
X402_FACILITATOR_URL=https://api.cdp.coinbase.com/platform/v2/x402

# RPC Configuration
RPC_URL_BASE=https://mainnet.base.org

# Admin Configuration
ADMIN_PASSWORD=your-secure-password
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Health check |
| GET | /api/v1/pricing | Pricing info |
| GET | /api/v1/status | Service status |
| POST | /api/v1/analyze | Analyze request (paid) |

### POST /api/v1/analyze

**Request:**

```json
{
  "mode": "calldata" | "typedData" | "approval",
  "data": {
    // calldata mode
    "to": "0x...",
    "calldata": "0x..."
    // OR typedData mode
    "typedData": { /* EIP-712 JSON */ }
    // OR approval mode
    "token": "0x...",
    "spender": "0x...",
    "amount": "unlimited" | "1000000"
  },
  "lang": "ja" | "en"
}
```

**Response:**

```json
{
  "summary": "30秒で分かる概要",
  "decodedDetails": {
    "functionName": "approve",
    "args": {...}
  },
  "riskSignals": [
    { "id": "UNLIMITED_APPROVAL", "severity": "high", "description": "..." }
  ],
  "recommendedChecks": [...],
  "safeAlternatives": [...],
  "shareDrafts": {
    "twitter": "..."
  }
}
```

## Risk Signals

| ID | Severity | Description |
|----|----------|-------------|
| UNLIMITED_APPROVAL | critical | 無制限の承認 |
| APPROVAL_FOR_ALL_TRUE | critical | 全NFTの承認 |
| UNKNOWN_SPENDER_CONTRACT | high | 未知のコントラクト |
| TYPEDDATA_DOMAIN_MISMATCH | high | ドメイン不一致 |
| PERMIT_TO_UNKNOWN | high | 未知アドレスへのPermit |
| HIGH_VALUE_APPROVAL | medium | 高額承認 |
| EOA_SPENDER | medium | EOAへの承認 |
| UNCLEAR_INTENT | medium | 意図不明 |

## Pages

- `/` - Landing Page
- `/playground` - Analysis UI with 3 tabs
- `/admin` - Admin dashboard

## Testing

`fixtures/`ディレクトリにサンプルデータあり:

- `approve.json` - ERC-20 unlimited approval
- `setApprovalForAll.json` - ERC-721 approval for all
- `permit.json` - EIP-2612 permit

## Verification

```bash
# Start development server
npm run dev

# Check health
curl http://localhost:3000/api/health

# Check pricing
curl http://localhost:3000/api/v1/pricing

# Check status
curl http://localhost:3000/api/v1/status

# Analyze (will return 402 if x402 is configured)
curl -X POST http://localhost:3000/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"mode":"approval","data":{"token":"0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913","spender":"0xDef1C0ded9bec7F1a1670819833240f027b25EfF","amount":"unlimited"},"lang":"ja"}'
```

## License

MIT
