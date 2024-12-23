import React, { ComponentProps, type FC, ReactNode } from "react"
import {
  TransNoContext,
  TransRenderCallbackOrComponent,
} from "./TransNoContext"
import { LinguiToMessage, setLinguiToMessageFn } from "./meta-utils"
import { LinguiContextLike } from "./trans-types"

const pluralRuleRe = /^(_[\d\w]+|zero|one|two|few|many|other|offset)$/
const jsx2icuExactChoice = (value: string) =>
  value.replace(/_(\d+)/, "=$1").replace(/_(\w+)/, "$1")

type CommonProps = TransRenderCallbackOrComponent & {
  id?: string
  comment?: string
  context?: string
}

export type PluralChoiceProps = {
  value: string | number
  /** Offset of value when calculating plural forms */
  offset?: number
  zero?: ReactNode
  one?: ReactNode
  two?: ReactNode
  few?: ReactNode
  many?: ReactNode

  /** Catch-all option */
  other: ReactNode
  /** Exact match form, corresponds to =N rule */
  [digit: `_${number}`]: ReactNode
} & CommonProps

export type SelectChoiceProps = {
  value: string
  /** Catch-all option */
  other: ReactNode
  [option: `_${string}`]: ReactNode
} & CommonProps

export const PluralNoContext: FC<
  PluralChoiceProps & {
    lingui: LinguiContextLike
  }
> = ({ context, comment, id, render, component, lingui, ...rest }) => (
  <TransNoContext
    {...({ context, comment, id, render, component, lingui } as ComponentProps<
      typeof TransNoContext
    >)}
  >
    <PluralNoContext {...(rest as any)} />
  </TransNoContext>
)

export const SelectNoContext: FC<
  SelectChoiceProps & {
    lingui: LinguiContextLike
  }
> = ({ context, comment, id, render, component, lingui, ...rest }) => (
  <TransNoContext
    {...({ context, comment, id, render, component, lingui } as ComponentProps<
      typeof TransNoContext
    >)}
  >
    <SelectNoContext {...(rest as any)} />
  </TransNoContext>
)

export const SelectOrdinalNoContext: FC<
  PluralChoiceProps & {
    lingui: LinguiContextLike
  }
> = ({ context, comment, id, render, component, lingui, ...rest }) => (
  <TransNoContext
    {...({ context, comment, id, render, component, lingui } as ComponentProps<
      typeof TransNoContext
    >)}
  >
    <SelectOrdinalNoContext {...(rest as any)} />
  </TransNoContext>
)

setLinguiToMessageFn(PluralNoContext, macroComponentToMessage("plural"))
setLinguiToMessageFn(SelectNoContext, macroComponentToMessage("select"))
setLinguiToMessageFn(
  SelectOrdinalNoContext,
  macroComponentToMessage("selectordinal")
)

export function macroComponentToMessage(
  format: "plural" | "select" | "selectordinal"
): LinguiToMessage<PluralChoiceProps | SelectChoiceProps> {
  return (props, nodesToString, ctx) => {
    const name = "value"
    const { value, ...options } = props
    ctx.addValue(name, value)

    const formatOptions = Object.keys(options)
      .filter((key) => pluralRuleRe.test(key))
      .map((key) => {
        let value = (options as any)[key]

        if (key === "offset") {
          // offset has special syntax `offset:number`
          return `offset:${value}`
        }

        if (typeof value !== "string") {
          value = nodesToString(value as ReactNode)
        }

        return `${jsx2icuExactChoice(key)} {${value}}`
      })
      .join(" ")

    return `{${name}, ${format}, ${formatOptions}}`
  }
}
