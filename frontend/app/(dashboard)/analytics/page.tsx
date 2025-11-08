import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Track your usage and ROI metrics
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Properties Analyzed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,543</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Exports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">CSV, PDF, Google Ads</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156 hrs</div>
            <p className="text-xs text-muted-foreground">vs manual research</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Usage Over Time</CardTitle>
            <CardDescription>Property analyses by product</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Chart component will be added in Week 15-16
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
