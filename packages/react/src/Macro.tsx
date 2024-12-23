import React, { type FC } from "react"
import { setLinguiToMessageFn } from "./meta-utils"

import {
  macroComponentToMessage,
  PluralChoiceProps,
  PluralNoContext,
  SelectChoiceProps,
  SelectNoContext,
  SelectOrdinalNoContext,
} from "./MacroNoContext"

import { useLinguiInternal } from "./I18nProvider"

export type { PluralChoiceProps, SelectChoiceProps }

export const Plural: FC<PluralChoiceProps> = (props) => {
  let errMessage = undefined

  if (process.env.NODE_ENV !== "production") {
    errMessage = `Plural component was rendered without I18nProvider.
 Make sure this component is rendered inside a I18nProvider.`
  }

  const lingui = useLinguiInternal(errMessage)

  return <PluralNoContext {...{ ...props, lingui }} />
}

setLinguiToMessageFn(Plural, macroComponentToMessage("plural"))

export const Select: FC<SelectChoiceProps> = (props) => {
  let errMessage = undefined

  if (process.env.NODE_ENV !== "production") {
    errMessage = `Select component was rendered without I18nProvider.
 Make sure this component is rendered inside a I18nProvider.`
  }

  const lingui = useLinguiInternal(errMessage)

  return <SelectNoContext {...{ ...props, lingui }} />
}
setLinguiToMessageFn(Select, macroComponentToMessage("select"))

export const SelectOrdinal: FC<PluralChoiceProps> = (props) => {
  let errMessage = undefined

  if (process.env.NODE_ENV !== "production") {
    errMessage = `SelectOrdinal component was rendered without I18nProvider.
 Make sure this component is rendered inside a I18nProvider.`
  }

  const lingui = useLinguiInternal(errMessage)

  return <SelectOrdinalNoContext {...{ ...props, lingui }} />
}
setLinguiToMessageFn(SelectOrdinal, macroComponentToMessage("selectordinal"))
