import { createPublicClient, createWalletClient, http, Hex, custom, decodeEventLog, type Address } from 'viem';
import { sepolia } from 'viem/chains';
import { VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI } from './contracts';

export function getPublicClient() {
  return createPublicClient({ chain: sepolia, transport: http(import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org') });
}

export async function getWalletClient() {
  const client = createWalletClient({ chain: sepolia, transport: custom((window as any).ethereum) });
  return client;
}

async function getAccountAddress(): Promise<Address> {
  const [addr] = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
  return addr as Address;
}

export async function castVote(sessionId: bigint, encryptedHandle: Hex, voteType: number): Promise<Hex> {
  const wallet = await getWalletClient();
  const hash = await wallet.writeContract({
    address: VOTING_CONTRACT_ADDRESS as `0x${string}`,
    abi: VOTING_CONTRACT_ABI as any,
    functionName: 'vote',
    args: [sessionId, encryptedHandle, voteType, '0x' as Hex],
    chain: sepolia,
    account: await getAccountAddress(),
  });
  return hash as Hex;
}

export async function requestDecryption(sessionId: bigint): Promise<Hex> {
  const wallet = await getWalletClient();
  const hash = await wallet.writeContract({
    address: VOTING_CONTRACT_ADDRESS as `0x${string}`,
    abi: VOTING_CONTRACT_ABI as any,
    functionName: 'requestTallyReveal',
    args: [sessionId],
    chain: sepolia,
    account: await getAccountAddress(),
  });
  return hash as Hex;
}

export async function createSession(durationSeconds: bigint): Promise<{ tx: Hex; sessionId: bigint; endTime: bigint }> {
  const wallet = await getWalletClient();
  const tx = await wallet.writeContract({
    address: VOTING_CONTRACT_ADDRESS as `0x${string}`,
    abi: VOTING_CONTRACT_ABI as any,
    functionName: 'createSession',
    args: [durationSeconds],
    chain: sepolia,
    account: await getAccountAddress(),
  });
  const publicClient = getPublicClient();
  const receipt = await publicClient.waitForTransactionReceipt({ hash: tx as Hex });
  // Parse SessionCreated(sessionId, creator, endTime)
  let sessionId: bigint = 0n;
  let endTime: bigint = 0n;
  for (const log of receipt.logs) {
    try {
      const decoded = decodeEventLog({ abi: VOTING_CONTRACT_ABI as unknown as [], data: log.data, topics: log.topics }) as unknown as { eventName: string; args: Record<string, unknown> };
      if (decoded.eventName === 'SessionCreated') {
        const argsObj = decoded.args;
        sessionId = BigInt(argsObj.sessionId as string | number | bigint);
        endTime = BigInt(argsObj.endTime as string | number | bigint);
        break;
      }
    } catch (_e) {
      // skip non-matching logs
    }
  }
  return { tx: tx as Hex, sessionId, endTime };
}


