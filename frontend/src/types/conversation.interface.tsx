export type RoleType = "user" | "system" | "assistant";

export interface MessagePart {
  type: "text" | "code" | "image";
  text: string;
}

export interface MessageItem {
  id: string;
  role: RoleType;
  parts: MessagePart[];
  timestamp?: Date;
}

export interface Conversation {
  title: string;
  messages: MessageItem[];
  created_at: Date;
  updated_at: Date;
  deleted?: boolean;
  deleted_at?: Date | null;
  expire_at?: Date | null;
}