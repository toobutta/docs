'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { compareProperties } from '@/lib/api/comparison'
import { ArrowLeftRight, TrendingUp } from 'lucide-react'

export default function PropertyComparisonPage() {
  // Demo: compare first 3 properties
  const [propertyIds] = useState<string[]>([])

  const { data, isLoading } = useQuery({
    queryKey: ['property-comparison', propertyIds],
    queryFn: () => compareProperties(propertyIds),
    enabled: propertyIds.length >= 2,
  })

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Property Comparison</h1>
        <p className="text-muted-foreground mt-1">
          Compare properties side by side to identify the best opportunities
        </p>
      </div>

      {propertyIds.length < 2 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full bg-muted p-4">
              <ArrowLeftRight className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Select properties to compare</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select 2-5 properties from the map to compare them side by side
              </p>
            </div>
          </div>
        </Card>
      ) : isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Properties Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.properties.map((property) => (
              <Card key={property.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{property.address}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground">Property Type</div>
                    <Badge>{property.property_type}</Badge>
                  </div>

                  {property.roofiq && (
                    <div>
                      <div className="text-sm text-muted-foreground">RoofIQ Score</div>
                      <div className="text-2xl font-bold">{property.roofiq.score}/100</div>
                    </div>
                  )}

                  {property.solarfit && (
                    <div>
                      <div className="text-sm text-muted-foreground">Solar Score</div>
                      <div className="text-2xl font-bold">
                        {property.solarfit.solar_score}/100
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison Matrix */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Score Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-semibold mb-2">Roof Scores</div>
                  <div className="flex gap-2">
                    {data.comparison_matrix.roof_scores.map((item, idx) => (
                      <div key={idx} className="flex-1 text-center p-3 bg-muted rounded">
                        <div className="text-2xl font-bold">
                          {item.score ?? 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold mb-2">Solar Scores</div>
                  <div className="flex gap-2">
                    {data.comparison_matrix.solar_scores.map((item, idx) => (
                      <div key={idx} className="flex-1 text-center p-3 bg-muted rounded">
                        <div className="text-2xl font-bold">
                          {item.score ?? 'N/A'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}
