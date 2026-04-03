interface BlogPostContentProps {
  html: string;
}

export function BlogPostContent({ html }: BlogPostContentProps) {
  return (
    <article
      className="prose prose-neutral max-w-none dark:prose-invert prose-headings:text-primary prose-a:text-primary prose-strong:text-foreground prose-img:rounded-lg"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
