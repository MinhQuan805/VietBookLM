"use client"

import * as React from "react"
import { LockIcon, Plus } from "lucide-react"
import { CiStickyNote } from "react-icons/ci"
import { useRouter } from "next/navigation"
import axios from "axios"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import AlertError from "@/components/alerts/AlertError"

export default function CreateNote() {
  return (
    <div className="flex items-center justify-center w-full h-screen">
      <DrawerResponsive />
    </div>
  )
}

function DrawerResponsive() {
  const [open, setOpen] = React.useState(false)

  const triggerCard = (
    <div className="flex flex-col items-center justify-center w-60 h-48 p-8 border border-gray-200 rounded-xl cursor-pointer hover:shadow-md transition-shadow">
      <div className="flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-full">
        <Plus className="w-6 h-6 text-indigo-500" strokeWidth={2.5} />
      </div>
      <p className="mt-3 font-medium text-gray-700">Tạo sổ ghi chú mới</p>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerCard}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tạo sổ ghi chú mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin cho sổ ghi chú của bạn bên dưới.
          </DialogDescription>
        </DialogHeader>
        <NoteForm />
      </DialogContent>
    </Dialog>
  )
}

const FormSchema = z.object({
  title: z.string().min(1, { message: "Vui lòng nhập tiêu đề" }),
  password: z.string().optional(),
  avatar: z.string().optional(),
})

function NoteForm() {
  const router = useRouter()
  const [error, setError] = React.useState<string | null>(null)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      password: "",
      avatar: "",
    },
  })

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    try {
      const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/notebooks/create`, data)
      router.push(`/notebook/${res.data.notebookId}`)
    } catch (err: any) {
      console.error(err)
      setError("Không thể tạo sổ ghi chú. Vui lòng thử lại sau.")
    }
  }

  return (
    <>
      {error && (
        <div className="fixed top-4 right-4 z-50">
          <AlertError title="Lỗi" message={error} />
        </div>
      )}

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid items-start gap-6 w-full max-w-sm"
        >
          {/* TITLE */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tiêu đề</FormLabel>
                <FormControl>
                  <div className="relative">
                    <CiStickyNote className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Nhập tiêu đề"
                      className="pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* PASSWORD */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mật khẩu (tùy chọn)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Nhập mật khẩu"
                      className="pl-10"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* AVATAR */}
          <FormField
            control={form.control}
            name="avatar"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ảnh đại diện</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Dán link ảnh hoặc để trống"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">Tạo mới</Button>
        </form>
      </Form>
    </>
  )
}
