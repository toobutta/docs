'use client'

import { useState } from 'react'
import { Link as LinkIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  useAuthorizationURL,
  useGoogleAdsAccounts,
  useUpdateCustomerId,
} from '@/lib/hooks/use-google-ads'

export function GoogleAdsConnect() {
  const { toast } = useToast()
  const [customerId, setCustomerId] = useState('')

  const { data: accounts } = useGoogleAdsAccounts()
  const authUrl = useAuthorizationURL()
  const updateCustomerId = useUpdateCustomerId()

  const pendingAccount = accounts?.find((acc) => acc.status === 'pending')

  const handleConnect = async () => {
    try {
      const result = await authUrl.refetch()
      if (result.data) {
        // Redirect to Google OAuth
        window.location.href = result.data.auth_url
      }
    } catch (error) {
      toast({
        title: 'Connection failed',
        description: 'Failed to initiate Google Ads connection.',
        variant: 'destructive',
      })
    }
  }

  const handleSubmitCustomerId = async () => {
    if (!pendingAccount) return

    if (!/^\d{10}$/.test(customerId)) {
      toast({
        title: 'Invalid Customer ID',
        description: 'Customer ID must be exactly 10 digits (e.g., 1234567890)',
        variant: 'destructive',
      })
      return
    }

    try {
      await updateCustomerId.mutateAsync({
        accountId: pendingAccount.id,
        customerId,
      })

      toast({
        title: 'Account connected',
        description: 'Your Google Ads account is now connected and ready to use.',
      })
    } catch (error) {
      toast({
        title: 'Connection failed',
        description: 'Failed to connect account. Please check your Customer ID and try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Connect Google Ads Account</CardTitle>
          <CardDescription>
            Connect your Google Ads account to sync property audiences using Customer Match
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!pendingAccount ? (
            <>
              <div className="space-y-2">
                <h3 className="font-semibold">What you'll need:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>A Google Ads account with Customer Match access</li>
                  <li>Your 10-digit Google Ads Customer ID (e.g., 123-456-7890)</li>
                  <li>Permission to upload customer data</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">How it works:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Connect your Google Ads account via OAuth</li>
                  <li>Enter your Customer ID</li>
                  <li>Create audiences based on property filters</li>
                  <li>Sync audiences to Google Ads Customer Match</li>
                  <li>Use audiences in your advertising campaigns</li>
                </ol>
              </div>

              <Button
                onClick={handleConnect}
                disabled={authUrl.isFetching}
                className="w-full"
                size="lg"
              >
                {authUrl.isFetching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Connect Google Ads Account
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <div className="rounded-lg bg-amber-50 p-4 border border-amber-200">
                <h3 className="font-semibold text-amber-900 mb-2">
                  Almost there! Enter your Customer ID
                </h3>
                <p className="text-sm text-amber-800">
                  Your account has been authenticated. Now enter your Google Ads Customer ID to
                  complete the connection.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerId">Google Ads Customer ID</Label>
                  <Input
                    id="customerId"
                    placeholder="1234567890"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value.replace(/\D/g, ''))}
                    maxLength={10}
                  />
                  <p className="text-xs text-muted-foreground">
                    10-digit Customer ID (without dashes). Find it in your Google Ads account
                    settings.
                  </p>
                </div>

                <Button
                  onClick={handleSubmitCustomerId}
                  disabled={customerId.length !== 10 || updateCustomerId.isPending}
                  className="w-full"
                >
                  {updateCustomerId.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Complete Connection'
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
