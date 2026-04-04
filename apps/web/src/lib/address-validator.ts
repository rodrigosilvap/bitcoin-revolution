export interface AddressResult {
  address: string;
  valid: boolean;
  network: 'mainnet' | 'testnet' | null;
  type: string | null;
}

const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58Decode(str: string): Uint8Array | null {
  let bytes = [0];
  for (const char of str) {
    const value = BASE58_ALPHABET.indexOf(char);
    if (value === -1) return null;

    for (let i = 0; i < bytes.length; i++) bytes[i] *= 58;
    bytes[0] += value;

    let carry = 0;
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] += carry;
      carry = bytes[i] >> 8;
      bytes[i] &= 0xff;
    }
    while (carry) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }

  for (const char of str) {
    if (char === '1') bytes.push(0);
    else break;
  }

  return Uint8Array.from(bytes.reverse());
}

async function sha256(buffer: BufferSource): Promise<Uint8Array> {
  const hash = await crypto.subtle.digest('SHA-256', buffer);
  return new Uint8Array(hash);
}

async function validateBase58Check(address: string): Promise<boolean> {
  const decoded = base58Decode(address);
  if (!decoded || decoded.length < 4) return false;

  const payload = decoded.slice(0, -4);
  const checksum = decoded.slice(-4);

  const hash1 = await sha256(payload);
  const hash2 = await sha256(hash1.buffer as ArrayBuffer);

  return checksum.every((b, i) => b === hash2[i]);
}

const BECH32_ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

function bech32Polymod(values: number[]): number {
  const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (const v of values) {
    const top = chk >> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i++) {
      if ((top >> i) & 1) chk ^= GEN[i];
    }
  }
  return chk;
}

function bech32HrpExpand(hrp: string): number[] {
  return [...hrp]
    .map((c) => c.charCodeAt(0) >> 5)
    .concat([0])
    .concat([...hrp].map((c) => c.charCodeAt(0) & 31));
}

function validateBech32(address: string): boolean {
  address = address.toLowerCase();
  const sep = address.lastIndexOf('1');
  if (sep < 1) return false;

  const hrp = address.slice(0, sep);
  const data = address
    .slice(sep + 1)
    .split('')
    .map((c) => BECH32_ALPHABET.indexOf(c));
  if (data.includes(-1)) return false;

  const polymod = bech32Polymod(bech32HrpExpand(hrp).concat(data));
  return polymod === 1 || polymod === 0x2bc830a3;
}

export async function classifyBitcoinAddress(address: string): Promise<AddressResult> {
  const result: AddressResult = { address, valid: false, network: null, type: null };

  if (/^[13mn2]/.test(address)) {
    const isValid = await validateBase58Check(address);
    if (!isValid) return result;

    result.valid = true;
    if (address.startsWith('1')) {
      result.type = 'P2PKH';
      result.network = 'mainnet';
    } else if (address.startsWith('3')) {
      result.type = 'P2SH / Wrapped SegWit';
      result.network = 'mainnet';
    } else if (address.startsWith('m') || address.startsWith('n')) {
      result.type = 'P2PKH';
      result.network = 'testnet';
    } else if (address.startsWith('2')) {
      result.type = 'P2SH';
      result.network = 'testnet';
    }
    return result;
  }

  if (/^(bc1|tb1)/i.test(address)) {
    const isValid = validateBech32(address);
    if (!isValid) return result;

    result.valid = true;
    result.network = address.toLowerCase().startsWith('bc1') ? 'mainnet' : 'testnet';

    if (address.startsWith('bc1p') || address.startsWith('tb1p')) {
      result.type = 'P2TR (Taproot)';
    } else {
      result.type = address.length < 62 ? 'P2WPKH' : 'P2WSH';
    }
    return result;
  }

  return result;
}
