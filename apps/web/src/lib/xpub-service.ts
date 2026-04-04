/**
 * xpub-service.ts
 *
 * Unified extended public key abstraction supporting all XPUB family formats:
 *   Mainnet: xpub (BIP44), ypub (BIP49), zpub (BIP84), Ypub (P2SH-multisig), Zpub (P2WSH-multisig)
 *   Testnet: tpub (BIP44), upub (BIP49), vpub (BIP84)
 *
 * Public API
 * ----------
 *   parseExtendedKey(key)        → ExtendedKeyInfo
 *   deriveAddresses(key, start, count)  → DerivedAddress[]   (backward-compatible)
 *
 * On the ExtendedKeyInfo object you can call:
 *   .getAddress(index, change?)  → string
 *   .getAddressType()            → AddressType
 */

import { HDKey } from '@scure/bip32';
import { sha256 } from '@noble/hashes/sha2.js';
import { ripemd160 } from '@noble/hashes/legacy.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AddressType =
  | 'P2PKH'           // Legacy        1...
  | 'P2SH-P2WPKH'    // Nested SegWit 3...
  | 'P2WPKH'         // Native SegWit bc1q...
  | 'P2SH-P2WSH'     // Multisig nested SegWit 3...
  | 'P2WSH';         // Multisig native SegWit bc1q... (32-byte)

export type Network = 'mainnet' | 'testnet';

export interface ExtendedKeyInfo {
  /** Original key string as supplied by the caller */
  originalKey: string;
  /** Detected address type */
  addressType: AddressType;
  /** Detected network */
  network: Network;
  /** BIP number that governs this key format */
  bip: 44 | 49 | 84;
  /** Suggested derivation path (informational — derivation is done externally) */
  derivationPath: string;
  /** Derive a single address at the given index on the external (change=false) or internal chain */
  getAddress(index: number, change?: boolean): string;
  /** Returns the address type string */
  getAddressType(): AddressType;
}

export interface DerivedAddress {
  index: number;
  address: string;
}

// ---------------------------------------------------------------------------
// Version-byte registry
// ---------------------------------------------------------------------------

interface PrefixEntry {
  prefix: string;
  version: number;       // 4-byte big-endian integer
  addressType: AddressType;
  network: Network;
  bip: 44 | 49 | 84;
  derivationPath: string;
}

// Canonical xpub version used internally for HDKey parsing
const XPUB_VERSION = 0x0488b21e;
const TPUB_VERSION = 0x043587cf;

const PREFIX_TABLE: PrefixEntry[] = [
  // ── Mainnet ──────────────────────────────────────────────────────────────
  { prefix: 'xpub', version: 0x0488b21e, addressType: 'P2PKH',        network: 'mainnet', bip: 44, derivationPath: "m/44'/0'/0'/0" },
  { prefix: 'ypub', version: 0x049d7cb2, addressType: 'P2SH-P2WPKH',  network: 'mainnet', bip: 49, derivationPath: "m/49'/0'/0'/0" },
  { prefix: 'zpub', version: 0x04b24746, addressType: 'P2WPKH',        network: 'mainnet', bip: 84, derivationPath: "m/84'/0'/0'/0" },
  { prefix: 'Ypub', version: 0x0295b43f, addressType: 'P2SH-P2WSH',   network: 'mainnet', bip: 49, derivationPath: "m/49'/0'/0'/0" },
  { prefix: 'Zpub', version: 0x02aa7ed3, addressType: 'P2WSH',         network: 'mainnet', bip: 84, derivationPath: "m/84'/0'/0'/0" },
  // ── Testnet ──────────────────────────────────────────────────────────────
  { prefix: 'tpub', version: 0x043587cf, addressType: 'P2PKH',        network: 'testnet', bip: 44, derivationPath: "m/44'/1'/0'/0" },
  { prefix: 'upub', version: 0x044a5262, addressType: 'P2SH-P2WPKH',  network: 'testnet', bip: 49, derivationPath: "m/49'/1'/0'/0" },
  { prefix: 'vpub', version: 0x045f1cf6, addressType: 'P2WPKH',        network: 'testnet', bip: 84, derivationPath: "m/84'/1'/0'/0" },
];

// ---------------------------------------------------------------------------
// Base58 helpers
// ---------------------------------------------------------------------------

const B58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function b58Encode(bytes: Uint8Array): string {
  let leadingZeros = 0;
  for (const b of bytes) {
    if (b !== 0) break;
    leadingZeros++;
  }
  const digits = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let i = 0; i < digits.length; i++) {
      carry += digits[i] << 8;
      digits[i] = carry % 58;
      carry = Math.floor(carry / 58);
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }
  return '1'.repeat(leadingZeros) + digits.reverse().map((d) => B58_ALPHABET[d]).join('');
}

function b58Decode(str: string): Uint8Array {
  // Accumulate base-256 digits from base-58 input
  const bytes = [0];
  for (const char of str) {
    const idx = B58_ALPHABET.indexOf(char);
    if (idx < 0) throw new Error(`Invalid base58 character: "${char}"`);
    let carry = idx;
    for (let i = 0; i < bytes.length; i++) {
      carry += bytes[i] * 58;
      bytes[i] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  // Reverse to big-endian and prepend leading zero bytes
  bytes.reverse();
  let leadingZeros = 0;
  for (const char of str) {
    if (char === '1') leadingZeros++;
    else break;
  }
  return new Uint8Array([...new Array(leadingZeros).fill(0), ...bytes]);
}

// ---------------------------------------------------------------------------
// Checksum
// ---------------------------------------------------------------------------

function addChecksum(payload: Uint8Array): Uint8Array {
  const checksum = sha256(sha256(payload)).slice(0, 4);
  const out = new Uint8Array(payload.length + 4);
  out.set(payload);
  out.set(checksum, payload.length);
  return out;
}

function verifyChecksum(data: Uint8Array): boolean {
  const payload = data.slice(0, -4);
  const storedChecksum = data.slice(-4);
  const computed = sha256(sha256(payload)).slice(0, 4);
  return storedChecksum.every((b, i) => b === computed[i]);
}

// ---------------------------------------------------------------------------
// Version-byte normalization
// Rewrite the first 4 bytes of the decoded key to a target version and
// recompute the checksum so HDKey can parse any prefix as xpub/tpub.
// ---------------------------------------------------------------------------

function rewriteVersion(decoded: Uint8Array, targetVersion: number): Uint8Array {
  const payload = decoded.slice(0, -4); // strip old checksum (78 bytes)
  payload[0] = (targetVersion >>> 24) & 0xff;
  payload[1] = (targetVersion >>> 16) & 0xff;
  payload[2] = (targetVersion >>> 8) & 0xff;
  payload[3] = targetVersion & 0xff;
  return addChecksum(payload);
}

// ---------------------------------------------------------------------------
// Address generation
// ---------------------------------------------------------------------------

function hash160(pubkey: Uint8Array): Uint8Array {
  return ripemd160(sha256(pubkey));
}

function p2pkhAddress(pubkey: Uint8Array, network: Network): string {
  const version = network === 'mainnet' ? 0x00 : 0x6f;
  const h160 = hash160(pubkey);
  const versioned = new Uint8Array(1 + h160.length);
  versioned[0] = version;
  versioned.set(h160, 1);
  return b58Encode(addChecksum(versioned));
}

function p2shP2wpkhAddress(pubkey: Uint8Array, network: Network): string {
  const h160 = hash160(pubkey);
  // redeemScript = OP_0 <20-byte-hash>
  const redeemScript = new Uint8Array(22);
  redeemScript[0] = 0x00;
  redeemScript[1] = 0x14;
  redeemScript.set(h160, 2);
  const scriptHash = hash160(redeemScript);
  const version = network === 'mainnet' ? 0x05 : 0xc4;
  const versioned = new Uint8Array(1 + scriptHash.length);
  versioned[0] = version;
  versioned.set(scriptHash, 1);
  return b58Encode(addChecksum(versioned));
}

function p2shP2wshAddress(pubkey: Uint8Array, network: Network): string {
  // For Ypub (multisig): treat as P2SH using a single-key P2WSH witness script
  // (in practice multisig Ypub needs all cosigner keys; we generate a single-key approximation)
  const witnessScript = new Uint8Array(35);
  witnessScript[0] = 0x21; // push 33 bytes
  witnessScript.set(pubkey, 1);
  witnessScript[34] = 0xac; // OP_CHECKSIG
  const scriptHash = sha256(witnessScript);
  // P2WSH redeemScript = OP_0 <32-byte-hash>
  const redeemScript = new Uint8Array(34);
  redeemScript[0] = 0x00;
  redeemScript[1] = 0x20;
  redeemScript.set(scriptHash, 2);
  const p2shHash = hash160(redeemScript);
  const version = network === 'mainnet' ? 0x05 : 0xc4;
  const versioned = new Uint8Array(1 + p2shHash.length);
  versioned[0] = version;
  versioned.set(p2shHash, 1);
  return b58Encode(addChecksum(versioned));
}

// ── Bech32 ────────────────────────────────────────────────────────────────

const BECH32_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const BECH32_GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];

function bech32Polymod(values: number[]): number {
  let chk = 1;
  for (const v of values) {
    const top = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) {
      if ((top >> i) & 1) chk ^= BECH32_GENERATOR[i];
    }
  }
  return chk;
}

function bech32HrpExpand(hrp: string): number[] {
  const ret: number[] = [];
  for (const c of hrp) ret.push(c.charCodeAt(0) >> 5);
  ret.push(0);
  for (const c of hrp) ret.push(c.charCodeAt(0) & 31);
  return ret;
}

function bech32Checksum(hrp: string, data: number[]): number[] {
  const polymod = bech32Polymod([...bech32HrpExpand(hrp), ...data, 0, 0, 0, 0, 0, 0]) ^ 1;
  return Array.from({ length: 6 }, (_, i) => (polymod >> (5 * (5 - i))) & 31);
}

function convertBits(data: Uint8Array, fromBits: number, toBits: number): number[] {
  let acc = 0, bits = 0;
  const result: number[] = [];
  const maxv = (1 << toBits) - 1;
  for (const value of data) {
    acc = (acc << fromBits) | value;
    bits += fromBits;
    while (bits >= toBits) {
      bits -= toBits;
      result.push((acc >> bits) & maxv);
    }
  }
  if (bits > 0) result.push((acc << (toBits - bits)) & maxv);
  return result;
}

function bech32Encode(hrp: string, witnessVersion: number, program: Uint8Array): string {
  const data = [witnessVersion, ...convertBits(program, 8, 5)];
  const checksum = bech32Checksum(hrp, data);
  return hrp + '1' + [...data, ...checksum].map((d) => BECH32_CHARSET[d]).join('');
}

function p2wpkhAddress(pubkey: Uint8Array, network: Network): string {
  const hrp = network === 'mainnet' ? 'bc' : 'tb';
  return bech32Encode(hrp, 0, hash160(pubkey));
}

function p2wshAddress(pubkey: Uint8Array, network: Network): string {
  // Single-key P2WSH: witness script = <pubkey> OP_CHECKSIG
  const witnessScript = new Uint8Array(35);
  witnessScript[0] = 0x21;
  witnessScript.set(pubkey, 1);
  witnessScript[34] = 0xac;
  const scriptHash = sha256(witnessScript);
  const hrp = network === 'mainnet' ? 'bc' : 'tb';
  return bech32Encode(hrp, 0, scriptHash);
}

function deriveAddress(pubkey: Uint8Array, addressType: AddressType, network: Network): string {
  switch (addressType) {
    case 'P2PKH':       return p2pkhAddress(pubkey, network);
    case 'P2SH-P2WPKH': return p2shP2wpkhAddress(pubkey, network);
    case 'P2WPKH':      return p2wpkhAddress(pubkey, network);
    case 'P2SH-P2WSH':  return p2shP2wshAddress(pubkey, network);
    case 'P2WSH':       return p2wshAddress(pubkey, network);
  }
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

/**
 * Returns the prefix entry for the given key string, or throws a descriptive
 * error if the key is unrecognised, has a bad checksum, or the wrong length.
 */
function detectPrefix(key: string): { entry: PrefixEntry; decoded: Uint8Array } {
  const entry = PREFIX_TABLE.find((e) => key.startsWith(e.prefix));
  if (!entry) {
    const known = PREFIX_TABLE.map((e) => e.prefix).join(', ');
    throw new Error(
      `Unrecognised extended key prefix. Supported prefixes: ${known}.`,
    );
  }

  let decoded: Uint8Array;
  try {
    decoded = b58Decode(key);
  } catch {
    throw new Error('Extended key contains invalid base58 characters.');
  }

  // BIP32 serialisation is always 82 bytes (78 payload + 4 checksum)
  if (decoded.length !== 82) {
    throw new Error(
      `Extended key has invalid length (${decoded.length} bytes, expected 82).`,
    );
  }

  if (!verifyChecksum(decoded)) {
    throw new Error('Extended key checksum is invalid. Please verify the key is copied correctly.');
  }

  // Confirm version bytes match the detected prefix
  const version =
    (decoded[0] << 24) | (decoded[1] << 16) | (decoded[2] << 8) | decoded[3];
  if ((version >>> 0) !== (entry.version >>> 0)) {
    throw new Error(
      `Key prefix "${entry.prefix}" does not match its version bytes. The key may be corrupted.`,
    );
  }

  return { entry, decoded };
}

// ---------------------------------------------------------------------------
// Core factory
// ---------------------------------------------------------------------------

/**
 * Parse any supported extended public key and return a unified interface.
 *
 * @example
 * const info = parseExtendedKey('zpub6...');
 * const addr  = info.getAddress(0);          // bc1q...
 * const type  = info.getAddressType();       // 'P2WPKH'
 */
export function parseExtendedKey(key: string): ExtendedKeyInfo {
  const { entry, decoded } = detectPrefix(key.trim());

  // Always normalise to xpub version (0x0488b21e) — the only version @scure/bip32
  // accepts by default. Network/address-type encoding is handled entirely by our
  // own address-generation logic, so HDKey only needs to do raw key derivation.
  const targetVersion = XPUB_VERSION;
  const normalised = rewriteVersion(new Uint8Array(decoded), targetVersion);
  const hdKey = HDKey.fromExtendedKey(b58Encode(normalised));

  function getAddress(index: number, change = false): string {
    const chainIndex = change ? 1 : 0;
    const child = hdKey.deriveChild(chainIndex).deriveChild(index);
    if (!child.publicKey) throw new Error(`Failed to derive public key at index ${index}.`);
    return deriveAddress(child.publicKey, entry.addressType, entry.network);
  }

  function getAddressType(): AddressType {
    return entry.addressType;
  }

  return {
    originalKey: key,
    addressType: entry.addressType,
    network: entry.network,
    bip: entry.bip,
    derivationPath: entry.derivationPath,
    getAddress,
    getAddressType,
  };
}

// ---------------------------------------------------------------------------
// Backward-compatible helper (used by XpubAddressGenerator)
// ---------------------------------------------------------------------------

/**
 * Derive a range of addresses from any supported extended public key.
 * This preserves the original call signature used by the UI component.
 */
export function deriveAddresses(
  key: string,
  startIndex: number,
  count: number,
): DerivedAddress[] {
  const info = parseExtendedKey(key);
  return Array.from({ length: count }, (_, i) => ({
    index: startIndex + i,
    address: info.getAddress(startIndex + i),
  }));
}
