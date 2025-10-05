"use client"

import { useState } from "react"
import { CheckCircle2Icon, XIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useTimeout } from "usehooks-ts"

export default function AlertSuccess({
  title,
  message,
}: {
  title: string
  message: string
}) {
  const [visible, setVisible] = useState(true)
  
  useTimeout(() => setVisible(false), 5000)

  if (!visible) return null

  return (
    <div className="w-full p-6 flex justify-center">
      <div className="w-full max-w-lg">
        <Alert
          variant="default"
          className="flex justify-between items-start border-green-500 text-green-700 bg-green-50"
        >
          <CheckCircle2Icon className="text-green-600 mt-0.5" />
          <div className="flex flex-1 flex-col gap-1 ml-3">
            <AlertTitle>{title}</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </div>
          <button
            className="cursor-pointer ml-2 text-green-700 hover:text-green-900"
            onClick={() => setVisible(false)}
          >
            <XIcon className="size-5" />
            <span className="sr-only">Close</span>
          </button>
        </Alert>
      </div>
    </div>
  )
}
