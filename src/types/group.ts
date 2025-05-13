import { BookmarkItem } from "./bookmark"

export type GroupItem = {
  title: string
  icon?: string
  data: GroupItem[] | BookmarkItem[]
}
