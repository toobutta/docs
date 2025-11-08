'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { X, Home, Building2, Download } from 'lucide-react'
import type { Property } from '@/types/property'

interface PropertyPanelProps {
  property: Property | null
  isOpen: boolean
  onClose: () => void
}

const conditionColors = {
  excellent: 'bg-green-500',
  good: 'bg-green-400',
  fair: 'bg-yellow-500',
  poor: 'bg-red-500',
}

export function PropertyPanel({ property, isOpen, onClose }: PropertyPanelProps) {
  if (!isOpen || !property) return null

  const Icon = property.property_type === 'commercial' ? Building2 : Home

  return (
    <div className="absolute right-0 top-0 z-20 h-full w-96 bg-background border-l shadow-lg overflow-y-auto">
      <div className="sticky top-0 z-10 bg-background border-b px-6 py-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">{property.address}</h2>
              <p className="text-sm text-muted-foreground">
                {property.city}, {property.state} {property.zip}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {property.roofiq && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">RoofIQ Analysis</CardTitle>
              <CardDescription>Roof condition and replacement cost</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Condition</span>
                <Badge
                  className={`${conditionColors[property.roofiq.condition]} text-white`}
                >
                  {property.roofiq.condition.charAt(0).toUpperCase() + property.roofiq.condition.slice(1)}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Age</span>
                <span className="font-medium">{property.roofiq.age_years} years</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Material</span>
                <span className="font-medium capitalize">{property.roofiq.material}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Area</span>
                <span className="font-medium">{property.roofiq.area_sqft.toLocaleString()} sq ft</span>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-1">Replacement Cost Estimate</p>
                <p className="text-lg font-semibold">
                  ${property.roofiq.cost_low.toLocaleString()} - ${property.roofiq.cost_high.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Confidence</span>
                <span>{property.roofiq.confidence}%</span>
              </div>
            </CardContent>
          </Card>
        )}

        {property.solarfit && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">SolarFit Analysis</CardTitle>
              <CardDescription>Solar potential and ROI estimate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Solar Score</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                      style={{ width: `${property.solarfit.score}%` }}
                    />
                  </div>
                  <span className="font-semibold">{property.solarfit.score}/100</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Annual Production</span>
                <span className="font-medium">{property.solarfit.annual_kwh_potential.toLocaleString()} kWh</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">System Size</span>
                <span className="font-medium">{property.solarfit.system_size_kw} kW</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Panel Count</span>
                <span className="font-medium">{property.solarfit.panel_count} panels</span>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-muted-foreground mb-1">Estimated Cost</p>
                <p className="text-lg font-semibold">${property.solarfit.estimated_cost.toLocaleString()}</p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Annual Savings</span>
                <span className="font-medium text-green-600">${property.solarfit.annual_savings.toLocaleString()}/yr</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">ROI Period</span>
                <span className="font-medium">{property.solarfit.roi_years.toFixed(1)} years</span>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Confidence</span>
                <span>{property.solarfit.confidence}%</span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2">
          <Button className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
    </div>
  )
}
