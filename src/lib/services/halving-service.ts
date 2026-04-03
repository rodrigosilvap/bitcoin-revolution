export interface HalvingInfo {
  currentBlock: number;
  currentHalving: number;
  nextHalvingBlock: number;
  blocksRemaining: number;
  minutesRemaining: number;
  hoursRemaining: number;
  daysRemaining: number;
  estimatedDate: Date;
  nextReward: number;
  currentReward: number;
}

export interface HalvingCountdown {
  days: number;
  hours: number;
  minutes: number;
  display: string;
  fullDisplay: string;
}

const AVERAGE_BLOCK_TIME_MS = 10 * 60 * 1000;
const BLOCKS_PER_HALVING = 210_000;

// Reference: Block 840,000 mined ~2024-04-19
const REFERENCE_BLOCK = 840_000;
const REFERENCE_TIMESTAMP = new Date('2024-04-19T23:34:00Z').getTime();

export function getCurrentBlockHeight(): number {
  const now = Date.now();
  const timeSinceReference = now - REFERENCE_TIMESTAMP;
  const blocksSinceReference = Math.floor(timeSinceReference / AVERAGE_BLOCK_TIME_MS);
  return REFERENCE_BLOCK + blocksSinceReference;
}

export function getRewardForHalving(halvingNumber: number): number {
  return 50 / Math.pow(2, halvingNumber);
}

export function calculateHalving(currentBlock?: number): HalvingInfo {
  const block = currentBlock ?? getCurrentBlockHeight();
  const currentHalving = Math.floor(block / BLOCKS_PER_HALVING);
  const nextHalvingBlock = (currentHalving + 1) * BLOCKS_PER_HALVING;
  const blocksRemaining = nextHalvingBlock - block;

  const minutesRemaining = blocksRemaining * 10;
  const hoursRemaining = minutesRemaining / 60;
  const daysRemaining = hoursRemaining / 24;

  const estimatedDate = new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000);

  return {
    currentBlock: block,
    currentHalving,
    nextHalvingBlock,
    blocksRemaining,
    minutesRemaining,
    hoursRemaining,
    daysRemaining,
    estimatedDate,
    nextReward: getRewardForHalving(currentHalving + 1),
    currentReward: getRewardForHalving(currentHalving),
  };
}

export function formatCountdown(halving: HalvingInfo): HalvingCountdown {
  const days = Math.floor(halving.daysRemaining);
  const hours = Math.floor(halving.hoursRemaining % 24);
  const minutes = Math.floor(halving.minutesRemaining % 60);

  return {
    days,
    hours,
    minutes,
    display: `${days}d ${hours}h ${minutes}m`,
    fullDisplay: `${days} days, ${hours} hours, ${minutes} minutes`,
  };
}
