'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export default function BulkImportPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${API_BASE}/bulk-import/properties`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setResult(data)

      toast({
        title: 'Import completed',
        description: `${data.successful} properties imported successfully`,
      })
    } catch (error) {
      toast({
        title: 'Import failed',
        description: 'Failed to import properties. Please check your file and try again.',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container py-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Bulk Property Import</h1>
        <p className="text-muted-foreground mt-1">
          Import multiple properties at once from CSV or Excel files
        </p>
      </div>

      <div className="space-y-6">
        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>File Requirements</CardTitle>
            <CardDescription>
              Your file must include the following columns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong>Required columns:</strong>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                  <li>address - Full property address</li>
                  <li>latitude - Decimal latitude coordinate</li>
                  <li>longitude - Decimal longitude coordinate</li>
                </ul>
              </div>

              <div>
                <strong>Optional columns:</strong>
                <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                  <li>city - City name</li>
                  <li>state - State code (e.g., TX, CA)</li>
                  <li>zip_code - ZIP code</li>
                  <li>
                    property_type - residential, commercial, industrial, or agricultural
                  </li>
                </ul>
              </div>

              <div className="pt-2">
                <strong>Supported formats:</strong>
                <span className="text-sm text-muted-foreground ml-2">
                  CSV (.csv), Excel (.xlsx, .xls)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
            <CardDescription>Select your CSV or Excel file to import</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
              <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />

              <input
                type="file"
                id="file-upload"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />

              <label htmlFor="file-upload">
                <Button variant="outline" asChild>
                  <span className="cursor-pointer">
                    <Upload className="mr-2 h-4 w-4" />
                    Choose File
                  </span>
                </Button>
              </label>

              {file && (
                <div className="mt-4 text-sm text-muted-foreground">
                  Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(2)} KB)
                </div>
              )}
            </div>

            <Button onClick={handleUpload} disabled={!file || uploading} className="w-full">
              {uploading ? 'Importing...' : 'Import Properties'}
            </Button>

            {uploading && (
              <div className="space-y-2">
                <div className="text-sm text-center text-muted-foreground">
                  Processing your file...
                </div>
                <Progress value={45} className="h-2" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.failed === 0 ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    Import Successful
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    Import Completed with Errors
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{result.total_rows}</div>
                  <div className="text-sm text-muted-foreground">Total Rows</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {result.successful}
                  </div>
                  <div className="text-sm text-muted-foreground">Successful</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{result.failed}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div>
                  <div className="text-sm font-semibold mb-2">Errors:</div>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {result.errors.map((error: any, idx: number) => (
                      <div
                        key={idx}
                        className="text-xs bg-destructive/10 text-destructive p-2 rounded"
                      >
                        Row {error.row}: {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null)
                    setResult(null)
                  }}
                >
                  Import Another File
                </Button>
                <Button onClick={() => router.push('/map')}>View Properties on Map</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
