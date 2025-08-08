
-- Drop existing table and policies if they exist
DROP TABLE IF EXISTS messages CASCADE;

-- Create messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable RLS for testing
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Create policies (they will be created fresh since we dropped the table)
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_messages_user_id_created_at ON messages(user_id, created_at);

-- Enable Google OAuth in Supabase Auth settings
-- Go to Authentication > Settings > Auth Providers
-- Enable Google and configure with your Google OAuth credentials
