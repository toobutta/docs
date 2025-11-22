import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Bell } from "lucide-react"

export default function AlertsPage() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alerts</h1>
          <p className="text-muted-foreground">
            Saved searches with email notifications
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Alert
        </Button>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  New Solar Prospects in Atlanta
                </CardTitle>
                <CardDescription>Daily email notifications</CardDescription>
              </div>
              <Badge>Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Notifies when new properties matching solar criteria are added
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Aging Roofs - Weekly Digest
                </CardTitle>
                <CardDescription>Weekly email notifications</CardDescription>
              </div>
              <Badge>Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Weekly summary of properties with deteriorating roof conditions
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
