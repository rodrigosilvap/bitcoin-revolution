'use client';

import { Menu } from 'lucide-react';
import { Link } from '@/navigation';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface Props {
  logoLabel: string;
  toggleLabel: string;
  links: { href: string; label: string }[];
}

export function MobileMenu({ logoLabel, toggleLabel, links }: Props) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label={toggleLabel}>
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>{logoLabel}</SheetTitle>
        </SheetHeader>
        <nav className="mt-8 flex flex-col gap-4">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-lg font-medium text-foreground hover:text-primary"
            >
              {label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
