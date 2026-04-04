import { NextRequest, NextResponse } from 'next/server';

const MEMPOOL = 'https://mempool.space/api';

interface MempoolAddressStats {
  funded_txo_count: number;
  funded_txo_sum: number;
  spent_txo_count: number;
  spent_txo_sum: number;
  tx_count: number;
}

interface MempoolAddress {
  address: string;
  chain_stats: MempoolAddressStats;
  mempool_stats: MempoolAddressStats;
}

interface MempoolTxStatus {
  confirmed: boolean;
  block_height?: number;
  block_hash?: string;
  block_time?: number;
}

interface MempoolVout {
  scriptpubkey_address?: string;
  value: number;
}

interface MempoolTx {
  txid: string;
  vout: MempoolVout[];
  status: MempoolTxStatus;
}

export interface PaymentMonitorTx {
  txid: string;
  valueSat: number;
  confirmed: boolean;
  confirmations: number;
  blockHeight: number | null;
  blockTime: number | null;
}

export interface PaymentMonitorResponse {
  address: string;
  balanceSat: number;
  receivedSat: number;
  pendingSat: number;
  tipHeight: number;
  txs: PaymentMonitorTx[];
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const address = req.nextUrl.searchParams.get('address')?.trim();
  if (!address) {
    return NextResponse.json({ error: 'Missing required parameter: address' }, { status: 400 });
  }

  const [addrRes, txsRes, tipRes] = await Promise.all([
    fetch(`${MEMPOOL}/address/${address}`),
    fetch(`${MEMPOOL}/address/${address}/txs`),
    fetch(`${MEMPOOL}/blocks/tip/height`),
  ]);

  if (!addrRes.ok) {
    const status = addrRes.status === 400 ? 400 : 404;
    return NextResponse.json({ error: 'Address not found or invalid' }, { status });
  }

  const addrData = (await addrRes.json()) as MempoolAddress;
  const allTxs: MempoolTx[] = txsRes.ok ? await txsRes.json() : [];
  const tipHeight: number = tipRes.ok ? parseInt(await tipRes.text(), 10) : 0;

  const balanceSat =
    addrData.chain_stats.funded_txo_sum - addrData.chain_stats.spent_txo_sum;
  const receivedSat = addrData.chain_stats.funded_txo_sum;
  const pendingSat = addrData.mempool_stats.funded_txo_sum - addrData.mempool_stats.spent_txo_sum;

  // Keep only the 10 most recent txs; filter for ones that fund this address
  const txs: PaymentMonitorTx[] = allTxs.slice(0, 10).map((tx) => {
    const valueSat = tx.vout
      .filter((o) => o.scriptpubkey_address === address)
      .reduce((sum, o) => sum + o.value, 0);

    const confirmations =
      tx.status.confirmed && tx.status.block_height && tipHeight
        ? tipHeight - tx.status.block_height + 1
        : 0;

    return {
      txid: tx.txid,
      valueSat,
      confirmed: tx.status.confirmed,
      confirmations,
      blockHeight: tx.status.block_height ?? null,
      blockTime: tx.status.block_time ?? null,
    };
  });

  const body: PaymentMonitorResponse = {
    address,
    balanceSat,
    receivedSat,
    pendingSat,
    tipHeight,
    txs,
  };

  return NextResponse.json(body);
}
