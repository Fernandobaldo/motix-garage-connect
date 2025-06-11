
-- First, let's check if there are any problematic policies and fix them
-- Drop existing policies that might be causing recursion
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can join conversations" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can leave conversations" ON public.chat_participants;

-- Enable RLS on chat_participants if not already enabled
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

-- Create proper policies that don't cause recursion
-- Allow users to view their own participation records
CREATE POLICY "Users can view own participation" 
ON public.chat_participants 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to insert their own participation records
CREATE POLICY "Users can join conversations" 
ON public.chat_participants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own participation records
CREATE POLICY "Users can leave conversations" 
ON public.chat_participants 
FOR DELETE 
USING (auth.uid() = user_id);

-- Also ensure chat_conversations has proper policies
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- Drop and recreate chat_conversations policies to avoid any issues
DROP POLICY IF EXISTS "Users can view conversations they participate in" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can create conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Users can update conversations they participate in" ON public.chat_conversations;

-- Create safe policies for chat_conversations
CREATE POLICY "Users can view conversations they participate in" 
ON public.chat_conversations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants 
    WHERE conversation_id = chat_conversations.id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create conversations" 
ON public.chat_conversations 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update conversations they participate in" 
ON public.chat_conversations 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants 
    WHERE conversation_id = chat_conversations.id 
    AND user_id = auth.uid()
  )
);

-- Ensure chat_messages has proper policies
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop and recreate chat_messages policies
DROP POLICY IF EXISTS "Users can view messages in conversations they participate in" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON public.chat_messages;

CREATE POLICY "Users can view messages in conversations they participate in" 
ON public.chat_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.chat_participants 
    WHERE conversation_id = chat_messages.conversation_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.chat_participants 
    WHERE conversation_id = chat_messages.conversation_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own messages" 
ON public.chat_messages 
FOR UPDATE 
USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own messages" 
ON public.chat_messages 
FOR DELETE 
USING (auth.uid() = sender_id);
