'use client'

// React hooks
import { useRouter } from "next/navigation"
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { CirclePlus, MoreVertical } from 'lucide-react'
import axios from 'axios'
import ActionTrigger from "@/components/client/ActionTrigger"

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
      // If no conversationId in URL or it's "1", create a new conversation
      if (!params.conversationId || params.conversationId === "1") {
        createConversation()
      }
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

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/conversations/delete/${id}`);
      
      // Filter remained conversation 
      const updatedConversations = conversations.filter(c => c.id !== id);
      setConversations(updatedConversations);

      var newId = selectedId
      if (selectedId === id) {
        if (updatedConversations.length > 0) {
          newId = updatedConversations[0].id;
          setSelectedId(newId);
          router.replace(`/home/notebook/${params.noteId}/${newId}`);
        }
        else {
          // When no conversation left, create a new one
          await createConversation();
          return;
        } 
      }

    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };


  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center p-3 mb-2 sticky top-0 bg-white z-10 border-b rounded-3xl">
        <p className="text-lg font-semibold text-gray-800">History</p>
        <CirclePlus
          className="text-gray-500 cursor-pointer hover:text-blue-500 transition-colors"
          size={22}
          onClick={createConversation}
        />
      </div>

      {/* Conversation list */}
      <div
        className="flex-1 overflow-y-auto space-y-1 p-3"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {conversations.map(item => (
          <div
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition ${
              selectedId === item.id ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`}
          >
            <span className="text-gray-700 text-sm">{item.title ?? "New chat"}</span>
              <ActionTrigger className="text-gray-500" apiLink={`conversations`} onDelete={() => handleDelete(item.id)} id={item.id}/>
          </div>
        ))}
      </div>
    </div>
  )
}