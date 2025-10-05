'use client'

// Hook Library
import { useState, useEffect, type FormEventHandler } from 'react'
import { useParams } from 'next/navigation'

// shadcn.io/ai
import { Conversation, ConversationContent, } from "@/components/ui/shadcn-io/ai/conversation"
import { Message, MessageContent } from "@/components/ui/shadcn-io/ai/message"
import { Response } from "@/components/ui/shadcn-io/ai/response"
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ui/shadcn-io/ai/prompt-input';


// Component
import AlertError from '@/components/alerts/AlertError';

// Packages
import axios from 'axios';
import * as z from 'zod';
import { MessageItem } from '@/types/conversation.interface'

export default function ConversationBox() {

  // Lấy params từ môi trường
  const params = useParams<{noteId: string; conversationId: string}>();

  // Lấy dữ liệu cuộc hội thoại
  const [messages, setMessages] = useState<MessageItem[]>([])
  useEffect(() => {
    const fetchData = async () => {
      const convesationData = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/conversations/${params.conversationId}`);
      setMessages(convesationData.data.messages);
    }

    fetchData()
    .catch(console.error)
  }, [params.conversationId])


  // Alert
  const [status, setStatus] = useState<'ready' | 'submitted' | 'streaming' | 'error'>('ready');
  const [error, setError] = useState<string | null>(null);

  // Prompt Input Handle
  const schema = z.object({
    query: z.string().min(1, 'Vui lòng nhập câu hỏi'),
  });
  const [text, setText] = useState('');

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const result = schema.safeParse({ query: text });
    if (!result.success) {
      setError('Vui lòng nhập câu hỏi hợp lệ');
      return;
    }

    setError(null);

    // Tạo câu hỏi mới
    const newMessage: MessageItem = {
      id: crypto.randomUUID(),
      role: "user",
      parts: [{ type: "text", text } ],
      timestamp: new Date(),
    };

    try {
      setTimeout(() => setStatus('streaming'), 100);
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/conversations/${params.conversationId}`,
        newMessage,
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log('Response:', res.data);
      setText('');
      setStatus('ready');
    } catch (err) {
      console.error('Error posting:', err);
      setStatus('error');
      setError('Không thể kết nối máy chủ, vui lòng thử lại.');
    }
  };


  return (
    <div className="relative w-full h-screen flex justify-center">
      {(error) && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
          {error && <AlertError title="Lỗi" message={error} />}
        </div>
      )}
      {/* Chat container */}
      <div className="w-full max-w-3xl h-full flex flex-col">
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

        {/* Prompt cố định đáy màn hình */}
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