
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
