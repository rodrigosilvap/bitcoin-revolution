import Link from 'next/link';
import Image from 'next/image';
import type { PostMeta } from '@/lib/blog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface BlogPostCardProps {
  post: PostMeta;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  const isExternal = post.image.startsWith('http');

  return (
    <Link href={`/blog/${post.slug}`} className="group">
      <Card className="h-full overflow-hidden transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
        {/* Image */}
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          {post.image ? (
            <Image
              src={post.image}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              {...(isExternal ? {} : {})}
              unoptimized={isExternal}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-4xl">₿</span>
            </div>
          )}
        </div>

        <CardContent className="flex flex-col gap-3 p-5">
          <Badge variant="outline" className="w-fit text-xs text-primary border-primary/40">
            {post.date}
          </Badge>
          <h3 className="text-lg font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
