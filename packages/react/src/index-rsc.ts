export type {
  TransProps,
  TransRenderProps,
  TransRenderCallbackOrComponent,
} from "./TransNoContext"

import type { I18nContext } from "./I18nProvider"
import { getI18n } from "./server"

export { TransRsc as Trans } from "./rsc/TransRsc"
export {
  PluralRsc as Plural,
  SelectRsc as Select,
  SelectOrdinalRsc as SelectOrdinal,
} from "./rsc/MacroRsc"

export type { SelectChoiceProps, PluralChoiceProps } from "./MacroNoContext"

// todo add a fake provider and fake context in case if someone requested Provider from RSC context

export function useLingui(): I18nContext {
  const ctx = getI18n()
  if (!ctx) {
    throw new Error(
      "You tried to use `useLingui` in a Server Component, but i18n instance for RSC hasn't been setup.\nMake sure to call `setI18n` in the root of your page."
    )
  }

  return ctx
}
