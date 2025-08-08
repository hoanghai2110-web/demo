
'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Menu, User, ThumbsUp, ThumbsDown, Copy, Send, Edit, LogOut } from 'lucide-react'
import { supabase } from "@/lib/supabase"

interface Message {
  id: string
  user_id: string
  content: string
  role: 'user' | 'assistant'
  created_at: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Kiểm tra authentication
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)
      loadMessages(session.user.id)
    }

    checkAuth()

    // Lắng nghe auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const loadMessages = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error loading messages:', error)
        return
      }

      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading || !user) return

    const userMessage = inputValue.trim()
    setInputValue('')
    setIsLoading(true)

    // Thêm tin nhắn user vào UI ngay lập tức
    const tempUserMessage: Message = {
      id: Date.now().toString(),
      user_id: user.id,
      content: userMessage,
      role: 'user',
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, tempUserMessage])

    try {
      // Lấy session token
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('No access token found')
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          message: userMessage
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()

      // Reload messages để hiển thị cả tin nhắn user và AI
      await loadMessages(user.id)

    } catch (error) {
      console.error('Error sending message:', error)
      alert('Có lỗi xảy ra khi gửi tin nhắn')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error logging out:', error)
    } else {
      router.push('/login')
    }
  }

  const handleProfileClick = () => {
    router.push('/profile')
  }

  if (!user) {
    return (
      <div className="h-screen bg-[#f2efe4] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#262521]"></div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-[#f2efe4] flex flex-col font-['Rubik'] max-w-[375px] mx-auto relative overflow-hidden">
      {/* Fixed Header - chính xác theo Figma */}
      <header className="fixed top-0 left-1/2 transform -translate-x-1/2 w-full max-w-[375px] z-20 px-5 py-3 flex items-center justify-between bg-[#f2efe4] h-[48px]">
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
          <Menu className="h-6 w-6 text-[#101010]" strokeWidth={2} />
        </Button>

        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 p-0"
            onClick={handleLogout}
            title="Đăng xuất"
          >
            <LogOut className="h-5 w-5 text-[#101010]" />
          </Button>

          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 p-0 rounded-full bg-[#101010] hover:bg-[#262522]"
            onClick={handleProfileClick}
          >
            <User className="h-5 w-5 text-white" />
          </Button>
        </div>
      </header>

      {/* Scrollable Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 mt-[48px]" style={{ paddingBottom: '100px' }}>
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-[#a6a39d] mt-10">
            <p className="text-sm">Chào {user.user_metadata?.name || user.email}!</p>
            <p className="text-sm">Hãy bắt đầu cuộc trò chuyện với AI</p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id}>
            {message.role === 'user' ? (
              // User message bubble - chính xác theo Figma
              <div className="flex items-start justify-end space-x-2 mb-3">
                <Button variant="ghost" size="icon" className="h-5 w-5 mt-2 p-0 flex-shrink-0">
                  <Edit className="h-3 w-3 text-[#101010]" />
                </Button>
                <div className="bg-[#fffbf2] rounded-xl px-3 py-2 max-w-[260px] rounded-br-sm">
                  <p className="text-[14px] leading-[18px] text-[#403e39] font-normal">
                    {message.content}
                  </p>
                </div>
              </div>
            ) : (
              // AI response bubble - chính xác theo Figma
              <div className="bg-white rounded-xl px-3 py-2 max-w-[315px] rounded-bl-sm mb-3">
                <div 
                  className="text-[14px] leading-[18px] text-[#403e39] font-normal mb-3 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: message.content
                      // Bold text: **text** -> <strong>text</strong>
                      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                      // Italic text: *text* -> <em>text</em>
                      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
                      // Code blocks: ```code``` -> <code>code</code>
                      .replace(/```([^`]+)```/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-xs">$1</code>')
                      // Inline code: `code` -> <code>code</code>
                      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-xs">$1</code>')
                      // Line breaks
                      .replace(/\n/g, '<br>')
                      // Bullet points: * item -> • item
                      .replace(/^\* (.+)$/gm, '• $1')
                      // Numbers: 1. item -> 1. item (keep as is)
                      .replace(/^(\d+)\. (.+)$/gm, '$1. $2')
                  }}
                />

                {/* Separator line - đúng màu theo Figma */}
                <div className="w-full h-[1px] bg-[#e9e4d6] mb-3"></div>

                {/* Action buttons - đúng layout theo Figma */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                      <ThumbsUp className="h-4 w-4 text-[#101010]" strokeWidth={1.5} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                      <ThumbsDown className="h-4 w-4 text-[#101010]" strokeWidth={1.5} />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent flex items-center space-x-1"
                    onClick={() => handleCopyMessage(message.content)}
                  >
                    <Copy className="h-4 w-4 text-[#101010]" strokeWidth={1.5} />
                    <span className="text-[14px] text-[#101010] font-normal">Copy</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="bg-white rounded-xl rounded-bl-sm px-3 py-2 max-w-[315px] mb-3">
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 bg-[#a6a39d] rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-[#a6a39d] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1.5 h-1.5 bg-[#a6a39d] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Input Field - chính xác theo Figma */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-[375px] px-4 pb-4 pt-2 bg-[#f2efe4] z-10 border-t border-[#e9e4d6]">
        <div className="relative bg-white border border-[#e9e4d6] rounded-xl h-[60px]">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me anything..."
            className="h-full bg-transparent border-0 rounded-xl text-[16px] text-[#101010] placeholder:text-[#a6a39d] px-4 pr-14 font-['Rubik']"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            variant="ghost"
            size="icon"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
          >
            <Send className="h-5 w-5 text-[#a6a39d]" />
          </Button>
        </div>
      </div>
    </div>
  )
}
