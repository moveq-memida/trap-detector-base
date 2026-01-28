import { createPublicClient, http, type Address } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { ERC20_ABI, ERC721_ABI } from '../decoder/signatures';

// Create client for Base Mainnet
export function getBaseClient() {
  const rpcUrl = process.env.RPC_URL_BASE || 'https://mainnet.base.org';
  return createPublicClient({
    chain: base,
    transport: http(rpcUrl),
  });
}

// Create client for Base Sepolia (testnet)
export function getBaseSepoliaClient() {
  return createPublicClient({
    chain: baseSepolia,
    transport: http('https://sepolia.base.org'),
  });
}

// Check if an address is a contract
export async function isContract(address: Address): Promise<boolean> {
  const client = getBaseClient();
  try {
    const code = await client.getCode({ address });
    return code !== undefined && code !== '0x';
  } catch {
    return false;
  }
}

// Get token info (ERC-20)
export async function getTokenInfo(address: Address): Promise<{
  name?: string;
  symbol?: string;
  decimals?: number;
}> {
  const client = getBaseClient();
  const result: { name?: string; symbol?: string; decimals?: number } = {};

  try {
    const name = await client.readContract({
      address,
      abi: ERC20_ABI,
      functionName: 'name',
    });
    result.name = name as string;
  } catch {
    // Token might not have name
  }

  try {
    const symbol = await client.readContract({
      address,
      abi: ERC20_ABI,
      functionName: 'symbol',
    });
    result.symbol = symbol as string;
  } catch {
    // Token might not have symbol
  }

  try {
    const decimals = await client.readContract({
      address,
      abi: ERC20_ABI,
      functionName: 'decimals',
    });
    result.decimals = Number(decimals);
  } catch {
    // Token might not have decimals
  }

  return result;
}

// Get NFT info (ERC-721)
export async function getNFTInfo(address: Address): Promise<{
  name?: string;
  symbol?: string;
}> {
  const client = getBaseClient();
  const result: { name?: string; symbol?: string } = {};

  try {
    const name = await client.readContract({
      address,
      abi: ERC721_ABI,
      functionName: 'name',
    });
    result.name = name as string;
  } catch {
    // NFT might not have name
  }

  try {
    const symbol = await client.readContract({
      address,
      abi: ERC721_ABI,
      functionName: 'symbol',
    });
    result.symbol = symbol as string;
  } catch {
    // NFT might not have symbol
  }

  return result;
}

// Check RPC connection health
export async function checkRpcHealth(): Promise<boolean> {
  const client = getBaseClient();
  try {
    await client.getBlockNumber();
    return true;
  } catch {
    return false;
  }
}

// Get current block number
export async function getBlockNumber(): Promise<bigint> {
  const client = getBaseClient();
  return client.getBlockNumber();
}
