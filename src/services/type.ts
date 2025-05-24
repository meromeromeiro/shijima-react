
/** 版块基础结构 */
export interface Board {
  id: number
  name: string
  intro?: string  // 可选属性，部分版块可能没有描述[7](@ref)
}

/** 发帖请求参数结构 */
export interface SubmitPostParams {
  boardId: number   // 目标版块ID
  content: string   // 帖子内容
  title?: string    // 可选标题（根据部分版块需求）
  attachments?: string[]  // 附件链接数组
}

export interface Thread {
  t?: string;         // title (无标题), optional as per json:",omitempty"
  n?: string;         // name (无名氏), optional as per json:",omitempty"
  ts?: string;         // timestamp (e.g., "2022-10-16(日)23:14:27")
  id: string;         // user identity (e.g., "Admin", "F7nfJr2")
  no: number;         // number (post number, e.g., 52752005) - uint in Go, number in TS
  p?: string;         // picture src (e.g., "2025-01-15/678787a6e4cb4.jpg"), optional
  txt: string;        // content (HTML string)
  r?: number;         // reply to (parent thread's 'no'), hidden from JSON, but useful for client logic if fetched
  // del?: number;    // is deleted? (int8 in Go), hidden from JSON, usually not needed on client if API filters deleted
  // c?: string;      // country, hidden from JSON
  // ip?: string;     // ip address, hidden from JSON
  num?: number;       // reply_num from board (for main threads), or other numeric count, optional
  list?: Thread[];    // replies (array of Thread objects), optional

  // Client-side enhancements (optional, can be added during data parsing)
  isSage?: boolean;   // Derived from 'txt' content or a specific API field if available
  isPo?: boolean;     // Derived by comparing 'id' with the main thread's 'id'
  image?: string | null; // Full URL for the main image (derived from 'p')
  thumbnail?: string | null; // Full URL for the thumbnail (derived from 'p')
  replyCount?: number; // Often 'num' is used for this for main threads from board view
}