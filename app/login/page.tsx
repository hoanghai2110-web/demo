
'use client'

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Kiểm tra xem user đã đăng nhập chưa
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/chat')
      }
    }
    checkUser()

    // Lắng nghe auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/chat')
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/chat`
        }
      })

      if (error) {
        console.error('Google login error:', error.message)
        alert('Đăng nhập thất bại: ' + error.message)
      }
    } catch (error) {
      console.error('Google login error:', error)
      alert('Có lỗi xảy ra khi đăng nhập')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f2efe4] flex flex-col items-center justify-center p-6 font-['Rubik']">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Icon */}
        <div className="flex justify-center mb-12">
          <div className="relative">
            <div className="w-4 h-4 bg-[#000000] rounded-full absolute top-0 left-1/2 transform -translate-x-1/2"></div>
            <div className="w-4 h-4 bg-[#000000] rounded-full absolute left-0 top-1/2 transform -translate-y-1/2"></div>
            <div className="w-4 h-4 bg-[#000000] rounded-full absolute right-0 top-1/2 transform -translate-y-1/2"></div>
            <div className="w-4 h-4 bg-[#000000] rounded-full absolute bottom-0 left-1/2 transform -translate-x-1/2"></div>
            <div className="w-8 h-8"></div>
          </div>
        </div>

        {/* Illustration */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            {/* Floating icons */}
            <div className="absolute -top-4 -left-8">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#afaa96]">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
              </svg>
            </div>
            
            <div className="absolute -top-2 right-4">
              <div className="bg-[#ffffff] rounded-full px-3 py-2 border border-[#afaa96]">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-[#afaa96] rounded-full"></div>
                  <div className="w-1 h-1 bg-[#afaa96] rounded-full"></div>
                  <div className="w-1 h-1 bg-[#afaa96] rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="absolute top-4 -right-8">
              <div className="bg-[#000000] rounded-lg p-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-[#afaa96]">
                  <path d="M14 9V5a3 3 0 0 0-6 0v4a3 3 0 0 0-6 0v4a3 3 0 0 0 6 0v-4a3 3 0 0 0 6 0z" fill="currentColor"/>
                </svg>
              </div>
            </div>

            {/* Main elephant character */}
            <div className="relative w-32 h-40">
              {/* Elephant body */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-20 bg-[#afaa96] rounded-t-full"></div>
              
              {/* Elephant head */}
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-20 h-16 bg-[#afaa96] rounded-full"></div>
              
              {/* Elephant ears */}
              <div className="absolute top-6 left-2 w-12 h-16 bg-[#afaa96] rounded-full transform -rotate-12"></div>
              <div className="absolute top-6 right-2 w-12 h-16 bg-[#afaa96] rounded-full transform rotate-12"></div>
              
              {/* Elephant trunk */}
              <div className="absolute top-16 left-1/2 transform -translate-x-1/2 translate-x-2 w-3 h-8 bg-[#afaa96] rounded-full"></div>
              
              {/* Eyes */}
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 -translate-x-2 w-2 h-2 bg-[#000000] rounded-full"></div>
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 translate-x-2 w-2 h-2 bg-[#000000] rounded-full"></div>
              
              {/* Arms */}
              <div className="absolute top-20 -left-4 w-8 h-3 bg-[#000000] rounded-full transform -rotate-45"></div>
              <div className="absolute top-20 -right-4 w-8 h-3 bg-[#000000] rounded-full transform rotate-45"></div>
              
              {/* Hands */}
              <div className="absolute top-16 -left-6 w-4 h-4 bg-[#000000] rounded-full"></div>
              <div className="absolute top-16 -right-6 w-4 h-4 bg-[#000000] rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Welcome text */}
        <div className="text-center space-y-4 mb-8">
          <h1 className="text-3xl font-bold text-[#000000]">
            Welcome to Chatty Charm
          </h1>
          <p className="text-[#000000] text-lg">
            Sign in with Google to continue<br />
            your journey!
          </p>
        </div>

        {/* Google Login Button */}
        <Button 
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full h-14 bg-[#ffffff] hover:bg-[#f8f9fa] text-[#000000] border border-[#dadce0] rounded-2xl text-lg font-medium mt-8 disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {isLoading ? (
            'Signing in...'
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" className="flex-shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
