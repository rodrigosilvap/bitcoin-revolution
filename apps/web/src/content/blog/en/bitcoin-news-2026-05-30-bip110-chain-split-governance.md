---
title: "BIP-110: The Proposal That Could Split Bitcoin Over Ordinals and Block Space"
date: "2026-05-30"
excerpt: "A controversial Bitcoin Improvement Proposal — BIP-110 — aims to block Ordinals, Runes, and arbitrary data from permanently occupying Bitcoin's block space. If it activates, upgraded nodes would reject blocks that include today's on-chain data inscriptions. Bitcoin veterans Adam Back and Jameson Lopp have called it 'reckless.' Here is what the debate is really about."
image: "/images/blog/bitcoin-bip110-governance-2026-05-30.jpg"
---

## Introduction

Bitcoin's most contentious technical debate of 2026 is not about price, ETFs, or sovereign adoption. It is about what Bitcoin's block space is fundamentally *for*.

**BIP-110** — a Bitcoin Improvement Proposal targeting an **August 2026 activation window** — would hard-limit the size of transaction output scripts, effectively making it impossible to inscribe arbitrary data (Ordinals, Runes, Stamps, images, text) onto the Bitcoin blockchain. If adopted cleanly, the change would reduce block size bloat and keep transaction fees lower for standard financial transfers.

If adopted poorly, it risks something Bitcoin has avoided for its entire 17-year history: a **chain split** — where two incompatible versions of Bitcoin run simultaneously, dividing miners, node operators, exchanges, and holders into competing factions.

Some of the most respected technical voices in Bitcoin are warning that BIP-110 is on exactly that path.

![Bitcoin code on a screen representing the BIP-110 governance debate and potential chain split risk](/images/blog/bitcoin-bip110-governance-2026-05-30.jpg)

---

## What BIP-110 Actually Proposes

The proposal has a straightforward technical goal. It would:

* **Cap most transaction output scriptPubKeys at 34 bytes** — enough for a standard P2PKH, P2SH, or P2WPKH address, but not for the multi-hundred-byte scripts used by Ordinals and Rune inscriptions
* **Allow OP_RETURN outputs up to 83 bytes** — preserving a controlled channel for timestamping and light data anchoring without enabling large inscriptions
* **Activate using bit 4 signaling**, requiring **55% miner support** across 2,016-block difficulty periods — a lower threshold than the 95% historically used by soft forks like Taproot

The stated goal is to defend Bitcoin block space from what proponents call "spam": Ordinal inscriptions of images and text files, Rune token issuances, and Stamp transactions that embed data into unspendable outputs. These use cases have at times pushed transaction fees above $30 per transaction, pricing out standard BTC transfers.

---

## Why This Goes Beyond a Technical Fix

The problem is not the idea — it is the mechanism.

### Relay Policy vs. Consensus Rules

Bitcoin has two distinct layers of rules:

* **Relay policy** is what nodes *voluntarily* agree to propagate to each other. It is informal, configurable, and does not determine what is valid. Bitcoin Knots, for example, already has relay policies that filter Ordinals inscriptions — but blocks containing inscriptions are still valid and accepted by the entire network.
* **Consensus rules** are what nodes use to decide whether a block is *valid at all*. These rules are the bedrock of Bitcoin. Breaking them is the definition of a fork.

BIP-110 moves the fight from the relay layer to the consensus layer. Under BIP-110, an upgraded node would **reject as invalid** any block containing scripts that exceed the new byte limits. A non-upgraded node would accept the same block as valid.

That gap — upgraded nodes rejecting blocks that unupgraded nodes accept — is precisely the technical condition for a chain split.

### The Miner Signaling Problem

For a soft fork to activate cleanly, miners need to signal support. The classic model (used for Taproot in 2021) required 90%+ miner support over a 2,016-block signaling period, giving the entire ecosystem time to upgrade before any new rules took effect.

BIP-110 uses a **55% threshold** — presumably because the authors expect Ordinals-friendly miners to block higher thresholds. But 55% is not a safe floor for chain split avoidance. If 45% of hash rate is running software that does not enforce the new output limits, those miners will continue producing blocks with inscriptions that the 55% considers invalid.

The result: two competing chains, each with real hash rate, real economic activity, and competing claims to the "Bitcoin" name. That scenario is not theoretical — it is approximately what happened in August 2017 when Bitcoin Cash forked from Bitcoin.

---

## What the Critics Are Saying

Two of Bitcoin's most technically credible voices have come out forcefully against the proposal.

### Adam Back (Blockstream CEO)

Adam Back — the inventor of Hashcash, cited in the original Bitcoin whitepaper as the proof-of-work reference — called BIP-110 **"reckless."**

His specific technical objection: the restrictions are **bypassable**. Ordinals inscriptions can be restructured to fit within the byte limits while still encoding the same data, just less efficiently. The proposal, in Back's view, succeeds only at harming legitimate protocol development (multi-sig schemes, Tapscript extensions, Lightning channel types) while leaving determined data inscribers with straightforward workarounds.

> *"The innovation damage is not bypassable. The data-inscription problem is."*

Back's deeper concern is philosophical: Bitcoin's strength has historically come from **neutral, predictable rules** and backward compatibility. A change that makes previously valid transaction types invalid — even non-standard ones — sets a precedent that whoever controls miner signaling controls what Bitcoin allows. That is a different Bitcoin than the one that has operated since 2009.

### Jameson Lopp (Casa CTO)

Jameson Lopp — one of the most respected security and protocol engineers in the Bitcoin ecosystem — described BIP-110 as **"reckless and doomed to fail."**

Lopp's warning focuses on coordination. Clean protocol upgrades require near-unanimous buy-in from miners, node operators, exchanges, and wallets before activation. BIP-110's 55% threshold tries to force adoption over the objections of a large technical minority. In Lopp's assessment, the cure is worse than the disease:

> *"A poorly coordinated soft fork doesn't just fail — it fails while doing damage. Every exchange that has to decide which chain to follow, every wallet that has to choose which rules to implement, every user who is uncertain whether their transaction is valid — that uncertainty is the cost."*

---

## The Philosophical Split Behind the Technical One

The BIP-110 debate is ultimately about a question that has been simmering in Bitcoin since 2022: **what is Bitcoin's block space for?**

Two camps have formed:

**The "Bitcoin is money" camp** argues that block space is a finite resource that should be reserved for financial transactions — peer-to-peer value transfers, Lightning channel opens and closes, multisignature custody setups. Inscriptions are a side effect of a technical loophole (the SegWit witness discount) that Satoshi never intended and that drives up fees for everyone else.

**The "Bitcoin is neutral infrastructure" camp** argues that Bitcoin's rules have never discriminated between transaction types based on their purpose. A valid transaction is a valid transaction. If someone wants to pay the network fee to inscribe a JPEG, that is their right. The market — through fees — sorts out which transactions are economically worthwhile. Changing the rules to prevent it is censorship at the protocol level.

BIP-110 is the "money camp" attempting to encode its preference into consensus rules. The "infrastructure camp" is resisting precisely because they believe the change sets a precedent that future majorities could use to restrict other currently-valid transaction types.

---

## What a Chain Split Would Actually Mean

If BIP-110 activates with insufficient hash rate coordination — a scenario that looks plausible given current miner signaling data — the practical consequences are severe:

* **Exchanges face a Sophie's choice.** Binance, Coinbase, Kraken, and every other major trading venue would have to decide which chain to call "Bitcoin" and which to list as something else. Neither choice is clean.
* **Wallet software splits.** Hardware wallets, mobile wallets, and desktop clients would need emergency software updates to handle the fork — with no guarantee that all wallet providers respond uniformly.
* **Ordinal holders face uncertainty.** Millions of dollars in Ordinals, Runes, and Stamps inscribed before the fork would only be "valid" on the non-BIP-110 chain. Their status on the BIP-110 chain would be undefined.
* **New Bitcoin's price discovery becomes chaotic.** Both chains would trade against USDT and each other until the market determined a winner. The process could take weeks and would attract enormous short-side speculation.

Every historical Bitcoin fork has eventually resolved — but "eventually" has meant months of market disruption, exchange confusion, and reputational damage to the broader ecosystem.

---

## How Bitcoin Protocol Changes Are Supposed to Work

For context: Bitcoin has navigated contentious protocol upgrades before, and the community has developed hard-won principles from those experiences.

* **Segregated Witness (2017):** Took years of debate, a threatened hard fork (Bitcoin Cash), and a last-minute agreement among miners, developers, and businesses before activating at 95%+ signaling. The result was backward-compatible and the network emerged intact.
* **Taproot (2021):** A much less contentious upgrade that still required near-universal signaling and a two-year design review before activation.

The lesson from both is that successful Bitcoin upgrades require **overwhelming consensus before activation**, not simple majority rule. A 55% activation threshold is a departure from that model — and the people warning loudest about it are the ones who lived through the 2017 fork wars firsthand.

---

## Where Things Stand Now

As of late May 2026:

* **Node support** for BIP-110 has grown primarily through Bitcoin Knots, an alternative node implementation maintained by developer Luke Dashjr, who is also one of BIP-110's primary advocates
* **Miner signaling** remains far below the 55% threshold needed for activation in the August window
* **Opposition** from prominent developers — including Back and Lopp — has intensified over the past two weeks as the proposal has gained mainstream attention
* **No major exchange or wallet provider** has publicly committed to enforcing BIP-110's new rules

The August activation window is still possible in theory, but the current signaling trajectory makes clean activation by that date unlikely. What is less clear is what happens if the proposal's proponents press forward anyway.

---

## Conclusion

BIP-110 is a genuine attempt to solve a genuine problem. The data that Ordinals and Runes inscriptions put on Bitcoin's blockchain does consume block space that would otherwise carry financial transactions. Fees have spiked. The user experience of standard Bitcoin transfers has degraded.

But the mechanism matters as much as the goal. A Bitcoin soft fork that activates over the active opposition of a large technical minority, with a sub-60% miner threshold, in a governance environment where major exchanges and wallet providers have not committed to the new rules, is not a solution — it is a different problem.

The Bitcoin that has survived 17 years without a chain split has done so by setting an extremely high bar for consensus before changing the rules everyone has to play by. BIP-110's August window will test whether that bar is still the standard, or whether a motivated technical minority can now move the consensus layer with a simple majority.

The answer, and the hash rate signaling in the next sixty days, will tell us a great deal about what Bitcoin's governance model actually looks like in 2026.

Sources:
- [Bitcoin's BIP-110 Proposal Could Trigger a Chain Split, Warn Critics — Cointelegraph](https://cointelegraph.com/news/bitcoin-bip110-chain-split-ordinals-governance-2026)
- [Adam Back Calls BIP-110 'Reckless' as Miner Signaling Lags — The Block](https://www.theblock.co/post/bitcoin-bip110-adam-back-reckless-miner-signaling-2026)
- [Jameson Lopp: BIP-110 Is 'Reckless and Doomed to Fail' — Bitcoin Magazine](https://bitcoinmagazine.com/technical/jameson-lopp-bip110-reckless-doomed-to-fail-2026)
- [BIP-110: Restricting Output Script Sizes to Combat Data Inscriptions — GitHub Bitcoin BIPs](https://github.com/bitcoin/bips)
