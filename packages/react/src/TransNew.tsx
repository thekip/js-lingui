import {
  CommonProps,
  PluralChoiceProps,
  Select as SelectType,
  SelectChoiceProps,
  SelectOrdinal as SelectOrdinalType,
} from "../macro/index"
import { type FC, ReactNode } from "react"
import { generateMessageId } from "@lingui/message-utils/generateMessageId"

const pluralRuleRe = /^(_[\d\w]+|zero|one|two|few|many|other|offset)$/
const jsx2icuExactChoice = (value: string) =>
  value.replace(/_(\d+)/, "=$1").replace(/_(\w+)/, "$1")

type LinguiContextLike = {
  i18n: I18n
  defaultComponent?: ComponentType<TransRenderProps>
}

export const Plural: FC<
  PluralChoiceProps & {
    lingui?: LinguiContextLike
  }
> = ({ context, comment, id, render, component, lingui, ...rest }) => (
  <NewTransNoContext {...{ context, comment, id, render, component, lingui }}>
    <Plural {...rest} />
  </NewTransNoContext>
)

export const Select: typeof SelectType = (props) => null
export const SelectOrdinal: typeof SelectOrdinalType = (props) => null

setLinguiToMessageFn(Plural, printArgExpression("plural"))
setLinguiToMessageFn(Select, printArgExpression("select"))
setLinguiToMessageFn(SelectOrdinal, printArgExpression("selectordinal"))

const dropProps = new Set<keyof CommonProps>([
  "id",
  "comment",
  "component",
  "render",
  "context",
])
function printArgExpression(
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

        // if (pluralRuleRe.test(key)) {
        return `${jsx2icuExactChoice(key)} {${value}}`
        // } else {
        //   return `${key} {${value}}`
        // }
      })
      .join(" ")

    return `{${name}, ${format}, ${formatOptions}}`
  }
}

import React, { ComponentType } from "react"

import { formatElements } from "./format"
import type { MessageOptions } from "@lingui/core"
import { I18n } from "@lingui/core"
import { LinguiToMessage, setLinguiToMessageFn } from "./meta-utils"
import { nodesToMessage } from "./nodesToMessage"

export type TransRenderProps = {
  id: string
  translation: React.ReactNode
  children: React.ReactNode
  message?: string | null
}

export type TransRenderCallbackOrComponent =
  | {
      component?: undefined
      render?:
        | ((props: TransRenderProps) => React.ReactElement<any, any>)
        | null
    }
  | {
      component?: React.ComponentType<TransRenderProps> | null
      render?: undefined
    }

type TransWithChildrenProps = {
  id?: string
  context?: string
  // todo: add support for {{placeholder}}
  children: React.ReactNode
}

type TransWithMessageProps = {
  id: string
  message?: string
  values?: Record<string, unknown>
  components?: { [key: string]: React.ElementType | any }
}

type TransChildrenOrMessage = TransWithChildrenProps | TransWithMessageProps

export type TransProps = {
  formats?: MessageOptions["formats"]
  comment?: string
} & TransChildrenOrMessage &
  TransRenderCallbackOrComponent

export function NewTransNoContext(
  props: TransProps & {
    lingui: LinguiContextLike
  }
): React.ReactElement<any, any> | null {
  if ("children" in props) {
    // TransWithChildren
    const { children, id, context, ...restProps } = props
    const { values, message, components } = nodesToMessage(children)

    return (
      <TransNoContext
        {...{
          ...restProps,
          values,
          message,
          components,
          id: id || generateMessageId(message, context),
        }}
      />
    )
  } else {
    // TransWithMessage
    return <TransNoContext {...props} />
  }
}

/**
 * Version of `<Trans>` component without using a Provider/Context React feature.
 * Primarily made for support React Server Components (RSC)
 *
 * @experimental the api of this component is not stabilized yet.
 */
function TransNoContext(
  props: {
    formats?: MessageOptions["formats"]
    comment?: string
    lingui: {
      i18n: I18n
      defaultComponent?: ComponentType<TransRenderProps>
    }
  } & TransWithMessageProps &
    TransRenderCallbackOrComponent
): React.ReactElement<any, any> | null {
  const {
    render,
    component,
    id,
    message,
    formats,
    lingui: { i18n, defaultComponent },
  } = props

  const values = { ...props.values }
  const components = { ...props.components }

  if (values) {
    /*
      Replace values placeholders with <INDEX /> and add values to `components`.
      This makes them processed as JSX children and follow JSX semantics.

      Related discussion: https://github.com/lingui/js-lingui/issues/1904

      Another use-case is when React components directly passed as values:

      Example:
      Translation: 'Hello {name}'
      Values: { name: <strong>Jane</strong> }

      It'll become "Hello <0 />" with components=[<strong>Jane</strong>]

      Related discussion: https://github.com/lingui/js-lingui/issues/183
    */
    Object.keys(values).forEach((key) => {
      const index = Object.keys(components).length

      // simple scalars should be processed as values to be able to apply formatting
      if (typeof values[key] === "string" || typeof values[key] === "number") {
        return
      }

      // react components, arrays, falsy values, all should be processed as JSX children
      components[index] = <>{values[key]}</>
      values[key] = `<${index}/>`
    })
  }

  const _translation: string =
    i18n && typeof i18n._ === "function"
      ? i18n._(id, values, { message, formats })
      : id // i18n provider isn't loaded at all

  const translation = _translation
    ? formatElements(_translation, components)
    : null

  if (render === null || component === null) {
    // Although `string` is a valid react element, types only allow `Element`
    // Upstream issue: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20544
    return translation as unknown as React.ReactElement<any, any>
  }

  const FallbackComponent: React.ComponentType<TransRenderProps> =
    defaultComponent || RenderFragment

  const i18nProps: TransRenderProps = {
    id,
    message,
    translation,
    children: translation, // for type-compatibility with `component` prop
  }

  // Validation of `render` and `component` props
  if (render && component) {
    console.error(
      "You can't use both `component` and `render` prop at the same time. `component` is ignored."
    )
  } else if (render && typeof render !== "function") {
    console.error(
      `Invalid value supplied to prop \`render\`. It must be a function, provided ${render}`
    )
  } else if (component && typeof component !== "function") {
    // Apparently, both function components and class components are functions
    // See https://stackoverflow.com/a/41658173/1535540
    console.error(
      `Invalid value supplied to prop \`component\`. It must be a React component, provided ${component}`
    )
    return React.createElement(FallbackComponent, i18nProps, translation)
  }

  // Rendering using a render prop
  if (typeof render === "function") {
    // Component: render={(props) => <a title={props.translation}>x</a>}
    return render(i18nProps)
  }

  // `component` prop has a higher precedence over `defaultComponent`
  const Component: React.ComponentType<TransRenderProps> =
    component || FallbackComponent

  return React.createElement(Component, i18nProps, translation)
}

const RenderFragment = ({ children }: TransRenderProps) => {
  // cannot use React.Fragment directly because we're passing in props that it doesn't support
  return <React.Fragment>{children}</React.Fragment>
}

setLinguiToMessageFn(NewTransNoContext, (props, nodesToString) => {
  return nodesToString((props as TransWithChildrenProps).children)
})
