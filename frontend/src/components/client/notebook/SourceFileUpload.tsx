'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import ActionTrigger from '../ActionTrigger'
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import axios from 'axios'

interface SourceFile {
  id: string
  title: string
  format: string
  file: File
}

const initialFiles: SourceFile[] = [
  { id: crypto.randomUUID(), title: "Project Proposal", format: "pdf", file: new File(["Project Proposal content"], "Project Proposal.pdf", { type: "application/pdf" }) },
  { id: crypto.randomUUID(), title: "Team Meeting Notes", format: "docx", file: new File(["Team Meeting Notes content"], "Team Meeting Notes.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }) },
  { id: crypto.randomUUID(), title: "Product Roadmap", format: "pptx", file: new File(["Product Roadmap content"], "Product Roadmap.pptx", { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" }) },
  { id: crypto.randomUUID(), title: "Financial Report", format: "xlsx", file: new File(["Financial Report content"], "Financial Report.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }) },
  { id: crypto.randomUUID(), title: "Research Summary", format: "txt", file: new File(["Research Summary content"], "Research Summary.txt", { type: "text/plain" }) },
  { id: crypto.randomUUID(), title: "Marketing Plan", format: "md", file: new File(["Marketing Plan content"], "Marketing Plan.md", { type: "text/markdown" }) },
]

const icons = [
  { format: 'pdf', source: '/icon/pdf.png'},
  { format: 'docx', source: '/icon/docx.png'},
  { format: 'pptx', source: '/icon/pptx.png'},
  { format: 'xlsx', source: '/icon/xlsx.png'},
  { format: 'txt', source: '/icon/txt.png'},
  { format: 'md', source: '/icon/md.png'},
]

export default function SourceFileUpload() {
  const [actionOpen, setActionOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [files, setFiles] = useState<SourceFile[]>(initialFiles)

  const params = useParams<{ noteId: string, conversationId: string }>()

  const handleAddFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
     
  }


  const handleDelete = async () => {
    return;
  }

  const toggleSelectFile = (id: string) => {
    
  }

  const toggleSelectAll = () => {
    
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-3 mb-1 sticky top-0 z-10 border-b">
        <p className="text-lg font-semibold text-gray-800">Source</p>
      </div>

      <div className="flex flex-row space-x-2 p-2">
        <label className="w-1/2 h-10 flex justify-center items-center gap-1 px-3 py-1.5 text-sm rounded-3xl cursor-pointer border border-gray-300 hover:bg-gray-100">
          <Input type="file" className="hidden" multiple onChange={handleAddFile}/>
          <Plus size={16} /> Thêm
        </label>
        <button className="w-1/2 h-10 flex justify-center items-center gap-1 px-3 py-1.5 text-sm rounded-3xl cursor-pointer border border-gray-300 hover:bg-gray-100">
          <Search size={16} /> Khám phá 
        </button>
      </div>

      <div className="flex justify-between items-center px-4 py-1 bg-white z-10">
        <span className="text-sm text-gray-700">Select all sources</span>
        <Checkbox className="cursor-pointer" checked={selectedFiles.length === files.length} onCheckedChange={toggleSelectAll}/>
      </div>

      <div className="flex-1 overflow-y-auto space-y-1 p-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {files.map(file => (
          <div
            key={file.id}
            onClick={() => { setActionOpen(true); setSelectedId(file.id) }}
            className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition ${
              selectedId === file.id ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`}
          >
            <div className='w-5 h-5'>
              {(actionOpen && file.id === selectedId)
                ? <ActionTrigger className="text-gray-500 hover:bg-gray-200 rounded-full" apiLink={`files`} onDelete={handleDelete} id={file.id}/>
                : <img src={icons.find(icon => icon.format === file.format)?.source} alt="file icon" className="w-5 h-5 mr-2"/>}
            </div>

            <span className="text-gray-700 text-sm">{file.title}</span>
            <Checkbox className="cursor-pointer" checked={selectedFiles.includes(file.id)} onCheckedChange={() => toggleSelectFile(file.id)}/>
          </div>
        ))}
      </div>
    </div>
  )
}
