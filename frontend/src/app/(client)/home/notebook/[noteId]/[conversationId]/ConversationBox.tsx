'use client'

// React hooks
import { useState, useEffect, type FormEventHandler } from 'react'
import { useParams } from 'next/navigation'
import { Fragment } from 'react';
import { useChat } from '@ai-sdk/react';
import { UIMessage } from '@ai-sdk/react';
import { DefaultChatTransport, UIMessagePart } from 'ai';
// shadcn.io/ai components
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ui/shadcn-io/ai/conversation"
import { Message, MessageContent } from "@/components/ui/shadcn-io/ai/message"
import { Response } from "@/components/ui/shadcn-io/ai/response"
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
} from '@/components/ui/shadcn-io/ai/prompt-input'
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ui/shadcn-io/ai/source';
import {
  Action,
  Actions
} from '@/components/ui/shadcn-io/ai/actions';
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ui/shadcn-io/ai/reasoning';

// Icon
import { CopyIcon, Loader, RefreshCcwIcon } from 'lucide-react';

// Custom alert component
import AlertError from '@/components/alerts/AlertError'

// Packages
import axios from 'axios';
import * as z from 'zod';

// Interface
import { MessageItem } from '@/types/conversation.interface'

export default function ConversationBox() {

  const params = useParams<{noteId: string; conversationId: string}>();

  // State to store all messages of the conversation
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
        // Include all chat messages + conversation ID for backend context
        body: (messages: UIMessage[]) => ({
          messages,
          conversationId: params.conversationId,
        }),
    }),
  });

  // Fetch conversation messages from API
  useEffect(() => {
    const fetchData = async () => {
      const conversationData = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/conversations/${params.conversationId}`)
      setMessages(conversationData.data.messages);
    }

    fetchData()
      .catch(console.error)
  }, [])

  // Alert state for error messages
  const [error, setError] = useState<string | null>(null);

  // Validation schema for user input using zod
  const schema = z.object({
    query: z.string().min(1, 'Please enter a query'),
  });

  const [text, setText] = useState('');

  // Handle form submission
  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

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
      parts: [{ type: "text", text: text}],
    };

    try {
      // Send the new message to API
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/conversations/${params.conversationId}`,
        newMessage,
        { headers: { 'Content-Type': 'application/json' } }
      );

      sendMessage({ text: text});
      setText('');
    } catch (err) {
      console.error('Error posting:', err);
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
              <div key={message.id}>
                {message.role === 'assistant' && message.parts.filter((part) => part.type === 'source-url').length > 0 && (
                  <Sources>
                    <SourcesTrigger
                      count={
                        message.parts.filter(
                          (part) => part.type === 'source-url',
                        ).length
                      }
                    />
                    {message.parts.filter((part) => part.type === 'source-url').map((part, i) => (
                      <SourcesContent key={`${message.id}-${i}`}>
                        <Source
                          key={`${message.id}-${i}`}
                          href={part.url}
                          title={part.url}
                        />
                      </SourcesContent>
                    ))}
                  </Sources>
                )}
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case 'text':
                      return (
                        <Fragment key={`${message.id}-${i}`}>
                          <Message from={message.role}>
                            <MessageContent>
                              <Response>
                                {part.text}
                              </Response>
                            </MessageContent>
                          </Message>
                          {message.role === 'assistant' && i === messages.length - 1 && (
                            <Actions className="mt-2">
                              <Action
                                label="Retry"
                              >
                                <RefreshCcwIcon className="size-3" />
                              </Action>
                              <Action
                                onClick={() =>
                                  navigator.clipboard.writeText(part.text)
                                }
                                label="Copy"
                              >
                                <CopyIcon className="size-3" />
                              </Action>
                            </Actions>
                          )}
                        </Fragment>
                      );
                    case 'reasoning':
                      return (
                        <Reasoning
                          key={`${message.id}-${i}`}
                          className="w-full"
                          isStreaming={status === 'streaming' && i === message.parts.length - 1 && message.id === messages.at(-1)?.id}
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            ))}
            {status === 'submitted' && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
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