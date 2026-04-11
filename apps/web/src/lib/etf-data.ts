export interface EtfFund {
  ticker: string;
  name: string;
  issuer: string;
  btcHoldings: number;
  btcPerShare: number;   // approximate BTC held per share (for NAV estimation)
  launchDate: string;
  exchange: string;
}

export const BTC_ETF_DATA_AS_OF = '2025-04-01';

// btcPerShare ≈ btcHoldings / shares_outstanding (approximate, as of data date)
export const BTC_ETFS: EtfFund[] = [
  { ticker: 'IBIT',  name: 'iShares Bitcoin Trust ETF',        issuer: 'BlackRock',             btcHoldings: 570_827, btcPerShare: 0.000815, launchDate: '2024-01-11', exchange: 'NASDAQ'    },
  { ticker: 'GBTC',  name: 'Grayscale Bitcoin Trust',           issuer: 'Grayscale',             btcHoldings: 218_000, btcPerShare: 0.000765, launchDate: '2015-09-25', exchange: 'NYSE Arca' },
  { ticker: 'FBTC',  name: 'Fidelity Wise Origin Bitcoin Fund', issuer: 'Fidelity',              btcHoldings: 194_000, btcPerShare: 0.000746, launchDate: '2024-01-11', exchange: 'Cboe BZX'  },
  { ticker: 'ARKB',  name: 'ARK 21Shares Bitcoin ETF',          issuer: 'Ark Invest / 21Shares', btcHoldings:  47_000, btcPerShare: 0.000900, launchDate: '2024-01-11', exchange: 'Cboe BZX'  },
  { ticker: 'BITB',  name: 'Bitwise Bitcoin ETF',               issuer: 'Bitwise',               btcHoldings:  44_000, btcPerShare: 0.000756, launchDate: '2024-01-11', exchange: 'NYSE Arca' },
  { ticker: 'HODL',  name: 'VanEck Bitcoin ETF',                issuer: 'VanEck',                btcHoldings:  11_500, btcPerShare: 0.000930, launchDate: '2024-01-11', exchange: 'Cboe BZX'  },
  { ticker: 'BRRR',  name: 'CoinShares Valkyrie Bitcoin Fund',  issuer: 'CoinShares',            btcHoldings:   9_000, btcPerShare: 0.000923, launchDate: '2024-01-11', exchange: 'NASDAQ'    },
  { ticker: 'BTCO',  name: 'Invesco Galaxy Bitcoin ETF',        issuer: 'Invesco / Galaxy',      btcHoldings:   7_500, btcPerShare: 0.000846, launchDate: '2024-01-11', exchange: 'Cboe BZX'  },
  { ticker: 'EZBC',  name: 'Franklin Bitcoin ETF',              issuer: 'Franklin Templeton',    btcHoldings:   5_700, btcPerShare: 0.000962, launchDate: '2024-01-11', exchange: 'Cboe BZX'  },
  { ticker: 'BTCW',  name: 'WisdomTree Bitcoin Fund',           issuer: 'WisdomTree',            btcHoldings:   1_300, btcPerShare: 0.000893, launchDate: '2024-01-11', exchange: 'Cboe BZX'  },
  { ticker: 'DEFI',  name: 'Hashdex Bitcoin ETF',               issuer: 'Hashdex',               btcHoldings:     500, btcPerShare: 0.000930, launchDate: '2024-01-11', exchange: 'NYSE Arca' },
];
