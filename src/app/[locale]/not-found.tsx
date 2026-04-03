import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center py-32 text-center">
      <p className="mb-2 text-8xl font-bold text-primary">404</p>
      <h2 className="mb-2 text-2xl font-bold">Page not found</h2>
      <p className="mb-6 text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Button asChild>
        <Link href="/">Go home</Link>
      </Button>
    </div>
  );
}
