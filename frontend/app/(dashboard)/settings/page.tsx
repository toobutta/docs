import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input id="name" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input id="email" type="email" placeholder="john@example.com" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>Manage your API authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                API Key
              </label>
              <div className="flex gap-2">
                <Input value="evo_*********************" readOnly />
                <Button variant="outline">Copy</Button>
              </div>
            </div>
            <Button variant="outline">Generate New Key</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrations</CardTitle>
            <CardDescription>Connect external services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Google Ads</p>
                <p className="text-sm text-muted-foreground">Export audiences directly to Google Ads</p>
              </div>
              <Button variant="outline">Connect</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Salesforce</p>
                <p className="text-sm text-muted-foreground">Sync properties to your CRM</p>
              </div>
              <Button variant="outline">Connect</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing</CardTitle>
            <CardDescription>Manage your subscription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">Current Plan: Free</p>
              <p className="text-sm text-muted-foreground">1,000 property analyses per month</p>
            </div>
            <Button>Upgrade to Pro</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
