'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { AudienceBuilder } from "@/components/audience/audience-builder"

export default function AudiencesPage() {
  const [isBuilderOpen, setIsBuilderOpen] = useState(false)

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Audiences</h1>
          <p className="text-muted-foreground">
            Manage and export your property audiences
          </p>
        </div>
        <Button onClick={() => setIsBuilderOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Audience
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Solar Prospects - Atlanta</CardTitle>
            <CardDescription>523 properties</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              South-facing roofs with high solar potential in Atlanta metro area
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Roof Replacement Leads</CardTitle>
            <CardDescription>847 properties</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Properties with aging roofs in fair to poor condition
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New Construction</CardTitle>
            <CardDescription>234 properties</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Recent building permits and construction activity
            </p>
          </CardContent>
        </Card>
      </div>

      <AudienceBuilder
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        onComplete={(audience) => {
          console.log('Audience created:', audience)
        }}
      />
    </div>
  )
}
