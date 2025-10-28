"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Check, CheckCircle, Copy, Mail, RefreshCw, Settings } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function EmailDiagnosticPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [retries, setRetries] = useState(0)
  const [emailProvider, setEmailProvider] = useState("gmail")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setRetries((prev) => prev + 1)

    try {
      const response = await fetch("/api/email-diagnostic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, provider: emailProvider }),
      })

      const data = await response.json()
      setResults(data)

      if (response.ok && data.emailSending?.success) {
        toast({
          title: "Success",
          description: `Diagnostic email sent to ${email}`,
          variant: "default",
        })
      } else {
        toast({
          title: "Email Diagnostic Failed",
          description: data.emailSending?.message || "Check diagnostic results for details",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while running the diagnostic",
        variant: "destructive",
      })
      setResults({
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Configuration copied to clipboard",
    })
  }

  const getEnvVariableStatus = (status: string) => {
    if (status === "✓ Set") {
      return <Check className="h-4 w-4 text-green-500" />
    } else {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getProviderSuggestion = () => {
    switch (emailProvider) {
      case "gmail":
        return (
          <Alert className="mt-4">
            <Mail className="h-4 w-4" />
            <AlertTitle>Gmail SMTP Settings</AlertTitle>
            <AlertDescription>
              <p>Gmail now requires an App Password for SMTP access:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Enable 2-Step Verification in your Google Account</li>
                <li>
                  Create an App Password at:{" "}
                  <a
                    href="https://myaccount.google.com/apppasswords"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Google App Passwords
                  </a>
                </li>
                <li>Use your full email as USERNAME</li>
                <li>Use the generated App Password as PASSWORD</li>
                <li>Set PORT to 465 and SECURE to true</li>
                <li>Consider using a dedicated Gmail account for sending emails</li>
              </ul>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() =>
                  copyToClipboard(`EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=465
EMAIL_SERVER_SECURE=true
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=Fitnest.ma <your-email@gmail.com>`)
                }
              >
                <Copy className="h-3 w-3 mr-1" /> Copy template
              </Button>
            </AlertDescription>
          </Alert>
        )
      case "outlook":
        return (
          <Alert className="mt-4">
            <Mail className="h-4 w-4" />
            <AlertTitle>Outlook SMTP Settings</AlertTitle>
            <AlertDescription>
              <p>Outlook SMTP Configuration:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Use your full email as USERNAME</li>
                <li>Use your regular Outlook password as PASSWORD</li>
                <li>Set PORT to 587 and SECURE to false</li>
              </ul>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() =>
                  copyToClipboard(`EMAIL_SERVER_HOST=smtp-mail.outlook.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_SECURE=false
EMAIL_SERVER_USER=your-email@outlook.com
EMAIL_SERVER_PASSWORD=your-password
EMAIL_FROM=Fitnest.ma <your-email@outlook.com>`)
                }
              >
                <Copy className="h-3 w-3 mr-1" /> Copy template
              </Button>
            </AlertDescription>
          </Alert>
        )
      case "sendgrid":
        return (
          <Alert className="mt-4">
            <Mail className="h-4 w-4" />
            <AlertTitle>SendGrid SMTP Settings</AlertTitle>
            <AlertDescription>
              <p>SendGrid SMTP Configuration:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Create an API Key in your SendGrid account</li>
                <li>Use 'apikey' as USERNAME</li>
                <li>Use your API Key as PASSWORD</li>
                <li>Set PORT to 587 and SECURE to false</li>
              </ul>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() =>
                  copyToClipboard(`EMAIL_SERVER_HOST=smtp.sendgrid.net
EMAIL_SERVER_PORT=587
EMAIL_SERVER_SECURE=false
EMAIL_SERVER_USER=apikey
EMAIL_SERVER_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=Fitnest.ma <your-verified-sender@domain.com>`)
                }
              >
                <Copy className="h-3 w-3 mr-1" /> Copy template
              </Button>
            </AlertDescription>
          </Alert>
        )
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Email System Diagnostic Tool</CardTitle>
          <CardDescription>Troubleshoot your email configuration and test email delivery</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Test email recipient</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">The test email will be sent to this address</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider">Email Provider</Label>
              <Select value={emailProvider} onValueChange={setEmailProvider}>
                <SelectTrigger id="provider">
                  <SelectValue placeholder="Select your email provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gmail">Gmail</SelectItem>
                  <SelectItem value="outlook">Outlook</SelectItem>
                  <SelectItem value="sendgrid">SendGrid</SelectItem>
                  <SelectItem value="custom">Other/Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {getProviderSuggestion()}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Running Diagnostic...
                </>
              ) : (
                <>Run Email Diagnostic</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Diagnostic Results</CardTitle>
            <CardDescription>
              {results.emailSending?.success
                ? "Test completed successfully"
                : "Issues detected with email configuration"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="environment">
              <TabsList className="mb-4">
                <TabsTrigger value="environment">Environment Variables</TabsTrigger>
                <TabsTrigger value="connection">SMTP Connection</TabsTrigger>
                <TabsTrigger value="sending">Email Sending</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>

              <TabsContent value="environment">
                <h3 className="font-medium mb-2">Environment Variables</h3>
                <div className="space-y-2">
                  {results.environmentVariables &&
                    Object.entries(results.environmentVariables).map(([key, value]: [string, any]) => (
                      <div key={key} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          {getEnvVariableStatus(value)}
                          <span className="font-mono text-sm">EMAIL_SERVER_{key.toUpperCase()}</span>
                        </div>
                        <span className="text-sm">{value}</span>
                      </div>
                    ))}
                </div>

                {Object.values(results.environmentVariables || {}).some((v: any) => v.includes("Missing")) && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Missing Environment Variables</AlertTitle>
                    <AlertDescription>
                      Some required environment variables are missing. Please set them in your .env.local file.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="connection">
                <h3 className="font-medium mb-2">SMTP Connection</h3>
                {results.smtpConnection && (
                  <div className="space-y-4">
                    <div
                      className={`p-4 rounded-md border ${results.smtpConnection.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                    >
                      <div className="flex items-start gap-2">
                        {results.smtpConnection.success ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        )}
                        <div>
                          <h4 className="font-medium">
                            {results.smtpConnection.success ? "Connected Successfully" : "Connection Failed"}
                          </h4>
                          <p className="text-sm mt-1">{results.smtpConnection.message}</p>

                          {!results.smtpConnection.success && results.smtpConnection.details && (
                            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                              {JSON.stringify(results.smtpConnection.details, null, 2)}
                            </pre>
                          )}

                          {!results.smtpConnection.success && (
                            <div className="mt-2 text-sm space-y-1">
                              <p className="font-medium">Possible fixes:</p>
                              <ul className="list-disc pl-5">
                                <li>Check if the SMTP host and port are correct</li>
                                <li>Verify your username and password</li>
                                <li>Ensure your email provider allows SMTP access</li>
                                <li>For Gmail, use an App Password if 2FA is enabled</li>
                                <li>Check if your provider requires SSL/TLS</li>
                                <li>Ensure your server's outgoing ports aren't blocked</li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="sending">
                <h3 className="font-medium mb-2">Email Sending</h3>
                {results.emailSending && (
                  <div className="space-y-4">
                    <div
                      className={`p-4 rounded-md border ${results.emailSending.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                    >
                      <div className="flex items-start gap-2">
                        {results.emailSending.success ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        )}
                        <div>
                          <h4 className="font-medium">
                            {results.emailSending.success ? "Email Sent Successfully" : "Email Sending Failed"}
                          </h4>

                          {results.emailSending.success ? (
                            <>
                              <p className="text-sm mt-1">A test email has been sent to {email}</p>
                              <div className="mt-2 text-sm">
                                <p>Message ID: {results.emailSending.messageId}</p>
                                <p className="mt-1">Server response: {results.emailSending.response}</p>
                              </div>
                            </>
                          ) : (
                            <>
                              <p className="text-sm mt-1">{results.emailSending.message}</p>
                              {results.emailSending.details && (
                                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                                  {JSON.stringify(results.emailSending.details, null, 2)}
                                </pre>
                              )}
                              <div className="mt-2 text-sm space-y-1">
                                <p className="font-medium">Possible fixes:</p>
                                <ul className="list-disc pl-5">
                                  <li>Check if your EMAIL_FROM is properly formatted</li>
                                  <li>Verify the recipient email address</li>
                                  <li>Check for rate limiting by your email provider</li>
                                  <li>Ensure your sending domain is authorized (SPF/DKIM)</li>
                                  <li>Check your email provider's sending limits</li>
                                </ul>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="advanced">
                <h3 className="font-medium mb-2">Advanced Diagnostic Data</h3>
                <div className="space-y-4">
                  <div className="bg-gray-100 p-4 rounded-md">
                    <h4 className="text-sm font-medium mb-2">Current Configuration</h4>
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(
                        {
                          host: process.env.EMAIL_SERVER_HOST,
                          port: process.env.EMAIL_SERVER_PORT,
                          secure: process.env.EMAIL_SERVER_SECURE,
                          user: process.env.EMAIL_SERVER_USER,
                          from: process.env.EMAIL_FROM,
                          environment: process.env.NODE_ENV,
                          diagnosticRun: new Date().toISOString(),
                          retryCount: retries,
                        },
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                  <Alert>
                    <Settings className="h-4 w-4" />
                    <AlertTitle>Troubleshooting Help</AlertTitle>
                    <AlertDescription>
                      <p className="mb-2">If you continue to experience issues:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Try a different email provider like SendGrid or Resend</li>
                        <li>Check if your server/hosting provider blocks certain outgoing ports</li>
                        <li>Consider using a dedicated transactional email service</li>
                        <li>Verify email formatting and check spam folders</li>
                        <li>For production, consider setting up proper SPF, DKIM, and DMARC records</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setResults(null)}>
              Clear Results
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>Retry Diagnostic</>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
      <Toaster />
    </div>
  )
}
