import {
  Plural as PluralType,
  PluralChoiceProps,
  Select as SelectType,
  SelectChoiceProps,
  SelectOrdinal as SelectOrdinalType,
} from "../macro/index"
import { FC, ReactNode } from "react"

const symb = Symbol("lingui-meta")

const pluralRuleRe = /(_[\d\w]+|zero|one|two|few|many|other)/
const jsx2icuExactChoice = (value: string) =>
  value.replace(/_(\d+)/, "=$1").replace(/_(\w+)/, "$1")

export type LinguiToMessage<T> = (
  props: T,
  nodesToString: (children: ReactNode) => string,
  ctx: { values: Record<string, unknown> } // todo: improve api here, might be a builder with methods? or left as is..
) => string

function setMeta<T>(component: FC<T>, toMessage: LinguiToMessage<T>) {
  ;(component as any)[symb] = toMessage
}

export function isLinguiComponent<T>(component: FC<T>) {
  return !!getLinguiMeta(component)
}

export function getLinguiMeta<T>(component: FC<T>) {
  return (component as any)[symb] as LinguiToMessage<T>
}

export const Plural: typeof PluralType = (props) => null
export const Select: typeof SelectType = (props) => null
export const SelectOrdinal: typeof SelectOrdinalType = (props) => null

setMeta(Plural, printArgExpression("plural"))
setMeta(Select, printArgExpression("select"))
setMeta(SelectOrdinal, printArgExpression("selectOrdinal"))

function printArgExpression(
  format: "plural" | "select" | "selectOrdinal"
): LinguiToMessage<PluralChoiceProps | SelectChoiceProps> {
  return (props, nodesToString, ctx) => {
    const name = "value"
    const { value, ...options } = props
    ctx.values[name] = value

    const formatOptions = Object.keys(options)
      .map((key) => {
        let value = (options as any)[key]

        if (key === "offset" && format !== "select") {
          // offset has special syntax `offset:number`
          return `offset:${value}`
        }

        if (typeof value !== "string") {
          value = nodesToString(value as ReactNode)
        }

        if (pluralRuleRe.test(key)) {
          return `${jsx2icuExactChoice(key)} {${value}}`
        } else {
          return `${key} {${value}}`
        }
      })
      .join(" ")

    return `{${name}, ${format}, ${formatOptions}}`
  }
}

// TODO we want to make Plural works separately from Trans as well, cover with tests
