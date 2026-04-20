'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { HalvingInfo } from '@/lib/services/halving-service';

interface HalvingCountdownProps {
  initialHalving: HalvingInfo;
}

interface CountdownUnits {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function secondsToUnits(totalSeconds: number): CountdownUnits {
  const s = Math.max(0, Math.floor(totalSeconds));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

export function HalvingCountdown({ initialHalving }: HalvingCountdownProps) {
  const t = useTranslations('home');
  const mountRef = useRef<number>(0);
  const initialSeconds = Math.floor(initialHalving.minutesRemaining * 60);
  const [units, setUnits] = useState<CountdownUnits>(secondsToUnits(initialSeconds));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    mountRef.current = Date.now();
    setMounted(true);

    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - mountRef.current) / 1000);
      setUnits(secondsToUnits(initialSeconds - elapsed));
    }, 1000);

    return () => clearInterval(id);
  }, [initialSeconds]);

  const unitLabels = [
    { key: 'days' as const, label: t('halvingDays') },
    { key: 'hours' as const, label: t('halvingHours') },
    { key: 'minutes' as const, label: t('halvingMinutes') },
    { key: 'seconds' as const, label: t('halvingSeconds') },
  ];

  const infoItems = [
    { label: t('halvingCurrentReward'), value: `${initialHalving.currentReward} ${t('halvingPerBlock')}` },
    { label: t('halvingNextBlock'), value: initialHalving.nextHalvingBlock.toLocaleString('en-US') },
    { label: t('halvingEstimatedDate'), value: initialHalving.estimatedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) },
  ];

  return (
    <section className="border-y border-border bg-card py-20">
      <div className="container flex flex-col items-center gap-10 text-center">
        <div className="flex flex-col items-center gap-3">
          <Badge variant="outline" className="border-primary/40 text-primary">
            BITCOIN HALVING
          </Badge>
          <h2 className="text-3xl font-bold">{t('halvingTitle')}</h2>
          <p className="max-w-xl text-muted-foreground">{t('halvingSubtitle')}</p>
        </div>

        {/* Countdown units */}
        <div className="flex items-center gap-2 sm:gap-4">
          {unitLabels.map(({ key, label }, i) => (
            <div key={key} className="flex items-center gap-2 sm:gap-4">
              <Card className="w-20 sm:w-28">
                <CardContent className="flex flex-col items-center gap-1 p-4">
                  <span
                    className={`font-mono text-4xl sm:text-5xl font-extrabold text-primary tabular-nums transition-opacity ${mounted ? 'opacity-100' : 'opacity-0'}`}
                  >
                    {String(units[key]).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {label}
                  </span>
                </CardContent>
              </Card>
              {i < unitLabels.length - 1 && (
                <span className="text-2xl font-bold text-primary/50">:</span>
              )}
            </div>
          ))}
        </div>

        {/* Info strip */}
        <div className="grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
          {infoItems.map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-1 rounded-xl border border-border bg-background p-4">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
              <span className="font-semibold text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
