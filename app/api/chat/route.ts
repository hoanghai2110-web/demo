
import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
})

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Lấy token từ Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    // Tạo supabase client với token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    })

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Lưu tin nhắn user vào database
    const { error: userMessageError } = await supabase
      .from('messages')
      .insert({
        user_id: user.id,
        content: message,
        role: 'user'
      })

    if (userMessageError) {
      console.error('Error saving user message:', userMessageError)
      return NextResponse.json(
        { error: 'Failed to save user message' },
        { status: 500 }
      )
    }

    // Gọi Gemini AI với API mới
    const model = 'gemini-2.0-flash-exp'
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: message,
          },
        ],
      },
    ]

    const response = await genAI.models.generateContent({
      model,
      contents,
    })

    const aiResponse = response.text

    // Lưu phản hồi AI vào database
    const { error: aiMessageError } = await supabase
      .from('messages')
      .insert({
        user_id: user.id,
        content: aiResponse,
        role: 'assistant'
      })

    if (aiMessageError) {
      console.error('Error saving AI message:', aiMessageError)
      return NextResponse.json(
        { error: 'Failed to save AI message' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: aiResponse,
      success: true
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
