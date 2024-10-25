'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import AnsiToHtml from 'ansi-to-html'

const ansiToHtml = new AnsiToHtml()

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function Home() {
  const [gitLink, setGitLink] = useState('')
  const [config, setConfig] = useState('')
  const [output, setOutput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setIsLoading(true)
    setOutput('')
    setError('')

    try {
      if (!API_URL) {
        throw new Error('API_URL is not defined')
      }

      const response = await fetch(`${API_URL}/your/endpoint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gitLink, config }),
        signal: new AbortController().signal,
      })

      if (!response.ok) {
        throw new Error('Server responded with an error')
      }

      if (!response.body) {
        throw new Error('Response body is null')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder('utf-8')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        setOutput(prev => prev + chunk)
      }
    } catch (error) {
      console.error('Error:', error)
      setError('An error occurred while processing your request.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Git Repository Processor</h1>
      <div className="space-y-2">
        <Label htmlFor="gitLink">Git Repository URL</Label>
        <Input
          id="gitLink"
          placeholder="Enter Git repository URL"
          value={gitLink}
          onChange={(e) => setGitLink(e.target.value)}
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="config">Configuration</Label>
        <Textarea
          id="config"
          placeholder="Enter configuration (optional)"
          value={config}
          onChange={(e) => setConfig(e.target.value)}
          className="w-full h-32"
        />
      </div>
      <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Start Processing'
        )}
      </Button>
      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {output && (
        <div className="space-y-2">
          <Label>Output</Label>
          <div 
            className="bg-gray-100 p-4 rounded-md whitespace-pre-wrap overflow-auto max-h-96"
            dangerouslySetInnerHTML={{ __html: ansiToHtml.toHtml(output) }}
          />
        </div>
      )}
    </div>
  )
}