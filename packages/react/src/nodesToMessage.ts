import { cloneElement, isValidElement, ReactNode } from "react"
import { getLinguiToMessageFn, hasToMessageFn } from "./meta-utils"
import { MessageCtx } from "./MessageCtx"

type ReactChildren = ReactNode | ReactNode[]

const isString = (obj: unknown): obj is string => typeof obj === "string"
const isObject = (obj: unknown): obj is object =>
  typeof obj === "object" && obj !== null
const isFunction = (f: unknown): f is Function => typeof f === "function"

export const nodesToMessage = (children: ReactChildren) => {
  const ctx = new MessageCtx()
  const message = _nodesToString(children, ctx)

  return {
    message,
    components: ctx.components,
    values: ctx.values,
  }
}

const _nodesToString = (children: ReactChildren, ctx: MessageCtx) => {
  if (!children) return ""

  let stringNode = ""

  // do not use `React.Children.toArray`, will fail at object children
  const childrenArray = Array.isArray(children) ? children : [children]

  // e.g. lorem <br/> ipsum {{ messageCount, format }} dolor <strong>bold</strong> amet
  childrenArray.forEach((child) => {
    if (isString(child)) {
      // actual e.g. lorem
      // expected e.g. lorem
      stringNode += `${child}`
    } else if (isValidElement(child)) {
      const { props } = child
      // important: we want to create index for parent before
      // iterating the children
      if (isFunction(child.type) && hasToMessageFn(child.type as any)) {
        const toMessage = getLinguiToMessageFn(child.type as any)

        stringNode += toMessage(
          child.props,
          (node) => _nodesToString(node, ctx),
          ctx
        )
      } else {
        const elemIndex = ctx.componentsIndex()

        // regular case mapping the inner children
        const content = _nodesToString(props.children, ctx)

        ctx.components[elemIndex] = cloneElement(child, props, null)

        if (!content) {
          stringNode += `<${elemIndex}/>`
        } else {
          stringNode += `<${elemIndex}>${content}</${elemIndex}>`
        }
      }
    } else if (child === null) {
      console.warn(
        `Trans: the passed in value is invalid - seems you passed in a null child.`
      )
    } else if (isObject(child)) {
      // e.g. lorem {{ value, format }} ipsum
      const { ...rest } = child as unknown as Record<string, unknown>
      const keys = Object.keys(rest)

      if (keys.length === 1) {
        const varName = keys[0]!
        ctx.addValue(varName, rest[varName])
        stringNode += `{${varName}}`
      } else {
        // not a valid interpolation object (can only contain one value)
        console.warn(
          `Trans: the passed in object contained more than one variable - the object should look like {{ value }}.`,
          child
        )
      }
    } else {
      console.warn(
        `Trans: the passed in value is invalid - seems you passed in a variable like {number} - please pass in variables for interpolation as full objects like {{number}}.`,
        child
      )
    }
  })

  return stringNode
}
