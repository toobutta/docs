'use client'

import { useState, useEffect } from 'react'
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
import { useCreateSavedSearch, useUpdateSavedSearch } from '@/lib/hooks/use-saved-searches'
import { useToast } from '@/hooks/use-toast'
import type { SavedSearch } from '@/types/saved-search'
import type { PropertyFilters } from '@/types/property'

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(1000).optional(),
  alert_email: z.string().email('Invalid email address'),
  alerts_enabled: z.boolean(),
  alert_frequency: z.enum(['instant', 'daily', 'weekly', 'monthly']),
  alert_time: z.number().min(0).max(23).optional(),
  alert_day: z.number().min(0).max(6).optional(),
})

type FormValues = z.infer<typeof formSchema>

interface SavedSearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentFilters: PropertyFilters
  editSearch?: SavedSearch
}

export function SavedSearchDialog({
  open,
  onOpenChange,
  currentFilters,
  editSearch,
}: SavedSearchDialogProps) {
  const { toast } = useToast()
  const createMutation = useCreateSavedSearch()
  const updateMutation = useUpdateSavedSearch()
  const [frequency, setFrequency] = useState<string>('daily')

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      alert_email: '',
      alerts_enabled: true,
      alert_frequency: 'daily',
      alert_time: 9,
      alert_day: 1,
    },
  })

  // Populate form when editing
  useEffect(() => {
    if (editSearch) {
      form.reset({
        name: editSearch.name,
        description: editSearch.description || '',
        alert_email: editSearch.alert_email,
        alerts_enabled: editSearch.alerts_enabled,
        alert_frequency: editSearch.alert_frequency,
        alert_time: editSearch.alert_time || 9,
        alert_day: editSearch.alert_day || 1,
      })
      setFrequency(editSearch.alert_frequency)
    }
  }, [editSearch, form])

  const onSubmit = async (values: FormValues) => {
    try {
      if (editSearch) {
        // Update existing search
        await updateMutation.mutateAsync({
          searchId: editSearch.id,
          updates: {
            name: values.name,
            description: values.description,
            alert_email: values.alert_email,
            alerts_enabled: values.alerts_enabled,
            alert_frequency: values.alert_frequency,
            alert_time: values.alert_time,
            alert_day: values.alert_day,
          },
        })

        toast({
          title: 'Search updated',
          description: 'Your saved search has been updated successfully.',
        })
      } else {
        // Create new search
        await createMutation.mutateAsync({
          name: values.name,
          description: values.description,
          filters: currentFilters,
          alert_email: values.alert_email,
          alerts_enabled: values.alerts_enabled,
          alert_frequency: values.alert_frequency,
          alert_time: values.alert_time,
          alert_day: values.alert_day,
        })

        toast({
          title: 'Search saved',
          description: 'Your search has been saved and alerts are now active.',
        })
      }

      form.reset()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save search. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const requiresTime = ['daily', 'weekly', 'monthly'].includes(frequency)
  const requiresDay = ['weekly', 'monthly'].includes(frequency)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {editSearch ? 'Edit Saved Search' : 'Save This Search'}
          </DialogTitle>
          <DialogDescription>
            Get email alerts when new properties match your search criteria.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Search Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., High-value solar leads" {...field} />
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
                      placeholder="Describe what this search is for..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alert_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alert Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="alerts@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Email address to receive property alerts
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alerts_enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Enable Alerts</FormLabel>
                    <FormDescription>
                      Receive email notifications for new matches
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alert_frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alert Frequency</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      setFrequency(value)
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="instant">
                        Instant - As soon as new properties match
                      </SelectItem>
                      <SelectItem value="daily">Daily - Once per day</SelectItem>
                      <SelectItem value="weekly">
                        Weekly - Once per week
                      </SelectItem>
                      <SelectItem value="monthly">
                        Monthly - Once per month
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {requiresTime && (
              <FormField
                control={form.control}
                name="alert_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alert Time (UTC)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => (
                          <SelectItem key={i} value={i.toString()}>
                            {i.toString().padStart(2, '0')}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Hour of day (0-23 UTC)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {requiresDay && (
              <FormField
                control={form.control}
                name="alert_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {frequency === 'weekly' ? 'Day of Week' : 'Day of Month'}
                    </FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {frequency === 'weekly' ? (
                          <>
                            <SelectItem value="0">Monday</SelectItem>
                            <SelectItem value="1">Tuesday</SelectItem>
                            <SelectItem value="2">Wednesday</SelectItem>
                            <SelectItem value="3">Thursday</SelectItem>
                            <SelectItem value="4">Friday</SelectItem>
                            <SelectItem value="5">Saturday</SelectItem>
                            <SelectItem value="6">Sunday</SelectItem>
                          </>
                        ) : (
                          Array.from({ length: 31 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : editSearch
                  ? 'Update Search'
                  : 'Save Search'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
