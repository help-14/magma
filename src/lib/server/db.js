// @ts-nocheck
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

export class ConfigStore {
  async read(_name) {
    throw new Error('not implemented')
  }

  async write(_name, _data) {
    throw new Error('not implemented')
  }
}

export class FileConfigStore extends ConfigStore {
  constructor(baseDir) {
    super()
    this.baseDir = baseDir
  }

  async read(name) {
    return readFile(path.resolve(this.baseDir, name), 'utf8')
  }

  async write(name, data) {
    await writeFile(path.resolve(this.baseDir, name), data, 'utf8')
  }
}

const configDir = process.env.CONFIG_DIR || 'config'
export let store = new FileConfigStore(configDir)

export function setConfigStore(customStore) {
	store = customStore
}
