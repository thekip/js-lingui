import { Plural, Select, SelectOrdinal } from "./Macro"
import { Trans } from "./Trans"
import React from "react"
import { render } from "@testing-library/react"
import { setupI18n } from "@lingui/core"
import { I18nProvider } from "./I18nProvider"

describe("Macro Components", () => {
  const i18n = setupI18n({ locale: "en", messages: { en: {} } })

  describe("Render JSX", () => {
    const html = (node: React.ReactNode) =>
      render(<I18nProvider i18n={i18n}>{node}</I18nProvider>).container
        .innerHTML

    describe("With Wrapping Trans", () => {
      it("should render Plural", () => {
        const count = 5

        expect(
          html(
            <Trans>
              Here is{" "}
              <Plural
                value={count}
                offset={1}
                _0="Zero items"
                // todo: test with a Trans in the options
                one={<>{{ count }} items</>}
                other={<a href="/more">A lot of them</a>}
              />
            </Trans>
          )
        ).toMatchInlineSnapshot(`"Here is <a href="/more">A lot of them</a>"`)
      })

      it("should render Select", () => {
        const value = "female"

        expect(
          html(
            <Trans>
              Prefix{" "}
              <Select
                id="msg.select"
                context="context"
                comment="hello"
                value={value}
                _male="He"
                _female={`She`}
                other={<strong>Other</strong>}
              />
            </Trans>
          )
        ).toMatchInlineSnapshot(`"Prefix She"`)
      })
      it("should render SelectOrdinal", () => {
        const count = 5

        expect(
          html(
            <Trans>
              This is my{" "}
              <SelectOrdinal
                value={count}
                one="#st"
                two={`#nd`}
                other={<strong>#rd</strong>}
              />{" "}
              cat.
            </Trans>
          )
        ).toMatchInlineSnapshot(`"This is my <strong>5rd</strong> cat."`)
      })
    })

    describe("ICU Components without wrapping Trans", () => {
      it("should render Plural", () => {
        const count = 5

        expect(
          html(
            <Plural
              value={count}
              offset={1}
              _0="Zero items"
              // todo: test with a Trans in the options
              few={<>{{ count }} items</>}
              other={<a href="/more">A lot of them</a>}
            />
          )
        ).toMatchInlineSnapshot(`"<a href="/more">A lot of them</a>"`)
      })

      it("should render Select", () => {
        const value = "female"

        expect(
          html(
            <Select
              id="msg.select"
              value={value}
              _male="He"
              _female={`She`}
              other={<strong>Other</strong>}
            />
          )
        ).toMatchInlineSnapshot(`"She"`)
      })

      it("should render SelectOrdinal", () => {
        const count = 5

        expect(
          html(
            <SelectOrdinal
              value={count}
              one="#st"
              two={`#nd`}
              other={<strong>#rd</strong>}
            />
          )
        ).toMatchInlineSnapshot(`"<strong>5rd</strong>"`)
      })
    })
  })
})
