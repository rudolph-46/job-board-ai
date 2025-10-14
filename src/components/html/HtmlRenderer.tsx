import { cn } from "@/lib/utils"

interface HtmlRendererProps {
  html: string
  className?: string
}

export function HtmlRenderer({ html, className }: HtmlRendererProps) {
  return (
    <div 
      className={cn(
        "prose prose-neutral max-w-none dark:prose-invert",
        // Neutraliser les couleurs forcées dans le HTML
        "[&_*]:!text-inherit [&_h1]:!text-foreground [&_h2]:!text-foreground [&_h3]:!text-foreground [&_h4]:!text-foreground [&_h5]:!text-foreground [&_h6]:!text-foreground [&_p]:!text-foreground [&_span]:!text-foreground [&_div]:!text-foreground",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
