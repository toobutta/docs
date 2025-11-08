'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Sparkles } from 'lucide-react'
import type { PropertyFilters } from '@/types/property'

interface AISearchBarProps {
  onSearch?: (query: string, filters: PropertyFilters) => void
  placeholder?: string
  className?: string
}

export function AISearchBar({ onSearch, placeholder, className }: AISearchBarProps) {
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const parseQuery = (query: string): PropertyFilters => {
    const filters: PropertyFilters = {}

    const lowerQuery = query.toLowerCase()

    if (lowerQuery.includes('solar')) {
      filters.solar_score_min = 70
    }

    if (lowerQuery.includes('roof') || lowerQuery.includes('aging') || lowerQuery.includes('old')) {
      filters.roof_age_years_min = 15
    }

    if (lowerQuery.includes('good condition')) {
      filters.roof_condition = ['excellent', 'good']
    }

    if (lowerQuery.includes('poor') || lowerQuery.includes('bad')) {
      filters.roof_condition = ['fair', 'poor']
    }

    if (lowerQuery.includes('commercial')) {
      filters.property_type = 'commercial'
    }

    if (lowerQuery.includes('residential') || lowerQuery.includes('home')) {
      filters.property_type = 'residential'
    }

    return filters
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)

    setTimeout(() => {
      const filters = parseQuery(query)
      onSearch?.(query, filters)
      setIsLoading(false)
    }, 500)
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative">
        <Sparkles className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder || "Try: 'Atlanta homes with solar potential'"}
          className="pl-10 pr-24"
        />
        <Button
          type="submit"
          disabled={isLoading || !query.trim()}
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2"
        >
          {isLoading ? (
            'Searching...'
          ) : (
            <>
              <Search className="mr-1.5 h-3.5 w-3.5" />
              Search
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
