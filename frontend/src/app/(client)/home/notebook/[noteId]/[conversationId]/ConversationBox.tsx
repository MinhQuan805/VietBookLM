'use client'

// React hooks
import { useState, useEffect, type FormEventHandler } from 'react'
import { useParams } from 'next/navigation'

// shadcn.io/ai components
import { Conversation, ConversationContent } from "@/components/ui/shadcn-io/ai/conversation"
import { Message, MessageContent } from "@/components/ui/shadcn-io/ai/message"
import { Response } from "@/components/ui/shadcn-io/ai/response"
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
} from '@/components/ui/shadcn-io/ai/prompt-input'

// Custom alert component
import AlertError from '@/components/alerts/AlertError'

// Packages
import axios from 'axios';
import * as z from 'zod';
import { MessageItem } from '@/types/conversation.interface'

export default function ConversationBox() {

  // Get route parameters (noteId and conversationId)
  const params = useParams<{noteId: string; conversationId: string}>();

  // State to store all messages of the conversation
  const [messages, setMessages] = useState<MessageItem[]>([])
  // Fetch conversation messages from API when conversationId changes
  useEffect(() => {
    const fetchData = async () => {
      const convesationData = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/conversations/${params.conversationId}`);
      setMessages(convesationData.data.messages);
    }

    fetchData().catch(console.error)
  }, [params.conversationId])

  // Alert state for error messages
  const [status, setStatus] = useState<'ready' | 'submitted' | 'streaming' | 'error'>('ready');
  const [error, setError] = useState<string | null>(null);

  // Validation schema for user input using zod
  const schema = z.object({
    query: z.string().min(1, 'Please enter a query'),
  });

  // State for user input text
  const [text, setText] = useState('');

  // Handle form submission
  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    // Validate input
    const result = schema.safeParse({ query: text });
    if (!result.success) {
      setError('Please enter a valid query');
      return;
    }

    setError(null);

    // Create a new message object
    const newMessage: MessageItem = {
      id: crypto.randomUUID(),
      role: "user",
      parts: [{ type: "text", text }],
      timestamp: new Date(),
    };

    try {
      // Set status to streaming for UI feedback
      setTimeout(() => setStatus('streaming'), 100);

      // Send the new message to API
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/conversations/${params.conversationId}`,
        newMessage,
        { headers: { 'Content-Type': 'application/json' } }
      );

      // Clear input and reset status
      setText('');
      setStatus('ready');
    } catch (err) {
      console.error('Error posting:', err);
      setStatus('error');
      setError('Cannot connect to server, please try again.');
    }
  };

  return (
    <div className="relative w-full h-screen flex justify-center">

      {/* Display error alerts */}
      {error && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
          <AlertError title="Error" message={error} />
        </div>
      )}

      {/* Main chat container */}
      <div className="w-full max-w-3xl h-full flex flex-col">

        {/* Conversation messages */}
        <Conversation className="flex-1 overflow-y-auto p-4 pb-32">
          <ConversationContent>
            {messages.map((message) => (
              <Message from={message.role} key={message.id}>
                <MessageContent>
                  {message.parts?.map((part, i) => {
                    switch (part.type) {
                      case "text":
                        return (
                          <Response key={`${message.id}-${i}`}>
                            {part.text}
                          </Response>
                        );
                      default:
                        return null;
                    }
                  })}
                </MessageContent>
              </Message>
            ))}
          </ConversationContent>
        </Conversation>

        {/* Fixed prompt input at the bottom */}
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-3xl px-4 p-4 flex flex-col gap-4">
          <PromptInput onSubmit={handleSubmit} className="rounded-3xl">
            <PromptInputTextarea
              className='ml-1 mt-1'
              value={text}
              onChange={(e: any) => setText(e.target.value)}
              placeholder="Ask me anything..."
            />

            <PromptInputToolbar className='justify-end'>
              <PromptInputSubmit className='rounded-4xl mr-1 mb-1' status={status} disabled={!text} />
            </PromptInputToolbar>
          </PromptInput>
        </div>
      </div>
    </div>
  )
}