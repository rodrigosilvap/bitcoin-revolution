import { NextRequest, NextResponse } from 'next/server';

const MEMPOOL = 'https://mempool.space/api';

// Detects what the query string is: txid (64 hex), block hash (64 hex starting with many 0s),
// block height (pure integer), or address (anything else).
// We distinguish tx vs block hash by trying tx first, then block.

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q')?.trim();
  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter q' }, { status: 400 });
  }

  // ── Block height (pure integer) ───────────────────────────────────────────
  if (/^\d+$/.test(query)) {
    const hashRes = await fetch(`${MEMPOOL}/block-height/${query}`);
    if (!hashRes.ok) return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    const hash = await hashRes.text();
    const blockRes = await fetch(`${MEMPOOL}/block/${hash.trim()}`);
    if (!blockRes.ok) return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    return NextResponse.json({ type: 'block', data: await blockRes.json() });
  }

  // ── 64-char hex — try tx first, then block hash ───────────────────────────
  if (/^[0-9a-fA-F]{64}$/.test(query)) {
    const txRes = await fetch(`${MEMPOOL}/tx/${query}`);
    if (txRes.ok) return NextResponse.json({ type: 'tx', data: await txRes.json() });

    const blockRes = await fetch(`${MEMPOOL}/block/${query}`);
    if (blockRes.ok) return NextResponse.json({ type: 'block', data: await blockRes.json() });

    return NextResponse.json({ error: 'Transaction or block not found' }, { status: 404 });
  }

  // ── Address ───────────────────────────────────────────────────────────────
  const addrRes = await fetch(`${MEMPOOL}/address/${query}`);
  if (!addrRes.ok) return NextResponse.json({ error: 'Address not found' }, { status: 404 });
  const addrData = await addrRes.json();

  // Fetch the most recent 10 transactions for the address
  const txsRes = await fetch(`${MEMPOOL}/address/${query}/txs`);
  const txs = txsRes.ok ? (await txsRes.json()).slice(0, 10) : [];

  return NextResponse.json({ type: 'address', data: { ...addrData, recentTxs: txs } });
}
