import { cloneElement, isValidElement, ReactNode } from "react"
import { getLinguiMeta, isLinguiComponent } from "./TransNew"

type ReactChildren = ReactNode | ReactNode[]

export const isString = (obj: unknown): obj is string => typeof obj === "string"
export const isObject = (obj: unknown): obj is object =>
  typeof obj === "object" && obj !== null
export const isFunction = (f: unknown): f is Function => typeof f === "function"

export const makeCounter =
  (index = 0) =>
  () =>
    index++

export const nodesToString = (children: ReactChildren) => {
  const ctx = new Ctx()
  const message = _nodesToString(children, ctx)

  return {
    message,
    elements: ctx.elements,
    values: ctx.values,
  }
}

class Ctx {
  elementIndex = makeCounter()
  elements: Record<string, ReactNode> = {}
  values: Record<string, unknown> = {}
}

const _nodesToString = (children: ReactChildren, ctx: Ctx) => {
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
      const elemIndex = ctx.elementIndex()

      // regular case mapping the inner children
      const content = _nodesToString(props.children, ctx)

      if (isFunction(child.type) && isLinguiComponent(child.type as any)) {
        const toMessage = getLinguiMeta(child.type as any)

        stringNode += toMessage(
          child.props,
          (node) => _nodesToString(node, ctx),
          ctx
        )
      } else {
        ctx.elements[elemIndex] = cloneElement(child, props, [])

        if (!content) {
          // actual e.g. lorem <hr className="test" /> ipsum
          // expected e.g. lorem <0/> ipsum
          // or
          // we got a dynamic list like
          // e.g. <ul i18nIsDynamicList>{['a', 'b'].map(item => ( <li key={item}>{item}</li> ))}</ul>
          // expected e.g. "<0/>", not e.g. "<0><0>a</0><1>b</1></0>"
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
        ctx.values[varName] = rest[varName]
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
