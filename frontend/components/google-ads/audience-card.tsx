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
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  RefreshCw,
  MoreVertical,
  Pencil,
  Trash2,
  TrendingUp,
  Users,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react'
import { useSyncAudience } from '@/lib/hooks/use-google-ads'
import { useToast } from '@/hooks/use-toast'
import type { CustomerMatchAudience } from '@/types/google-ads'

interface AudienceCardProps {
  audience: CustomerMatchAudience
}

const statusConfig = {
  pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Pending' },
  in_progress: {
    icon: Loader2,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    label: 'Syncing',
  },
  completed: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bg: 'bg-green-50',
    label: 'Completed',
  },
  failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Failed' },
  partial: {
    icon: CheckCircle2,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    label: 'Partial',
  },
}

export function AudienceCard({ audience }: AudienceCardProps) {
  const { toast } = useToast()
  const syncMutation = useSyncAudience()

  const config = statusConfig[audience.sync_status] || statusConfig.pending
  const StatusIcon = config.icon

  const handleSync = async () => {
    try {
      await syncMutation.mutateAsync(audience.id)
      toast({
        title: 'Sync started',
        description: 'Your audience is being synced to Google Ads.',
      })
    } catch (error) {
      toast({
        title: 'Sync failed',
        description: 'Failed to start sync. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{audience.name}</CardTitle>
            {audience.description && (
              <CardDescription className="mt-1 line-clamp-2">
                {audience.description}
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
              <DropdownMenuItem onClick={handleSync}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync Now
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Status Badge */}
          <div className={`flex items-center gap-2 rounded-lg p-3 ${config.bg}`}>
            <StatusIcon
              className={`h-4 w-4 ${config.color} ${
                audience.sync_status === 'in_progress' ? 'animate-spin' : ''
              }`}
            />
            <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
            {audience.auto_sync_enabled && (
              <Badge variant="outline" className="ml-auto text-xs">
                Auto-sync: {audience.sync_frequency_hours}h
              </Badge>
            )}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Properties</span>
              </div>
              <div className="text-lg font-semibold">
                {audience.total_properties.toLocaleString()}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <Users className="h-3.5 w-3.5" />
                <span>Contacts</span>
              </div>
              <div className="text-lg font-semibold">
                {audience.total_contacts.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Match Rate */}
          {audience.matched_count > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Match Rate</span>
                <span className="font-semibold">{audience.match_rate}%</span>
              </div>
              <Progress value={audience.match_rate} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {audience.matched_count.toLocaleString()} of{' '}
                {audience.uploaded_count.toLocaleString()} matched in Google Ads
              </div>
            </div>
          )}

          {/* Last Sync */}
          {audience.last_sync_at && (
            <div className="text-xs text-muted-foreground">
              Last synced: {format(new Date(audience.last_sync_at), 'MMM d, yyyy h:mm a')}
            </div>
          )}

          {/* Error Message */}
          {audience.last_error && (
            <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
              {audience.last_error}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
