'use client'

import { useState } from 'react'
import { Plus, Search, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { SavedSearchCard } from '@/components/saved-search/saved-search-card'
import { SavedSearchDialog } from '@/components/saved-search/saved-search-dialog'
import { useSavedSearches } from '@/lib/hooks/use-saved-searches'
import { useMapStore } from '@/lib/stores/map-store'
import type { SavedSearch } from '@/types/saved-search'

export default function SavedSearchesPage() {
  const { filters } = useMapStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSearch, setEditingSearch] = useState<SavedSearch | undefined>()
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading, error } = useSavedSearches({
    limit: 100,
    active_only: true,
  })

  const handleCreateNew = () => {
    setEditingSearch(undefined)
    setDialogOpen(true)
  }

  const handleEdit = (search: SavedSearch) => {
    setEditingSearch(search)
    setDialogOpen(true)
  }

  const handleView = (search: SavedSearch) => {
    // TODO: Navigate to map with search filters applied
    console.log('View search:', search)
  }

  const filteredSearches = data?.searches.filter((search) =>
    search.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Saved Searches</h1>
              <p className="text-muted-foreground mt-1">
                Manage your saved searches and email alerts
              </p>
            </div>
            <Button onClick={handleCreateNew}>
              <Plus className="mr-2 h-4 w-4" />
              New Saved Search
            </Button>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search saved searches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="container py-6">
          {isLoading && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-6">
                  <Skeleton className="h-6 w-2/3 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </Card>
              ))}
            </div>
          )}

          {error && (
            <Card className="p-6 border-destructive">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <div>
                  <h3 className="font-semibold">Failed to load saved searches</h3>
                  <p className="text-sm text-muted-foreground">
                    Please try again later or contact support if the problem persists.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {!isLoading && !error && (
            <>
              {filteredSearches && filteredSearches.length > 0 ? (
                <>
                  <div className="mb-4 text-sm text-muted-foreground">
                    {filteredSearches.length} saved{' '}
                    {filteredSearches.length === 1 ? 'search' : 'searches'}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredSearches.map((search) => (
                      <SavedSearchCard
                        key={search.id}
                        search={search}
                        onEdit={handleEdit}
                        onView={handleView}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <Card className="p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="rounded-full bg-muted p-4">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">
                        {searchQuery
                          ? 'No searches found'
                          : 'No saved searches yet'}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {searchQuery
                          ? 'Try a different search term'
                          : 'Create your first saved search to get started with email alerts'}
                      </p>
                      {!searchQuery && (
                        <Button onClick={handleCreateNew}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Saved Search
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <SavedSearchDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        currentFilters={filters}
        editSearch={editingSearch}
      />
    </div>
  )
}
