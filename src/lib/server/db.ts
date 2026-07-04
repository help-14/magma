import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

export class ConfigStore {
  async read(_name: string): Promise<string> {
    throw new Error('not implemented')
  }

  async write(_name: string, _data: string): Promise<void> {
    throw new Error('not implemented')
  }
}

export class FileConfigStore extends ConfigStore {
  baseDir: string

  constructor(baseDir: string) {
    super()
    this.baseDir = baseDir
  }

  async read(name: string): Promise<string> {
    return readFile(path.resolve(this.baseDir, name), 'utf8')
  }

  async write(name: string, data: string): Promise<void> {
    await writeFile(path.resolve(this.baseDir, name), data, 'utf8')
  }
}

const configDir = process.env.CONFIG_DIR || 'config'
export let store: ConfigStore = new FileConfigStore(configDir)

export function setConfigStore(customStore: ConfigStore) {
	store = customStore
}
