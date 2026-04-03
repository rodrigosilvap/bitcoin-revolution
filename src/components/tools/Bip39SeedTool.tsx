'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Shield, Copy, RefreshCw } from 'lucide-react';

type WordCount = 12 | 24;

export function Bip39SeedTool() {
  const t = useTranslations('bip39Seed');
  const [wordCount, setWordCount] = useState<WordCount>(12);
  const [words, setWords] = useState<string[]>(Array(12).fill(''));
  const [wordlist, setWordlist] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [suggestions, setSuggestions] = useState<{ index: number; list: string[] } | null>(null);

  // Load wordlist lazily
  useEffect(() => {
    import('@/data/bip39-wordlist.json')
      .then((m) => setWordlist(m.default as string[]))
      .catch(() => {});
  }, []);

  function generate() {
    if (wordlist.length === 0) return;
    const arr = new Uint32Array(wordCount);
    crypto.getRandomValues(arr);
    setWords(Array.from(arr).map((n) => wordlist[n % wordlist.length]));
    setSuggestions(null);
  }

  function changeWordCount(n: WordCount) {
    setWordCount(n);
    setWords(Array(n).fill(''));
    setSuggestions(null);
  }

  function clear() {
    setWords(Array(wordCount).fill(''));
    setSuggestions(null);
  }

  function copyPhrase() {
    const phrase = words.filter(Boolean).join(' ');
    navigator.clipboard.writeText(phrase).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleWordChange(index: number, value: string) {
    const next = [...words];
    next[index] = value;
    setWords(next);
    if (value.length >= 2) {
      const matches = wordlist.filter((w) => w.startsWith(value.toLowerCase())).slice(0, 6);
      setSuggestions({ index, list: matches });
    } else {
      setSuggestions(null);
    }
  }

  function selectSuggestion(index: number, word: string) {
    const next = [...words];
    next[index] = word;
    setWords(next);
    setSuggestions(null);
  }

  const phrase = words.filter(Boolean).join(' ');
  const allFilled = words.every(Boolean);
  const allValid = words.every((w) => !w || wordlist.includes(w));

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('generatorTitle')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('generatorSubtitle')}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Word count selector */}
          <div className="flex gap-2">
            {([12, 24] as WordCount[]).map((n) => (
              <Button
                key={n}
                variant={wordCount === n ? 'default' : 'outline'}
                size="sm"
                onClick={() => changeWordCount(n)}
              >
                {n === 12 ? t('words12') : t('words24')}
              </Button>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button onClick={generate} disabled={wordlist.length === 0}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('generateRandom')}
            </Button>
            <Button variant="outline" onClick={clear}>{t('clearAll')}</Button>
          </div>

          {/* Word grid */}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {words.map((word, i) => (
              <div key={i} className="relative">
                <div className="absolute left-1.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {i + 1}
                </div>
                <Input
                  value={word}
                  onChange={(e) => handleWordChange(i, e.target.value)}
                  className={`pl-6 text-sm font-mono ${
                    word && !wordlist.includes(word) ? 'border-destructive' : ''
                  }`}
                  placeholder="word"
                />
                {suggestions?.index === i && suggestions.list.length > 0 && (
                  <div className="absolute top-full left-0 z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
                    {suggestions.list.map((s) => (
                      <button
                        key={s}
                        className="block w-full px-3 py-1.5 text-left text-sm hover:bg-accent"
                        onClick={() => selectSuggestion(i, s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Validation status */}
          {!allValid && (
            <p className="text-sm text-destructive">Some words are not in the BIP39 wordlist.</p>
          )}

          {/* Seed phrase display */}
          {allFilled && allValid && (
            <div className="rounded-md border border-border bg-muted p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-mono text-sm break-all leading-relaxed">{phrase}</p>
                <Button variant="ghost" size="icon" onClick={copyPhrase} className="shrink-0">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {copied && <p className="mt-1 text-xs text-green-400">Copied!</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security warning */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertTitle>{t('securityWarning')}</AlertTitle>
        <AlertDescription>
          <p className="mt-1 text-sm">{t('securityWarningDesc')}</p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
            {[1, 2, 3, 4].map((n) => (
              <li key={n}>{t(`securityTip${n}` as 'securityTip1')}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
