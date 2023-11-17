import { randomUUID } from 'crypto'

export function generateUUID(): string {
  return randomUUID()
}

export function isUUID(uuid: unknown): uuid is string {
  if (typeof uuid !== 'string') {
    return false
  }
  return uuid.match(/^[0-9a-f]{32}$/) !== null
}
