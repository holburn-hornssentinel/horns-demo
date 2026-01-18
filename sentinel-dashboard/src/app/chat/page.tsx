'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { getHornsIQUrl } from '@/lib/api'

// Configure HornsIQ endpoint dynamically based on hostname
const HORNSIQ_URL = getHornsIQUrl()

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome to HornsIQ! I\'m your AI security assistant. Ask me about security threats, vulnerabilities, or compliance.',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const messageText = input.trim()
    setInput('')
    setIsLoading(true)

    // Handle help command locally
    if (messageText.toLowerCase() === 'help') {
      const helpMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `**HornsIQ Commands**

**General Commands**
• \`ask <question>\` - Get AI answer from internal knowledge
• \`search <query>\` - Search internal documents
• \`web <query>\` - Search the internet
• \`lookup <query>\` - Smart search (auto-picks source)

**Specialized Assistants**
• \`code\` - Code Expert (GitHub)
• \`team\` - Team Knowledge (Teams chats)
• \`docs\` - Document Search (SharePoint)
• \`pr\` - PR Summarizer
• \`support\` - Customer Support FAQ lookup

**Advanced Features**
• \`analyze\` - Analyze attached image
• \`research <question>\` - Deep multi-source research
• \`compare "A" vs "B"\` - Compare items
• \`diagram <template>\` - Generate diagrams

**System**
• \`index\` - Show indexing status
• \`reindex [repo]\` - Trigger re-indexing
• \`anomalies\` - System health report`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, helpMessage])
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(`${HORNSIQ_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          persona_id: 0
        })
      })

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.success ? data.message : 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Unable to connect to HornsIQ. Please ensure the service is running on the costco server.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const suggestions = [
    'What are our critical vulnerabilities?',
    'Summarize our security posture',
    'What should we prioritize?',
    'Explain the recent alerts'
  ]

  return (
    <div className="flex flex-col h-screen max-h-[calc(100vh-4rem)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-card-foreground mb-2">HornsIQ Assistant</h1>
        <p className="text-muted-foreground">AI-powered security intelligence</p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 bg-card rounded-lg border border-border overflow-y-auto p-6 space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-horns-blue flex items-center justify-center">
                <Bot className="w-5 h-5 text-card-foreground" />
              </div>
            )}

            <div
              className={`max-w-[70%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-horns-blue text-white'
                  : 'bg-card border border-border text-foreground'
              }`}
            >
              {message.role === 'assistant' ? (
                <div className="prose prose-sm prose-invert max-w-none">
                  <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-border">
                    <Bot className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-primary">HornsIQ</span>
                  </div>
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0 text-foreground">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-foreground">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-foreground">{children}</ol>,
                      li: ({ children }) => <li className="text-foreground">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
                      code: ({ children }) => (
                        <code className="px-2 py-1 rounded text-sm font-mono font-bold text-primary" style={{ backgroundColor: '#0d1117' }}>
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-accent p-4 rounded-lg overflow-x-auto mb-2 border border-border">
                          {children}
                        </pre>
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
              <p className="text-xs opacity-60 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>

            {message.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-horns-purple flex items-center justify-center">
                <User className="w-5 h-5 text-card-foreground" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-horns-blue flex items-center justify-center">
              <Bot className="w-5 h-5 text-card-foreground" />
            </div>
            <div className="bg-card border border-border rounded-lg p-4 flex items-center space-x-1">
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => setInput(suggestion)}
                className="px-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground hover:bg-muted hover:border-primary transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-card rounded-lg border border-border p-4">
        <div className="flex items-end space-x-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything about security..."
            rows={1}
            className="flex-1 bg-secondary border border-border rounded-lg px-4 py-3 text-card-foreground placeholder-gray-500 focus:outline-none focus:border-horns-blue resize-none"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-horns-blue text-card-foreground rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Send className="w-5 h-5" />
            <span>Send</span>
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Connected to: {HORNSIQ_URL}
        </p>
      </div>
    </div>
  )
}
