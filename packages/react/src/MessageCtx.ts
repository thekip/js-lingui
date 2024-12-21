import { ReactNode } from "react"

const makeCounter =
  (index = 0) =>
  () =>
    index++

export class MessageCtx {
  componentsIndex = makeCounter()
  components: Record<string, ReactNode> = {}
  values: Record<string, unknown> = {}

  public addValue(name: string, value: unknown) {
    if (this.values[name] && this.values[name] !== value) {
      console.warn(
        `Lingui: you passed different values with the same name "${name}".\n` +
          `     Most likely it is not what you want. Las value will overwrite previous.\n` +
          `     First value: "${this.values[name]}"\n` +
          `     Second value: "${value}"`
      )
    }

    this.values[name] = value
  }
}
