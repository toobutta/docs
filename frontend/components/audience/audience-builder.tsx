'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { PropertyFilters } from '@/types/property'

interface AudienceBuilderProps {
  isOpen: boolean
  onClose: () => void
  onComplete?: (audience: { name: string; filters: PropertyFilters; count: number }) => void
}

export function AudienceBuilder({ isOpen, onClose, onComplete }: AudienceBuilderProps) {
  const [step, setStep] = useState(1)
  const [audienceName, setAudienceName] = useState('')
  const [filters, setFilters] = useState<PropertyFilters>({})

  const handleComplete = () => {
    onComplete?.({
      name: audienceName || 'Untitled Audience',
      filters,
      count: 523
    })
    onClose()
    setStep(1)
    setAudienceName('')
    setFilters({})
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onClose={onClose} className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Audience</DialogTitle>
          <DialogDescription>
            Build a custom audience to export leads
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Audience Name</label>
                <Input
                  value={audienceName}
                  onChange={(e) => setAudienceName(e.target.value)}
                  placeholder="e.g., Solar Prospects - Atlanta"
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Filters</label>
                <div className="mt-2 space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Property Type</label>
                    <select
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2"
                      onChange={(e) => setFilters({ ...filters, property_type: e.target.value as any })}
                    >
                      <option value="">All</option>
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Roof Condition</label>
                    <div className="mt-2 flex gap-2">
                      {['excellent', 'good', 'fair', 'poor'].map((condition) => (
                        <Badge
                          key={condition}
                          variant="outline"
                          className="cursor-pointer capitalize hover:bg-primary hover:text-primary-foreground"
                          onClick={() => {
                            const current = filters.roof_condition || []
                            const updated = current.includes(condition as any)
                              ? current.filter(c => c !== condition)
                              : [...current, condition as any]
                            setFilters({ ...filters, roof_condition: updated as any })
                          }}
                        >
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Minimum Solar Score</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0-100"
                      className="mt-1"
                      onChange={(e) => setFilters({ ...filters, solar_score_min: parseInt(e.target.value) || undefined })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-medium">Preview</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your audience will include approximately <strong>523 properties</strong>
                </p>
                <div className="mt-4 space-y-2">
                  <p className="text-sm"><strong>Name:</strong> {audienceName || 'Untitled Audience'}</p>
                  {filters.property_type && (
                    <p className="text-sm"><strong>Property Type:</strong> {filters.property_type}</p>
                  )}
                  {filters.roof_condition && filters.roof_condition.length > 0 && (
                    <p className="text-sm"><strong>Roof Condition:</strong> {filters.roof_condition.join(', ')}</p>
                  )}
                  {filters.solar_score_min && (
                    <p className="text-sm"><strong>Solar Score:</strong> {filters.solar_score_min}+</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Export Format</label>
                <select className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2">
                  <option>Google Ads Customer Match</option>
                  <option>CSV Export</option>
                  <option>PDF Report</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          )}
          {step < 2 ? (
            <Button onClick={() => setStep(2)} disabled={!audienceName}>
              Next
            </Button>
          ) : (
            <Button onClick={handleComplete}>
              Create Audience
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
