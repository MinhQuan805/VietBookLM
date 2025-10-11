'use client'

// React hooks
import { useRouter } from "next/navigation"
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { MoreVertical } from 'lucide-react'
import axios from 'axios'

interface Conversation {
  id: string
  title: string
}
export default function HistoryConversation({ conversations }: { conversations: Conversation[]} ) {
  const router = useRouter()
  const params = useParams<{ noteId: string, conversationId: string }>()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const handleClick = (conversation_id: string) => {
    setSelectedId(conversation_id)
    router.replace(`/home/notebook/${params.noteId}/${conversation_id}`)
  }

  useEffect(() => {
      setSelectedId(params.conversationId)
    }, [params.conversationId])

  return (
    <div className="p-4">
      <div className="flex">
        <h2 className="w-1/2 font-medium text-gray-800 mb-3">History</h2>
        <MoreVertical className=" justify-end text-gray-500" size={16} />
      </div>

      <div className="flex flex-col space-y-1">
        {conversations.map((item) => (
          <div
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition 
              ${selectedId === item.id ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
          >
            <span className="text-gray-700 text-sm">{item.title}</span>
            <MoreVertical size={16} className="text-gray-500" />
          </div>
        ))}
      </div>
    </div>
  )
}