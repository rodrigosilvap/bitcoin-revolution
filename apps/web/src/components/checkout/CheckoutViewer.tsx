'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import {
  Copy, Check, Volume2, VolumeX, Wallet, ExternalLink, Bitcoin,
  AlertCircle,
} from 'lucide-react';

// ─── BIP21 URI builder ────────────────────────────────────────────────────────

function buildUri(address: string, amount: string, label: string, message: string): string {
  const params: string[] = [];
  const num = parseFloat(amount);
  if (num > 0) params.push(`amount=${num.toFixed(8).replace(/\.?0+$/, '')}`);
  if (label.trim())   params.push(`label=${encodeURIComponent(label.trim())}`);
  if (message.trim()) params.push(`message=${encodeURIComponent(message.trim())}`);
  return `bitcoin:${address}${params.length ? '?' + params.join('&') : ''}`;
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyBtn({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      title={label}
      className="inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-sm transition hover:bg-white/20 hover:text-white active:scale-95"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copied!' : label}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CheckoutViewer() {
  const searchParams = useSearchParams();

  const address = searchParams.get('address') ?? '';
  const amount  = searchParams.get('amount')  ?? '';
  const label   = searchParams.get('label')   ?? '';
  const message = searchParams.get('message') ?? '';

  const [voiceSupported, setVoiceSupported] = useState(false);
  const [speaking, setSpeaking]             = useState(false);

  const bip21 = address ? buildUri(address, amount, label, message) : '';
  const amountNum = parseFloat(amount);
  const hasBtcAmount = !isNaN(amountNum) && amountNum > 0;
  const shortAddr = address.length > 20 ? `${address.slice(0, 10)}…${address.slice(-10)}` : address;

  useEffect(() => {
    setVoiceSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }, []);

  const speak = useCallback(() => {
    if (!voiceSupported) return;
    window.speechSynthesis.cancel();
    const parts: string[] = ['You have a Bitcoin payment request.'];
    if (label)      parts.push(`Pay to: ${label}.`);
    if (hasBtcAmount) parts.push(`Amount: ${amountNum.toFixed(8).replace(/\.?0+$/, '')} Bitcoin.`);
    if (message)    parts.push(`For: ${message}.`);
    parts.push(`Address: ${address.slice(0, 6)} … ${address.slice(-6)}. Scan the QR code or copy the address below.`);
    const utt = new SpeechSynthesisUtterance(parts.join(' '));
    utt.rate  = 0.92;
    utt.pitch = 1;
    utt.onstart = () => setSpeaking(true);
    utt.onend   = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  }, [voiceSupported, address, amount, label, message, amountNum, hasBtcAmount]);

  function stopSpeaking() {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (!address) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-orange-950 p-6">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-10 text-center backdrop-blur-sm">
          <AlertCircle className="h-12 w-12 text-orange-400/70" />
          <h1 className="text-xl font-bold text-white">Invalid Payment Link</h1>
          <p className="max-w-xs text-sm text-white/60">
            This payment link is missing a Bitcoin address. Ask the sender to regenerate the link.
          </p>
          <a
            href="/"
            className="mt-2 text-sm text-orange-400 hover:underline"
          >
            ← Back to Bitcoin Revolution
          </a>
        </div>
      </div>
    );
  }

  // ── Main checkout view ──────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-neutral-950 via-neutral-900 to-orange-950 px-4 py-10">

      {/* Brand header */}
      <div className="mb-8 flex items-center gap-2 text-white/50">
        <Bitcoin className="h-5 w-5 text-orange-400" />
        <span className="text-sm font-semibold tracking-wide uppercase">Bitcoin Revolution</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">

        {/* Recipient + purpose */}
        <div className="mb-6 text-center">
          <p className="mb-1 text-xs font-medium uppercase tracking-widest text-orange-400/80">
            Payment Request
          </p>
          {label && (
            <h1 className="text-2xl font-bold text-white">{label}</h1>
          )}
          {message && (
            <p className="mt-1 text-sm text-white/60">{message}</p>
          )}
        </div>

        {/* Amount */}
        {hasBtcAmount && (
          <div className="mb-6 rounded-2xl border border-orange-400/20 bg-orange-400/10 p-4 text-center">
            <p className="text-3xl font-bold tracking-tight text-white">
              ₿ {amountNum.toFixed(8).replace(/\.?0+$/, '')}
            </p>
            <p className="mt-1 text-sm text-white/50">
              {Math.round(amountNum * 1e8).toLocaleString('en-US')} satoshis
            </p>
          </div>
        )}

        {/* QR Code */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-2xl bg-white p-4 shadow-lg shadow-black/30">
            <QRCodeSVG
              value={bip21}
              size={240}
              bgColor="#ffffff"
              fgColor="#0a0a0a"
              level="M"
            />
          </div>
        </div>

        {/* Address */}
        <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="mb-1.5 text-xs font-medium text-white/40 uppercase tracking-wider">Bitcoin Address</p>
          <p className="break-all font-mono text-xs text-white/80">{address}</p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap justify-center gap-2">
          <CopyBtn text={address} label="Copy Address" />
          <CopyBtn text={bip21}   label="Copy URI" />
          <a
            href={bip21}
            className="inline-flex items-center gap-1.5 rounded-md border border-orange-400/40 bg-orange-400/15 px-3 py-1.5 text-xs font-medium text-orange-300 transition hover:bg-orange-400/25 active:scale-95"
          >
            <Wallet className="h-3.5 w-3.5" />
            Open in Wallet
          </a>
          {voiceSupported && (
            <button
              onClick={speaking ? stopSpeaking : speak}
              title={speaking ? 'Stop reading' : 'Read aloud'}
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition active:scale-95 ${
                speaking
                  ? 'border-blue-400/40 bg-blue-400/15 text-blue-300 hover:bg-blue-400/25'
                  : 'border-white/20 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
              }`}
            >
              {speaking
                ? <><VolumeX className="h-3.5 w-3.5" />Stop</>
                : <><Volume2 className="h-3.5 w-3.5" />Read Aloud</>
              }
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center gap-2 text-xs text-white/30">
        <span>Created with</span>
        <a href="/" className="inline-flex items-center gap-1 text-orange-400/60 hover:text-orange-400 transition">
          Bitcoin Revolution <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
