
'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { ArrowLeft, User, Bell, Globe, FileText, LogOut, ChevronRight } from 'lucide-react'
import { supabase } from "@/lib/supabase"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }
      setUser(session.user)
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error logging out:', error)
    } else {
      router.push('/login')
    }
  }

  const handleBackToChat = () => {
    router.push('/chat')
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-[#f2efe4] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#262521]"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const menuItems = [
    {
      icon: User,
      label: "Edit Profile",
      hasArrow: true,
      onClick: () => {}
    },
    {
      icon: Bell,
      label: "Notifications",
      hasSwitch: true,
      switchValue: notificationsEnabled,
      onSwitchChange: setNotificationsEnabled
    },
    {
      icon: Globe,
      label: "Languages",
      hasArrow: true,
      onClick: () => {}
    },
    {
      icon: FileText,
      label: "Terms of service",
      hasArrow: true,
      onClick: () => {}
    },
    {
      icon: FileText,
      label: "Privacy Policy",
      hasArrow: true,
      onClick: () => {}
    },
    {
      icon: LogOut,
      label: "Log out",
      hasArrow: true,
      onClick: handleLogout
    }
  ]

  return (
    <div className="min-h-screen bg-[#f2efe4] font-['Rubik'] max-w-[375px] mx-auto">
      {/* Header - chính xác theo Figma */}
      <header className="flex items-center justify-between px-6 py-4 h-[60px]">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 p-0"
          onClick={handleBackToChat}
        >
          <ArrowLeft className="h-6 w-6 text-[#101010]" strokeWidth={2} />
        </Button>
        
        <h1 className="text-[15px] font-medium text-[#101010]">Profile</h1>
        
        <div className="w-6"></div>
      </header>

      {/* Profile Section - chính xác theo Figma */}
      <div className="flex flex-col items-center px-6 pt-8 pb-12">
        {/* Avatar - theo đúng Figma design */}
        <div className="w-[120px] h-[120px] rounded-[24px] bg-[#e9e4d6] flex items-center justify-center mb-6">
          {user.user_metadata?.avatar_url ? (
            <img 
              src={user.user_metadata.avatar_url} 
              alt="Avatar" 
              className="w-full h-full rounded-[24px] object-cover"
            />
          ) : (
            <div className="w-[80px] h-[80px] rounded-full bg-[#403e39] flex items-center justify-center">
              <User className="h-[40px] w-[40px] text-white" />
            </div>
          )}
        </div>

        {/* User Info - chính xác theo Figma */}
        <div className="text-center">
          <h2 className="text-[24px] font-medium text-[#262521] leading-[30px] mb-2">
            {user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
          </h2>
          <p className="text-[16px] text-[#403e39] leading-[20px]">
            @{user.email || 'user@example.com'}
          </p>
        </div>
      </div>

      {/* Menu Items - chính xác theo Figma */}
      <div className="px-0">
        {menuItems.map((item, index) => (
          <div 
            key={index}
            className="flex items-center justify-between px-6 py-6 border-b border-[#e9e4d6] bg-[#f2efe4]"
            onClick={item.onClick}
            style={{ cursor: item.onClick ? 'pointer' : 'default' }}
          >
            <div className="flex items-center space-x-3">
              <item.icon className="h-6 w-6 text-[#403e39]" strokeWidth={1.5} />
              <span className="text-[15px] text-[#403e39] leading-[20px]">
                {item.label}
              </span>
            </div>

            {/* Right side - Arrow hoặc Switch */}
            <div className="flex items-center">
              {item.hasSwitch ? (
                <div 
                  className={`relative w-[38px] h-6 rounded-full transition-colors cursor-pointer ${
                    item.switchValue ? 'bg-[#101010]' : 'bg-[#e9e4d6]'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    item.onSwitchChange?.(!item.switchValue)
                  }}
                >
                  <div 
                    className={`absolute top-[3px] w-[18px] h-[18px] bg-[#f2efe4] rounded-full transition-transform ${
                      item.switchValue ? 'translate-x-[17px]' : 'translate-x-[3px]'
                    }`}
                  />
                </div>
              ) : item.hasArrow ? (
                <ChevronRight className="h-6 w-6 text-[#403e39]" strokeWidth={1.5} />
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
