import React, { type FC } from "react"
import { setLinguiToMessageFn } from "../meta-utils"

import {
  macroComponentToMessage,
  PluralChoiceProps,
  PluralNoContext,
  SelectChoiceProps,
  SelectNoContext,
  SelectOrdinalNoContext,
} from "../MacroNoContext"

import { getI18n } from "../server"

export const PluralRsc: FC<PluralChoiceProps> = (props) => {
  const lingui = getI18n()
  if (!lingui) {
    throw new Error(
      "You tried to use `Plural` in Server Component, but i18n instance for RSC hasn't been setup.\nMake sure to call `setI18n` in the root of your page."
    )
  }

  return <PluralNoContext {...{ ...props, lingui }} />
}

setLinguiToMessageFn(PluralRsc, macroComponentToMessage("plural"))

export const SelectRsc: FC<SelectChoiceProps> = (props) => {
  const lingui = getI18n()
  if (!lingui) {
    throw new Error(
      "You tried to use `Plural` in Server Component, but i18n instance for RSC hasn't been setup.\nMake sure to call `setI18n` in the root of your page."
    )
  }

  return <SelectNoContext {...{ ...props, lingui }} />
}
setLinguiToMessageFn(SelectRsc, macroComponentToMessage("select"))

export const SelectOrdinalRsc: FC<PluralChoiceProps> = (props) => {
  const lingui = getI18n()
  if (!lingui) {
    throw new Error(
      "You tried to use `Plural` in Server Component, but i18n instance for RSC hasn't been setup.\nMake sure to call `setI18n` in the root of your page."
    )
  }

  return <SelectOrdinalNoContext {...{ ...props, lingui }} />
}
setLinguiToMessageFn(SelectOrdinalRsc, macroComponentToMessage("selectordinal"))
