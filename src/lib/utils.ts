import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type WithoutChild<T extends Record<string, unknown>, ChildType extends string = 'child'> = Omit<T, ChildType>

export type WithoutChildrenOrChild<T extends Record<string, unknown>> = Omit<T, 'children' | 'child'>

export type WithElementRef<T> = T & {
  ref?: Element | null
}
