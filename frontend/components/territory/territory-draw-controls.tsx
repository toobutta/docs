'use client'

import { useState } from 'react'
import { Circle, Pentagon, Square, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useCreateTerritory } from '@/lib/hooks/use-territories'
import type { TerritoryType } from '@/types/territory'

interface TerritoryDrawControlsProps {
  onDrawComplete: (territory: any) => void
}

export function TerritoryDrawControls({ onDrawComplete }: TerritoryDrawControlsProps) {
  const { toast } = useToast()
  const [drawMode, setDrawMode] = useState<TerritoryType | null>(null)
  const [territoryName, setTerritoryName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [drawnGeometry, setDrawnGeometry] = useState<GeoJSON.Polygon | null>(null)

  const createMutation = useCreateTerritory()

  const handleStartDrawing = (mode: TerritoryType) => {
    setDrawMode(mode)
    toast({
      title: `Draw ${mode} mode`,
      description: `Click on the map to draw a ${mode}. Click to finish.`,
    })
  }

  const handleSaveTerritory = async () => {
    if (!drawnGeometry || !territoryName) return

    try {
      await createMutation.mutateAsync({
        name: territoryName,
        territory_type: drawMode!,
        geometry: drawnGeometry,
        color: '#3B82F6',
      })

      toast({
        title: 'Territory saved',
        description: 'Your territory has been saved successfully.',
      })

      setShowSaveDialog(false)
      setTerritoryName('')
      setDrawnGeometry(null)
      setDrawMode(null)
      onDrawComplete(null)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save territory.',
        variant: 'destructive',
      })
    }
  }

  return (
    <>
      <Card className="p-4 space-y-2">
        <div className="text-sm font-semibold mb-2">Draw Territory</div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={drawMode === 'polygon' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStartDrawing('polygon')}
          >
            <Pentagon className="h-4 w-4 mr-1" />
            Polygon
          </Button>

          <Button
            variant={drawMode === 'circle' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStartDrawing('circle')}
          >
            <Circle className="h-4 w-4 mr-1" />
            Circle
          </Button>

          <Button
            variant={drawMode === 'rectangle' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStartDrawing('rectangle')}
          >
            <Square className="h-4 w-4 mr-1" />
            Rectangle
          </Button>
        </div>

        {drawMode && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Click on the map to draw your {drawMode}. Double-click or press Enter to finish.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDrawMode(null)}
              className="mt-2 w-full"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel Drawing
            </Button>
          </div>
        )}
      </Card>

      {showSaveDialog && (
        <Card className="p-4 space-y-3">
          <div className="text-sm font-semibold">Save Territory</div>

          <div className="space-y-2">
            <Label htmlFor="territory-name">Territory Name</Label>
            <Input
              id="territory-name"
              placeholder="e.g., Downtown Service Area"
              value={territoryName}
              onChange={(e) => setTerritoryName(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowSaveDialog(false)
                setTerritoryName('')
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveTerritory}
              disabled={!territoryName || createMutation.isPending}
            >
              <Save className="h-4 w-4 mr-1" />
              {createMutation.isPending ? 'Saving...' : 'Save Territory'}
            </Button>
          </div>
        </Card>
      )}
    </>
  )
}
