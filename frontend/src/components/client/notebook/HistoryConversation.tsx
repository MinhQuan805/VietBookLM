'use client'

// React hooks
import { useRouter } from "next/navigation"
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { CirclePlus, MoreVertical } from 'lucide-react'
import axios from 'axios'

interface Conversation {
  id: string
  title: string
}
interface Props{
  conversations: Conversation[],
  setConversations: (conversations: Conversation[]) => void
}
export default function HistoryConversation({conversations, setConversations} : Props) {
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

  const createConversation = async () => {
    const resCon = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/conversations/create/${params.noteId}`, 
        {},
        { headers: { 'Content-Type': 'application/json' } }
      );
      const newConversation: Conversation = {
        id: resCon.data.conversationId,
        title: resCon.data.title
      };
      setConversations([newConversation, ...conversations]);
      setSelectedId(newConversation.id)
      router.push(`/home/notebook/${params.noteId}/${newConversation.id}`)
  }
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-3 p-2">
        <h2 className="font-medium text-gray-800">History</h2>
        <CirclePlus 
          className="text-gray-500 cursor-pointer hover:text-blue-500 transition-colors"
          size={16}
          onClick={createConversation}
        />
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