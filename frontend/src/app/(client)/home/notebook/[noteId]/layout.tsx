'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'

import SourceFileUpload from '@/components/client/notebook/SourceFileUpload'
import HistoryConversation from '@/components/client/notebook/HistoryConversation'

interface Conversation {
  id: string
  title: string
}

export default function NotebookLayout({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const params = useParams<{ noteId: string }>()

  useEffect(() => {
    if (!params?.noteId) return
    const fetchData = async () => {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/conversations/getAll/${params.noteId}`
      )
      setConversations(res.data)
    }
    fetchData()
  }, [params.noteId])

  return (
    <div className="flex h-screen p-3 gap-4">
      {/* Sidebar */}
      <div className="w-1/4 flex flex-col gap-3">
        <div className="h-1/2 border border-gray-200 rounded-3xl">
          <SourceFileUpload />
        </div>
        <div className="flex-1 overflow-y-auto h-1/2 border border-gray-200 rounded-3xl">
          <HistoryConversation
            conversations={conversations}
            setConversations={setConversations}
          />
        </div>
      </div>

      {/* Main conversation box */}
      <div className="flex-1 w-1/2">{children}</div>

      <div className="w-1/4 bg-gray-50 rounded-xl" />
    </div>
  )
}
