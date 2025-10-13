export interface SingleFile {
    public_id: string
    filename: string
    url: string
    format: string
    bytes: string
    created_at: Date | null
    updated_at: Date | null
}

export interface FileListStorage {
    notebookId: string
    file_list: SingleFile[]
    created_at: Date
    updated_at: Date
    deleted: Boolean
    deleted_at: Date | null
}