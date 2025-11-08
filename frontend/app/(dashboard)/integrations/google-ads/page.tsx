'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, RefreshCw, TrendingUp, Users, Target, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
import {
  useGoogleAdsAccounts,
  useOAuthCallback,
  useAudiences,
  useAccountStatistics,
} from '@/lib/hooks/use-google-ads'
import { GoogleAdsConnect } from '@/components/google-ads/google-ads-connect'
import { AudienceDialog } from '@/components/google-ads/audience-dialog'
import { AudienceCard } from '@/components/google-ads/audience-card'
import { useMapStore } from '@/lib/stores/map-store'

export default function GoogleAdsIntegrationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { filters } = useMapStore()

  const [audienceDialogOpen, setAudienceDialogOpen] = useState(false)

  const { data: accounts, isLoading: accountsLoading } = useGoogleAdsAccounts()
  const { data: audiencesData, isLoading: audiencesLoading } = useAudiences({ limit: 100 })
  const { data: statistics, isLoading: statsLoading } = useAccountStatistics()
  const oauthCallback = useOAuthCallback()

  const connectedAccount = accounts?.find(
    (acc) => acc.is_active && acc.status === 'connected'
  )

  // Handle OAuth callback
  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (code && state && !oauthCallback.isPending) {
      oauthCallback.mutate(
        { code, state },
        {
          onSuccess: () => {
            toast({
              title: 'Connected successfully',
              description: 'Your Google Ads account has been connected. Please enter your Customer ID.',
            })
            router.replace('/integrations/google-ads')
          },
          onError: () => {
            toast({
              title: 'Connection failed',
              description: 'Failed to connect Google Ads account. Please try again.',
              variant: 'destructive',
            })
            router.replace('/integrations/google-ads')
          },
        }
      )
    }
  }, [searchParams, oauthCallback, router, toast])

  if (accountsLoading) {
    return (
      <div className="container py-6">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Google Ads Integration</h1>
              <p className="text-muted-foreground mt-1">
                Sync property audiences to Google Ads Customer Match
              </p>
            </div>
            {connectedAccount && (
              <Button onClick={() => setAudienceDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Audience
              </Button>
            )}
          </div>

          {/* Statistics */}
          {connectedAccount && statistics && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Audiences</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statistics.statistics.total_audiences}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {statistics.statistics.active_audiences} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statistics.statistics.total_contacts.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {statistics.statistics.total_synced.toLocaleString()} synced
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Match Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statistics.statistics.average_match_rate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground">Google Ads matching</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Account</CardTitle>
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-medium">{statistics.account.account_name}</div>
                  <p className="text-xs text-muted-foreground">
                    ID: {statistics.account.customer_id}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="container py-6">
          {!connectedAccount ? (
            <GoogleAdsConnect />
          ) : (
            <>
              {audiencesLoading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="p-6">
                      <Skeleton className="h-6 w-2/3 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </Card>
                  ))}
                </div>
              ) : audiencesData && audiencesData.audiences.length > 0 ? (
                <>
                  <div className="mb-4 text-sm text-muted-foreground">
                    {audiencesData.total} {audiencesData.total === 1 ? 'audience' : 'audiences'}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {audiencesData.audiences.map((audience) => (
                      <AudienceCard key={audience.id} audience={audience} />
                    ))}
                  </div>
                </>
              ) : (
                <Card className="p-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="rounded-full bg-muted p-4">
                      <Target className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">No audiences yet</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create your first Customer Match audience to sync properties to Google Ads
                      </p>
                      <Button onClick={() => setAudienceDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Audience
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Audience Dialog */}
      <AudienceDialog
        open={audienceDialogOpen}
        onOpenChange={setAudienceDialogOpen}
        currentFilters={filters}
      />
    </div>
  )
}
