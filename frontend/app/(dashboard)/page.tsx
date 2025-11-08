'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  TrendingUp,
  MapPin,
  Bell,
  Target,
  Users,
  Activity,
  ArrowUp,
  Clock,
} from 'lucide-react'
import { format } from 'date-fns'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

async function getDashboardAnalytics() {
  const response = await fetch(`${API_BASE}/analytics/dashboard`)
  if (!response.ok) throw new Error('Failed to fetch analytics')
  return response.json()
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-analytics'],
    queryFn: getDashboardAnalytics,
    refetchInterval: 60000,
  })

  if (isLoading || !data) {
    return (
      <div className="container py-6">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-4 w-24" /></CardHeader>
              <CardContent><Skeleton className="h-8 w-16" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform-wide metrics and insights</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.properties.total.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3" />
              +{data.properties.recent_week} this week
            </div>
            {data.properties.growth_rate > 0 && (
              <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                <ArrowUp className="h-3 w-3" />
                {data.properties.growth_rate.toFixed(1)}% growth
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.saved_searches.active_alerts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.saved_searches.total} total searches
            </p>
            <p className="text-xs text-muted-foreground">
              {data.saved_searches.alerts_sent_30d} alerts sent (30d)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Google Ads</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.google_ads.total_audiences}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.google_ads.total_contacts.toLocaleString()} contacts
            </p>
            <Badge variant="outline" className="text-xs mt-1">
              {data.google_ads.connected ? 'Connected' : 'Not Connected'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Territories</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.territories.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.territories.total_properties.toLocaleString()} properties
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recent_activity.length > 0 ? (
            <div className="space-y-3">
              {data.recent_activity.map((activity: any) => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded border">
                  <div>
                    <div className="font-medium">{activity.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(activity.created_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                  {activity.new_matches > 0 && <Badge>{activity.new_matches} new</Badge>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">No recent activity</div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
        <Clock className="h-3 w-3" />
        Last updated: {format(new Date(data.generated_at), 'h:mm a')}
      </div>
    </div>
  )
}
