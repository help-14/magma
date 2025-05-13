import { JsonDB, Config } from 'node-json-db'
import { GroupItem } from '~/types/group'
import { base64Encode } from './utils'
import { User } from '~/types'

const usersPath = "/users/"
const bookmarksPath = "/bookmarks"

const storage = new JsonDB(new Config("magmaDb", true, false, '/'))

export const db = {
  user: {
    async create(data: User) {
      if (!data.id) {
        data.id = base64Encode(data.username)
      }
      await storage.push(`${usersPath}${data.id}`, data)
      return data
    },
    get({ where }: { where: { id?: string; username?: string } }) {
      let userId = base64Encode(where.username ?? "") ?? where.id
      return storage.getData(`${usersPath}${userId}`)
    }
  },
  bookmark: {
    async create(data: GroupItem[]) {
      await storage.push(bookmarksPath, data)
      return data
    },
    get() {
      return storage.getData(bookmarksPath)
    }
  }
}
