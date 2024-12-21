import { FC, ReactNode } from "react"
import { MessageCtx } from "./MessageCtx"

const symb = Symbol("lingui-meta")

export type LinguiToMessage<T> = (
  props: T,
  nodesToString: (children: ReactNode) => string,
  ctx: MessageCtx
) => string

// todo: add PURE annotation
export function setLinguiToMessageFn<T>(
  component: FC<T>,
  toMessage: LinguiToMessage<T>
) {
  ;(component as any)[symb] = toMessage
}

export function hasToMessageFn<T>(component: FC<T>) {
  return !!getLinguiToMessageFn(component)
}

export function getLinguiToMessageFn<T>(component: FC<T>) {
  return (component as any)[symb] as LinguiToMessage<T>
}
