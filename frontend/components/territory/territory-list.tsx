'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MapPin, Trash2, Eye, EyeOff } from 'lucide-react'
import { useTerritories, useDeleteTerritory, useUpdateTerritory } from '@/lib/hooks/use-territories'
import { useToast } from '@/hooks/use-toast'

export function TerritoryList() {
  const { toast } = useToast()
  const { data, isLoading } = useTerritories({ limit: 100, active_only: true })
  const deleteMutation = useDeleteTerritory()
  const updateMutation = useUpdateTerritory()

  const handleDelete = async (territoryId: string, name: string) => {
    if (!confirm(`Delete territory "${name}"?`)) return

    try {
      await deleteMutation.mutateAsync(territoryId)
      toast({
        title: 'Territory deleted',
        description: 'The territory has been removed.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete territory.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <Card className="p-4">
        <Skeleton className="h-4 w-32 mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-3">
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </Card>
    )
  }

  if (!data || data.territories.length === 0) {
    return (
      <Card className="p-6 text-center">
        <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No territories yet</p>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="text-sm font-semibold mb-3">
        Territories ({data.territories.length})
      </div>

      <div className="space-y-2">
        {data.territories.map((territory) => (
          <div
            key={territory.id}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: territory.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{territory.name}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {territory.territory_type}
                  </Badge>
                  {territory.property_count > 0 && (
                    <span>{territory.property_count} properties</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => handleDelete(territory.id, territory.name)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
