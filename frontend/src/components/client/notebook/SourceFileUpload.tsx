'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ActionTrigger from '../ActionTrigger'
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import axios from 'axios'
import { SingleFile } from '@/types/fileStorage.interface'

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
  const [files, setFiles] = useState<SingleFile[]>([])

  const params = useParams<{ noteId: string, conversationId: string }>()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/files/${params.noteId}`)
        setFiles(res.data)
      } catch (error) {
        console.error("Failed to fetch files:", error);
      }
      
    }
    fetchData()
  }, [])
  const handleAddFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const formData = new FormData();
    Array.from(e.target.files).forEach(file => formData.append("files", file))
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/files/upload_files/${params.noteId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      console.log(res.data.upload_files)
    } catch (err) {
      console.log(err)
    }
  }


  const handleDelete = async () => {
    return;
  }

  const toggleSelectFile = (id: string) => {
    // setSelectedFiles(prev => 
    //   prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    // )
  }

  const toggleSelectAll = () => {
    // if (selectedFiles.length === files.length) setSelectedFiles([]) 
    // else setSelectedFiles(files.map(f => f.id))
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
            key={file.public_id}
            onClick={() => { setActionOpen(true); setSelectedId(file.public_id) }}
            className={`flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition ${
              selectedId === file.public_id ? 'bg-gray-100' : 'hover:bg-gray-50'
            }`}
          >
            <div className='w-5 h-5'>
              {(actionOpen && file.public_id === selectedId)
                ? <ActionTrigger className="text-gray-500 hover:bg-gray-200 rounded-full" apiLink={`files`} onDelete={handleDelete} id={file.public_id}/>
                : <img src={icons.find(icon => icon.format === file.format)?.source} alt="file icon" className="w-5 h-5 mr-2"/>}
            </div>

            <span className="text-gray-700 text-sm">{file.filename}</span>
            <Checkbox className="cursor-pointer" checked={selectedFiles.includes(file.public_id)} onCheckedChange={() => toggleSelectFile(file.public_id)}/>
          </div>
        ))}
      </div>
    </div>
  )
}
