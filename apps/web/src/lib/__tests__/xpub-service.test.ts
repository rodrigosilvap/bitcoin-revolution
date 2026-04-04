/**
 * xpub-service tests
 *
 * Test vectors are derived from a deterministic all-zeros 64-byte seed via
 * @scure/bip32 with version bytes rewritten for each format, then verified
 * against the service itself (structural / format tests).
 *
 * Derivation paths used:
 *   xpub / tpub → m/44'/0'/0'   (BIP44)
 *   ypub / upub → m/49'/0'/0'   (BIP49)
 *   zpub / vpub → m/84'/0'/0'   (BIP84)
 */
import { describe, it, expect } from 'vitest';
import { parseExtendedKey, deriveAddresses } from '../xpub-service';

// ─── Test vectors (generated from all-zeros seed) ────────────────────────────

const XPUB = 'xpub6CmEVMqHxkaGqdu3zxNRTx3fuExwg95T3HN3dY5t9oi3sLYzVupt6HTJXXZGWVjBQTwD7ZJi6HyM8BxxUhF8aqA14PBkzX6su56szCmxJ5o';
const YPUB = 'ypub6XurjiXvLSZEcopUo3R4rGXWxj15Kq9UcDcPhE9pPMiWDNoXwhcngr37yNrWDp3zeDnMYS66hy11grP5fXW5wcFU4jTkLgRAVUosiWW5RHk';
const ZPUB = 'zpub6rrCCKCXLy8rWS4CYZN8rw8uLnefWzSAF2EJkCBLPoXLH4vzPJDntjtDABCtHrq6vky6Uu1xdq6hKcPD4DahNn49TYhdgW8MNpekg99MvkT';
const TPUB = 'tpubDD8s1beyg2Xj7S5uT9MWfsP3EN4bfXaWauxLz692ViTwcdDha8fyEj88mZe42zgRCNU7j8padPoPpNTZsZ6NUGcJ7yw4g3m7V2hHkCmHLGP';
const UPUB = 'upub5EaoX3rFjiPKDd41TcGa1v9WGrRHZMBUwmXWZeaGsLCyzyYcw4xYCbQZtZ2AEBSK1fK8YXhrsKap9hvpnjr2kfX4bNg4139DQaZJAJrgHtu';
const VPUB = 'vpub5ZX8yeWrkExw7FHjD8De2aktev4skWUAaa9Rccbnsn1p4fg5NfZYQVFf5MNYJEDRJCVsUzdioBgVnTvxBRveBqKjzBuwLrrQHvQB7qKTCZF';

// ─── parseExtendedKey ────────────────────────────────────────────────────────

describe('parseExtendedKey – metadata', () => {
  it('detects xpub as P2PKH mainnet BIP44', () => {
    const info = parseExtendedKey(XPUB);
    expect(info.addressType).toBe('P2PKH');
    expect(info.network).toBe('mainnet');
    expect(info.bip).toBe(44);
    expect(info.derivationPath).toBe("m/44'/0'/0'/0");
  });

  it('detects ypub as P2SH-P2WPKH mainnet BIP49', () => {
    const info = parseExtendedKey(YPUB);
    expect(info.addressType).toBe('P2SH-P2WPKH');
    expect(info.network).toBe('mainnet');
    expect(info.bip).toBe(49);
    expect(info.derivationPath).toBe("m/49'/0'/0'/0");
  });

  it('detects zpub as P2WPKH mainnet BIP84', () => {
    const info = parseExtendedKey(ZPUB);
    expect(info.addressType).toBe('P2WPKH');
    expect(info.network).toBe('mainnet');
    expect(info.bip).toBe(84);
    expect(info.derivationPath).toBe("m/84'/0'/0'/0");
  });

  it('detects tpub as P2PKH testnet BIP44', () => {
    const info = parseExtendedKey(TPUB);
    expect(info.addressType).toBe('P2PKH');
    expect(info.network).toBe('testnet');
    expect(info.bip).toBe(44);
  });

  it('detects upub as P2SH-P2WPKH testnet BIP49', () => {
    const info = parseExtendedKey(UPUB);
    expect(info.addressType).toBe('P2SH-P2WPKH');
    expect(info.network).toBe('testnet');
    expect(info.bip).toBe(49);
  });

  it('detects vpub as P2WPKH testnet BIP84', () => {
    const info = parseExtendedKey(VPUB);
    expect(info.addressType).toBe('P2WPKH');
    expect(info.network).toBe('testnet');
    expect(info.bip).toBe(84);
  });

  it('getAddressType() matches addressType property', () => {
    const info = parseExtendedKey(ZPUB);
    expect(info.getAddressType()).toBe(info.addressType);
  });

  it('preserves originalKey', () => {
    expect(parseExtendedKey(XPUB).originalKey).toBe(XPUB);
    expect(parseExtendedKey(ZPUB).originalKey).toBe(ZPUB);
  });

  it('trims surrounding whitespace', () => {
    expect(() => parseExtendedKey(`  ${XPUB}  `)).not.toThrow();
  });
});

// ─── Address generation ───────────────────────────────────────────────────────

describe('parseExtendedKey – address generation', () => {
  it('xpub index 0 → legacy address starting with 1', () => {
    const addr = parseExtendedKey(XPUB).getAddress(0);
    expect(addr).toMatch(/^1/);
  });

  it('ypub index 0 → P2SH address starting with 3', () => {
    const addr = parseExtendedKey(YPUB).getAddress(0);
    expect(addr).toMatch(/^3/);
  });

  it('zpub index 0 → bech32 address starting with bc1q', () => {
    const addr = parseExtendedKey(ZPUB).getAddress(0);
    expect(addr).toMatch(/^bc1q/);
  });

  it('tpub index 0 → testnet legacy address starting with m or n', () => {
    const addr = parseExtendedKey(TPUB).getAddress(0);
    expect(addr).toMatch(/^[mn]/);
  });

  it('upub index 0 → testnet P2SH address starting with 2', () => {
    const addr = parseExtendedKey(UPUB).getAddress(0);
    expect(addr).toMatch(/^2/);
  });

  it('vpub index 0 → testnet bech32 address starting with tb1q', () => {
    const addr = parseExtendedKey(VPUB).getAddress(0);
    expect(addr).toMatch(/^tb1q/);
  });

  it('change=true derives a different address than change=false', () => {
    const ext = parseExtendedKey(XPUB).getAddress(0, false);
    const chg = parseExtendedKey(XPUB).getAddress(0, true);
    expect(ext).not.toBe(chg);
  });

  it('sequential indices produce different addresses', () => {
    const info = parseExtendedKey(ZPUB);
    const addrs = Array.from({ length: 5 }, (_, i) => info.getAddress(i));
    const unique = new Set(addrs);
    expect(unique.size).toBe(5);
  });

  it('same index always returns the same address (deterministic)', () => {
    const info = parseExtendedKey(XPUB);
    expect(info.getAddress(3)).toBe(info.getAddress(3));
  });
});

// ─── Validation ───────────────────────────────────────────────────────────────

describe('parseExtendedKey – validation errors', () => {
  it('throws on unknown prefix', () => {
    expect(() => parseExtendedKey('Lpub6abc')).toThrow(/Unrecognised extended key prefix/);
  });

  it('throws on bad base58 characters', () => {
    // 'O' (capital O) is not in base58
    expect(() => parseExtendedKey('xpubOOOOOOO')).toThrow(/invalid base58/i);
  });

  it('throws a checksum error when key is altered', () => {
    // Flip one character near the end
    const corrupted = XPUB.slice(0, -4) + 'XXXX';
    expect(() => parseExtendedKey(corrupted)).toThrow(/checksum|base58/i);
  });

  it('throws on empty string', () => {
    expect(() => parseExtendedKey('')).toThrow();
  });
});

// ─── deriveAddresses (backward-compatible API) ────────────────────────────────

describe('deriveAddresses – backward compatibility', () => {
  it('returns the requested count of addresses', () => {
    const result = deriveAddresses(XPUB, 0, 10);
    expect(result).toHaveLength(10);
  });

  it('index field matches position', () => {
    const result = deriveAddresses(XPUB, 5, 3);
    expect(result.map((r) => r.index)).toEqual([5, 6, 7]);
  });

  it('works for zpub producing bc1q addresses', () => {
    const result = deriveAddresses(ZPUB, 0, 5);
    result.forEach(({ address }) => expect(address).toMatch(/^bc1q/));
  });

  it('pagination is consistent — loadMore continues where previous left off', () => {
    const page1 = deriveAddresses(XPUB, 0, 10);
    const page2 = deriveAddresses(XPUB, 10, 10);
    // No duplicates across pages
    const all = [...page1, ...page2].map((r) => r.address);
    expect(new Set(all).size).toBe(20);
    // First of page2 is different from last of page1
    expect(page2[0].address).not.toBe(page1[9].address);
  });
});
