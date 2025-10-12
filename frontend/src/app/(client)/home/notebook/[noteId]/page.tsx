import { redirect } from "next/navigation"

export default function NoteBookPage({ params }: { params: { noteId: string } }) {
  redirect(`/home/notebook/${params.noteId}/1`)
}