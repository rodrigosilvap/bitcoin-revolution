import { HDKey } from '@scure/bip32';
import { sha256 } from '@noble/hashes/sha2.js';
import { ripemd160 } from '@noble/hashes/legacy.js';

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58Encode(bytes: Uint8Array): string {
  // Count leading zeros
  let leadingZeros = 0;
  for (const byte of bytes) {
    if (byte === 0) leadingZeros++;
    else break;
  }
  // Convert bytes to base58 using integer arithmetic on a digit array
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
  return '1'.repeat(leadingZeros) + digits.reverse().map((d) => BASE58_ALPHABET[d]).join('');
}

function hash160(pubkey: Uint8Array): Uint8Array {
  return ripemd160(sha256(pubkey));
}

function pubkeyToP2PKHAddress(pubkey: Uint8Array): string {
  const h160 = hash160(pubkey);
  // version byte 0x00 for mainnet P2PKH
  const versioned = new Uint8Array(1 + h160.length);
  versioned[0] = 0x00;
  versioned.set(h160, 1);
  // checksum: first 4 bytes of double-SHA256
  const checksum = sha256(sha256(versioned)).slice(0, 4);
  const payload = new Uint8Array(versioned.length + 4);
  payload.set(versioned);
  payload.set(checksum, versioned.length);
  return base58Encode(payload);
}

export interface DerivedAddress {
  index: number;
  address: string;
}

export function deriveAddresses(xpub: string, startIndex: number, count: number): DerivedAddress[] {
  const root = HDKey.fromExtendedKey(xpub);
  const external = root.deriveChild(0); // m/0 — external chain
  const results: DerivedAddress[] = [];
  for (let i = startIndex; i < startIndex + count; i++) {
    const child = external.deriveChild(i);
    if (!child.publicKey) throw new Error('Failed to derive public key');
    results.push({ index: i, address: pubkeyToP2PKHAddress(child.publicKey) });
  }
  return results;
}
