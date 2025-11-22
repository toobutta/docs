'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertCircle,
  Bell,
  BellOff,
  Calendar,
  Clock,
  Mail,
  MoreVertical,
  Pencil,
  Send,
  Trash2,
  TrendingUp,
} from 'lucide-react'
import {
  useUpdateSavedSearch,
  useDeleteSavedSearch,
  useSendTestAlert,
} from '@/lib/hooks/use-saved-searches'
import { useToast } from '@/hooks/use-toast'
import type { SavedSearch } from '@/types/saved-search'

interface SavedSearchCardProps {
  search: SavedSearch
  onEdit: (search: SavedSearch) => void
  onView: (search: SavedSearch) => void
}

const frequencyLabels: Record<string, string> = {
  instant: 'Instant',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
}

const frequencyIcons: Record<string, typeof Clock> = {
  instant: Bell,
  daily: Clock,
  weekly: Calendar,
  monthly: Calendar,
}

export function SavedSearchCard({ search, onEdit, onView }: SavedSearchCardProps) {
  const { toast } = useToast()
  const updateMutation = useUpdateSavedSearch()
  const deleteMutation = useDeleteSavedSearch()
  const testAlertMutation = useSendTestAlert()
  const [alertsEnabled, setAlertsEnabled] = useState(search.alerts_enabled)

  const handleToggleAlerts = async (enabled: boolean) => {
    setAlertsEnabled(enabled)
    try {
      await updateMutation.mutateAsync({
        searchId: search.id,
        updates: { alerts_enabled: enabled },
      })

      toast({
        title: enabled ? 'Alerts enabled' : 'Alerts disabled',
        description: enabled
          ? 'You will receive email alerts for this search.'
          : 'Email alerts have been disabled for this search.',
      })
    } catch (error) {
      setAlertsEnabled(!enabled) // Revert on error
      toast({
        title: 'Error',
        description: 'Failed to update alert settings.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this saved search?')) return

    try {
      await deleteMutation.mutateAsync(search.id)
      toast({
        title: 'Search deleted',
        description: 'Your saved search has been deleted.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete search.',
        variant: 'destructive',
      })
    }
  }

  const handleTestAlert = async () => {
    try {
      await testAlertMutation.mutateAsync({
        searchId: search.id,
      })
      toast({
        title: 'Test alert sent',
        description: `A test email has been sent to ${search.alert_email}`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send test alert.',
        variant: 'destructive',
      })
    }
  }

  const FrequencyIcon = frequencyIcons[search.alert_frequency] || Clock

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{search.name}</CardTitle>
              {search.new_matches_since_last_alert > 0 && (
                <Badge variant="default" className="ml-2">
                  {search.new_matches_since_last_alert} new
                </Badge>
              )}
            </div>
            {search.description && (
              <CardDescription className="mt-1">
                {search.description}
              </CardDescription>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(search)}>
                <TrendingUp className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(search)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleTestAlert}>
                <Send className="mr-2 h-4 w-4" />
                Send Test Alert
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>{search.total_matches} total matches</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="truncate">{search.alert_email}</span>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center gap-3">
              {alertsEnabled ? (
                <Bell className="h-4 w-4 text-primary" />
              ) : (
                <BellOff className="h-4 w-4 text-muted-foreground" />
              )}
              <div>
                <div className="text-sm font-medium flex items-center gap-2">
                  <FrequencyIcon className="h-3.5 w-3.5" />
                  {frequencyLabels[search.alert_frequency]}
                  {search.alert_time !== undefined &&
                    ` at ${search.alert_time.toString().padStart(2, '0')}:00`}
                </div>
                {search.last_checked_at && (
                  <p className="text-xs text-muted-foreground">
                    Last checked:{' '}
                    {format(new Date(search.last_checked_at), 'MMM d, yyyy')}
                  </p>
                )}
              </div>
            </div>

            <Switch
              checked={alertsEnabled}
              onCheckedChange={handleToggleAlerts}
              disabled={updateMutation.isPending}
            />
          </div>

          {!search.is_active && (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
              <AlertCircle className="h-4 w-4" />
              <span>This search is inactive</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
