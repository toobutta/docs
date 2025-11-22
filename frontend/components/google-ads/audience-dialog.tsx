'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useCreateAudience } from '@/lib/hooks/use-google-ads'
import { useToast } from '@/hooks/use-toast'
import type { PropertyFilters } from '@/types/property'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(5000).optional(),
  auto_sync_enabled: z.boolean(),
  sync_frequency_hours: z.number().min(1).max(168),
})

type FormValues = z.infer<typeof formSchema>

interface AudienceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentFilters: PropertyFilters
}

export function AudienceDialog({
  open,
  onOpenChange,
  currentFilters,
}: AudienceDialogProps) {
  const { toast } = useToast()
  const createMutation = useCreateAudience()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      auto_sync_enabled: true,
      sync_frequency_hours: 24,
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await createMutation.mutateAsync({
        name: values.name,
        description: values.description,
        property_filters: currentFilters,
        auto_sync_enabled: values.auto_sync_enabled,
        sync_frequency_hours: values.sync_frequency_hours,
      })

      toast({
        title: 'Audience created',
        description: 'Your audience has been created and is being synced to Google Ads.',
      })

      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create audience. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Customer Match Audience</DialogTitle>
          <DialogDescription>
            Create a new audience based on your current property filters to sync with Google Ads.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Audience Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., High-value Solar Prospects" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe this audience and its purpose..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg bg-muted p-4">
              <h4 className="text-sm font-semibold mb-2">Current Filters Applied:</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                {currentFilters.city && <div>City: {currentFilters.city}</div>}
                {currentFilters.state && <div>State: {currentFilters.state}</div>}
                {currentFilters.property_type && (
                  <div>Property Type: {currentFilters.property_type.join(', ')}</div>
                )}
                {!currentFilters.city && !currentFilters.state && !currentFilters.property_type && (
                  <div>No filters applied - all properties will be included</div>
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="auto_sync_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable Auto-Sync</FormLabel>
                    <FormDescription>
                      Automatically sync new properties to this audience
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch('auto_sync_enabled') && (
              <FormField
                control={form.control}
                name="sync_frequency_hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sync Frequency</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Every hour</SelectItem>
                        <SelectItem value="6">Every 6 hours</SelectItem>
                        <SelectItem value="12">Every 12 hours</SelectItem>
                        <SelectItem value="24">Daily</SelectItem>
                        <SelectItem value="48">Every 2 days</SelectItem>
                        <SelectItem value="72">Every 3 days</SelectItem>
                        <SelectItem value="168">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>How often to sync new properties</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Audience'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
