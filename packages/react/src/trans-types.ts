import { I18n } from "@lingui/core"
import { ComponentType } from "react"
import { TransRenderProps } from "./TransNoContext"

export type LinguiContextLike = {
  i18n: I18n
  defaultComponent?: ComponentType<TransRenderProps>
}
