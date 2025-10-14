"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"
import Link from "next/link"

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
}

function buildUrl(baseUrl: string, page: number) {
  const separator = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${separator}page=${page}`
}

export function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  const renderPageNumbers = () => {
    const pages: (number | string)[] = []
    
    if (totalPages <= 7) {
      // Si 7 pages ou moins, afficher toutes les pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Toujours afficher la première page
      pages.push(1)
      
      if (currentPage <= 3) {
        // Si on est près du début
        pages.push(2, 3, 4, "...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Si on est près de la fin
        pages.push("...")
        pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        // Au milieu
        pages.push("...")
        pages.push(currentPage - 1, currentPage, currentPage + 1)
        pages.push("...")
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center space-x-2 py-6">
      {/* Bouton précédent */}
      <Button
        variant="outline"
        size="sm"
        asChild={currentPage > 1}
        disabled={currentPage <= 1}
      >
        {currentPage > 1 ? (
          <Link href={buildUrl(baseUrl, currentPage - 1)}>
            <ChevronLeftIcon className="h-4 w-4" />
            Previous
          </Link>
        ) : (
          <>
            <ChevronLeftIcon className="h-4 w-4" />
            Previous
          </>
        )}
      </Button>

      {/* Numéros de pages */}
      {renderPageNumbers().map((page, index) => (
        <div key={index}>
          {page === "..." ? (
            <Button variant="ghost" size="sm" disabled>
              <MoreHorizontalIcon className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href={buildUrl(baseUrl, page as number)}>
                {page}
              </Link>
            </Button>
          )}
        </div>
      ))}

      {/* Bouton suivant */}
      <Button
        variant="outline"
        size="sm"
        asChild={currentPage < totalPages}
        disabled={currentPage >= totalPages}
      >
        {currentPage < totalPages ? (
          <Link href={buildUrl(baseUrl, currentPage + 1)}>
            Next
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        ) : (
          <>
            Next
            <ChevronRightIcon className="h-4 w-4" />
          </>
        )}
      </Button>
    </div>
  )
}
