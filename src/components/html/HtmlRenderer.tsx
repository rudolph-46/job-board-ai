import { cn } from "@/lib/utils"

interface HtmlRendererProps {
  html: string
  className?: string
}

function decodeHtmlEntities(html: string): string {
  // Utiliser l'API native du navigateur pour décoder les entités HTML
  if (typeof window !== 'undefined') {
    const textarea = document.createElement('textarea')
    textarea.innerHTML = html
    return textarea.value
  }
  
  // Fallback pour le rendu côté serveur
  const htmlEntities: { [key: string]: string } = {
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
    '&apos;': "'",
  }
  
  let decodedHtml = html
  Object.entries(htmlEntities).forEach(([entity, char]) => {
    decodedHtml = decodedHtml.replace(new RegExp(entity, 'g'), char)
  })
  
  return decodedHtml
}

export function HtmlRenderer({ html, className }: HtmlRendererProps) {
  // Décoder les entités HTML si nécessaire
  const decodedHtml = decodeHtmlEntities(html)
  
  return (
    <div 
      className={cn(
        "prose prose-neutral max-w-none dark:prose-invert",
        // Neutraliser les couleurs forcées dans le HTML
        "[&_*]:!text-inherit [&_h1]:!text-foreground [&_h2]:!text-foreground [&_h3]:!text-foreground [&_h4]:!text-foreground [&_h5]:!text-foreground [&_h6]:!text-foreground [&_p]:!text-foreground [&_span]:!text-foreground [&_div]:!text-foreground",
        className
      )}
      dangerouslySetInnerHTML={{ __html: decodedHtml }}
    />
  )
}
