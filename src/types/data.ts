import { GroupItem } from "~/types/group"

export type WebData = {
  localPingUrl: string
  localPingTimeout: number
  longitude: number
  latitude: number
  showSearchBox: boolean
  groups: GroupItem[]
}
