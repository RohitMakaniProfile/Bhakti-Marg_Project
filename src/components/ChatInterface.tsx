'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, User } from 'lucide-react'
import TTSButton from './TTSButton'

// Render markdown-lite: **bold**, *italic*, newlines
function renderMarkdown(text: string) {
  const lines = text.split('\n')
  return lines.map((line, li) => {
    const parts: React.ReactNode[] = []
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g
    let last = 0, match
    let key = 0
    while ((match = regex.exec(line)) !== null) {
      if (match.index > last) parts.push(<span key={key++}>{line.slice(last, match.index)}</span>)
      if (match[0].startsWith('**')) {
        parts.push(<strong key={key++} className="text-gold-300 font-semibold">{match[2]}</strong>)
      } else {
        parts.push(<em key={key++} className="text-saffron-200 italic">{match[3]}</em>)
      }
      last = match.index + match[0].length
    }
    if (last < line.length) parts.push(<span key={key++}>{line.slice(last)}</span>)
    return (
      <p key={li} className={li > 0 && lines[li - 1] === '' ? 'mt-3' : li > 0 ? 'mt-1' : ''}>
        {parts.length > 0 ? parts : line || null}
      </p>
    )
  })
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatInterfaceProps {
  endpoint: string
  extraBody?: Record<string, any>
  placeholder?: string
  welcomeMessage?: string
}

export default function ChatInterface({
  endpoint,
  extraBody = {},
  placeholder = 'Apna sawaal ya dard yahan likhein...',
  welcomeMessage = 'Jai Shri Radhe 🙏 Main aapki madad ke liye yahan hoon. Apna mann ki baat karein.',
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: welcomeMessage },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMessage: Message = { role: 'user', content: text }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    // Add empty assistant message to stream into
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          currentQuery: text,
          ...extraBody,
        }),
      })

      if (!res.ok) throw new Error('Request failed')

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') break
            try {
              const parsed = JSON.parse(data)
              fullText += parsed.text || ''
              setMessages(prev => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: fullText }
                return updated
              })
            } catch (_) {}
          }
        }
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Kshama karein, kuch takleef ho gayi. Dobara koshish karein. 🙏',
        }
        return updated
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Maharaj Ji presence banner */}
      <div className="flex-shrink-0 flex flex-col items-center pt-5 pb-3 px-4"
        style={{ background: 'linear-gradient(180deg, rgba(180,60,0,0.12) 0%, transparent 100%)' }}>
        <div className="relative mb-2">
          {/* Outer glow */}
          <div className="absolute inset-0 rounded-full blur-2xl opacity-60"
            style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.5), transparent)', transform: 'scale(1.4)' }} />
          {/* Spinning ring */}
          <div className="absolute inset-0 rounded-full border border-gold-500/30 animate-spin" style={{ animationDuration: '8s' }} />
          {/* Image */}
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-2"
            style={{ borderColor: 'rgba(245,158,11,0.6)', boxShadow: '0 0 25px rgba(245,158,11,0.4), 0 0 60px rgba(245,158,11,0.15)' }}>
            <img src="/maharaj-chat.jpeg" alt="Maharaj Ji"
              className="w-full h-full object-cover"
              style={{ objectPosition: '50% 55%' }} />
          </div>
          {/* Live dot */}
          <div className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-[#080200] bg-emerald-400"
            style={{ boxShadow: '0 0 6px rgba(52,211,153,0.8)' }}>
            <div className="w-full h-full rounded-full bg-emerald-400 animate-ping opacity-60" />
          </div>
        </div>
        <p className="font-hindi text-gold-300 text-sm font-semibold leading-tight text-center">प्रेमानंद जी महाराज</p>
        <p className="text-white/30 text-[10px] font-serif italic mt-0.5">Aapki baat sun rahe hain 🙏</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            <div className="flex-shrink-0 w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-sm border-2"
              style={msg.role === 'user'
                ? { background: 'linear-gradient(135deg,#b45309,#ff7c1a)', borderColor: 'rgba(245,158,11,0.3)' }
                : { borderColor: 'rgba(245,158,11,0.5)', boxShadow: '0 0 10px rgba(245,158,11,0.3)' }}>
              {msg.role === 'user'
                ? <User size={14} className="text-white" />
                : <img src="/maharaj-chat.jpeg" alt="Maharaj Ji" className="w-full h-full object-cover object-top" style={{ objectPosition: '50% 60%' }} />
              }
            </div>

            {/* Message bubble */}
            <div className={`max-w-[80%] group ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div className={`px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user' ? 'chat-user text-white' : 'chat-ai text-saffron-100'
              }`}>
                {msg.content ? (
                  msg.role === 'assistant'
                    ? <div className="space-y-0.5">{renderMarkdown(msg.content)}</div>
                    : msg.content
                ) : (
                  isLoading && i === messages.length - 1 ? (
                    <div className="flex gap-1 py-1">
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  ) : ''
                )}
              </div>

              {/* TTS for AI messages */}
              {msg.role === 'assistant' && msg.content && (
                <TTSButton text={msg.content} />
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/10">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-saffron-500 transition-colors disabled:opacity-50"
            style={{ minHeight: '42px', maxHeight: '120px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 bg-saffron-600 hover:bg-saffron-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Send size={15} className="text-white" />
          </button>
        </div>
        <p className="text-center text-xs text-white/20 mt-2">🕉️ Radhe Radhe</p>
      </div>
    </div>
  )
}
