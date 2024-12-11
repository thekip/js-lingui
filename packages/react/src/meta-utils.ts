import { FC, ReactNode } from "react"

const symb = Symbol("lingui-meta")

export type LinguiToMessage<T> = (
  props: T,
  nodesToString: (children: ReactNode) => string,
  ctx: { values: Record<string, unknown> } // todo: improve api here, might be a builder with methods? or left as is..
) => string

export function setLinguiToMessageFn<T>(
  component: FC<T>,
  toMessage: LinguiToMessage<T>
) {
  ;(component as any)[symb] = toMessage
}

export function isLinguiComponent<T>(component: FC<T>) {
  return !!getLinguiToMessageFn(component)
}

export function getLinguiToMessageFn<T>(component: FC<T>) {
  return (component as any)[symb] as LinguiToMessage<T>
}
