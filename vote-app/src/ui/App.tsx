import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { encryptYesNo, initializeFheInstance } from '../fhe';
import { castVote, requestDecryption, createSession } from '../service';
import type { Hex } from 'viem';
import { VOTING_CONTRACT_ADDRESS } from '../contracts';

export const App: React.FC = () => {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [subject, setSubject] = useState('Pizza for lunch?');
  const [yes, setYes] = useState(0);
  const [no, setNo] = useState(0);
  const [sessionId, setSessionId] = useState<bigint | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [endTime, setEndTime] = useState<bigint | null>(null);
  const onCreateSession = async () => {
    try {
      setLog((l) => [...l, 'Creating session (5 min)...']);
      const { tx, sessionId: sid, endTime: et } = await createSession(300n);
      setLog((l) => [...l, `CreateSession tx: ${tx}`]);
      setSessionId(sid);
      setEndTime(et);
    } catch (e) {
      setLog((l) => [...l, `Create session failed: ${String(e)}`]);
    }
  };

  const onVote = async (choice: 'yes' | 'no') => {
    try {
      await initializeFheInstance();
      if (!address) throw new Error('Connect wallet first.');
      const handle = await encryptYesNo(choice, VOTING_CONTRACT_ADDRESS, address);
      if (sessionId === null) throw new Error('No session. Create one first.');
      // voteType yes=1 no=0
      const voteType = choice === 'yes' ? 1 : 0;
      const tx = await castVote(sessionId, handle as Hex, voteType);
      setLog((l) => [...l, `Vote ${choice} tx: ${tx}`]);
      if (choice === 'yes') setYes((v) => v + 1); else setNo((v) => v + 1);
    } catch (e) {
      console.error('Vote failed', e);
      setLog((l) => [...l, `Vote failed: ${String(e)}`]);
    }
  };

  const isSepolia = chainId === 11155111;

  return (
    <div style={{ maxWidth: 720, margin: '32px auto', padding: 16, fontFamily: 'Inter, system-ui, Arial' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>Vote App (Sepolia)</h1>
        <ConnectButton />
      </div>

      {!isSepolia && isConnected && (
        <div style={{ padding: 12, background: '#fff3cd', border: '1px solid #ffeeba', borderRadius: 8, marginBottom: 16 }}>
          <strong>Wrong network.</strong> Please switch to Sepolia.
          <button onClick={() => switchChain?.({ chainId: 11155111 })} style={{ marginLeft: 8 }}>Switch</button>
        </div>
      )}

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 12, color: '#6b7280' }}>Voting subject</label>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={{ width: '100%', padding: 10, marginTop: 6, border: '1px solid #e5e7eb', borderRadius: 8 }}
          placeholder="Enter subject"
        />
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={onCreateSession} style={{ padding: 10, borderRadius: 8, border: '1px solid #111827' }}>Create Session (5 min)</button>
          {sessionId !== null && (
            <span style={{ fontSize: 12, color: '#6b7280' }}>Session ID: {sessionId.toString()} {endTime ? `(ends at ${endTime.toString()})` : ''}</span>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <button onClick={() => onVote('yes')} style={{ padding: 16, borderRadius: 10, border: '1px solid #10b981', background: '#d1fae5' }}>Yes</button>
        <button onClick={() => onVote('no')} style={{ padding: 16, borderRadius: 10, border: '1px solid #ef4444', background: '#fee2e2' }}>No</button>
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Yes</span>
          <strong>{yes}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>No</span>
          <strong>{no}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span>Total</span>
          <strong>{yes + no}</strong>
        </div>
        <div style={{ marginTop: 12 }}>
          <button onClick={() => sessionId !== null ? requestDecryption(sessionId) : undefined} style={{ padding: 10, borderRadius: 8, border: '1px solid #3b82f6', background: '#dbeafe' }}>Request Decryption</button>
        </div>
      </div>

      <div style={{ marginTop: 16, border: '1px solid #e5e7eb', borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }} />
        <div style={{ fontSize: 12, maxHeight: 160, overflow: 'auto' }}>
          {log.map((l, i) => (<div key={i}>{l}</div>))}
        </div>
      </div>
    </div>
  );
};


