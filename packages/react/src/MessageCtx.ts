import { ReactNode } from "react"

const makeCounter =
  (index = 0) =>
  () =>
    index++

export class MessageCtx {
  componentsIndex = makeCounter()
  components: Record<string, ReactNode> = {}
  values: Record<string, unknown> = {}

  public addValue(value: Record<string, unknown>): string | false {
    const keys = Object.keys(value)

    if (keys.length === 1) {
      const name = keys[0]!

      if (this.values[name] && this.values[name] !== value[name]) {
        console.warn(
          `Lingui: you passed different values with the same name "${name}".\n` +
            `     Most likely it is not what you want. Las value will overwrite previous.\n` +
            `     First value: "${this.values[name]}"\n` +
            `     Second value: "${value[name]}"`
        )
      }

      this.values[name] = value[name]
      return name
    }
    // not a valid interpolation object (can only contain one value)
    console.warn(
      `Trans: the passed in object contained more than one variable - the object should look like {{ value }}.`,
      value
    )

    return false
  }
}
