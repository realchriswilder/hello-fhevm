// NOTE: dynamically import from CDN to avoid local bundling/WASM MIME issues
let fheInstance: any = null as any;

export async function initializeFheInstance() {
  if (fheInstance) return fheInstance;
  if (typeof window === 'undefined' || !(window as any).ethereum) {
    throw new Error('Ethereum provider not found. Please install MetaMask or connect a wallet.');
  }

  // Load SDK from CDN (0.2.0 browser bundle)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - HTTP import resolved by browser, not TypeScript
  const sdk: any = await import('https://cdn.zama.ai/relayer-sdk-js/0.2.0/relayer-sdk-js.js');
  const { initSDK, createInstance, SepoliaConfig } = sdk as any;

  await initSDK();
  const config = { ...SepoliaConfig, network: (window as any).ethereum };
  fheInstance = await createInstance(config);
  return fheInstance;
}

export function getFheInstance() {
  return fheInstance;
}

export async function encryptYesNo(choice: 'yes' | 'no', contractAddress: string, userAddress: string): Promise<string> {
  const fhe = await initializeFheInstance();
  // encode Yes as 1 and No as 0 (euint64)
  const value = choice === 'yes' ? 1 : 0;
  const encryptedInput = fhe.createEncryptedInput(contractAddress, userAddress);
  const result = await encryptedInput.add8(value).encrypt();
  const bytes = result.handles[0] as Uint8Array;
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
  const handle = `0x${hex}`;
  return handle; // externalEuint64-compatible handle (0x...)
}

// Decrypt an aggregate tally (single value) returned by the relayer callback/contract
export async function decryptAggregate(handle: string): Promise<number> {
  const fhe = getFheInstance();
  if (!fhe) throw new Error('FHE instance not initialized. Call initializeFheInstance() first.');
  const values = await fhe.publicDecrypt([handle]);
  return Number(values[handle] || 0);
}


