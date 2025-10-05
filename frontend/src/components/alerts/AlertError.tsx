'use client'
import { useState } from 'react'
import { CircleAlertIcon, XIcon } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useTimeout } from 'usehooks-ts'

export default function AlertError({title, message} : {title: string, message: string}) {
  const [visible, setVisible] = useState(true)

  const hide = () => {
    setVisible(false)
  }

  useTimeout(hide, 5000)
  if (!visible) return null
  return (
    <div className="w-full p-6 flex justify-center">
      <div className="w-full max-w-lg">
        <Alert className='flex justify-between border-red-500 text-red-700 bg-red-50'>
          <CircleAlertIcon className="text-red-600 mt-0.5"/>
          <div className='flex flex-1 flex-col gap-1'>
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>
              {message}
            </AlertDescription>
          </div>
          <button className='cursor-pointer ml-2 text-red-700 hover:text-red-900' 
                  onClick={() => setVisible(false)}>
            <XIcon className='size-5' />
            <span className='sr-only'>Close</span>
          </button>
        </Alert>
      </div>
    </div>
  )
}