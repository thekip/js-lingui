import {
  PluralNoContext,
  SelectNoContext,
  SelectOrdinalNoContext,
} from "./MacroNoContext"
import { nodesToMessage } from "./nodesToMessage"
import { TransNoContext } from "./TransNoContext"
import React from "react"
import { render } from "@testing-library/react"
import { setupI18n } from "@lingui/core"

describe("Macro No Context Components", () => {
  const i18n = setupI18n({ locale: "en", messages: { en: {} } })

  describe("Print to Message", () => {
    describe("Plural", () => {
      test("Should expand Plural component into icu string", () => {
        const count = 5
        const fragment = (
          <>
            <PluralNoContext
              lingui={{ i18n }}
              value={count}
              offset={1}
              _0="Zero items"
              // todo: test with a Trans in the options
              few={<>{{ count }} items</>}
              other={<a href="/more">A lot of them</a>}
            />
          </>
        )
        const actual = nodesToMessage(fragment.props.children)
        expect(actual).toMatchInlineSnapshot(`
                {
                  "components": {
                    "0": <React.Fragment />,
                    "1": <a
                      href="/more"
                    />,
                  },
                  "message": "{value, plural, offset:1 =0 {Zero items} few {<0>{count} items</0>} other {<1>A lot of them</1>}}",
                  "values": {
                    "count": 5,
                    "value": 5,
                  },
                }
            `)
      })
      test("Should support Trans component in the options", () => {
        const count = 5
        const fragment = (
          <>
            <PluralNoContext
              lingui={{ i18n }}
              value={count}
              offset={1}
              _0="Zero items"
              few={
                <TransNoContext lingui={{} as any}>
                  {{ count } as any} items
                </TransNoContext>
              }
              other={<a href="/more">A lot of them</a>}
            />
          </>
        )
        const actual = nodesToMessage(fragment.props.children)
        expect(actual).toMatchInlineSnapshot(`
                {
                  "components": {
                    "0": <a
                      href="/more"
                    />,
                  },
                  "message": "{value, plural, offset:1 =0 {Zero items} few {{count} items} other {<0>A lot of them</0>}}",
                  "values": {
                    "count": 5,
                    "value": 5,
                  },
                }
            `)
      })
      test("Should add Plural value to values", () => {
        const count = 5
        const fragment = (
          <>
            <PluralNoContext
              lingui={{ i18n }}
              value={count}
              one="# book"
              other="# books"
            />
          </>
        )
        const actual = nodesToMessage(fragment.props.children)
        expect(actual).toMatchInlineSnapshot(`
                {
                  "components": {},
                  "message": "{value, plural, one {# book} other {# books}}",
                  "values": {
                    "value": 5,
                  },
                }
            `)
      })
    })
    describe("Select", () => {
      test("Should expand Select component into icu string", () => {
        const value = "female"

        const fragment = (
          <>
            <SelectNoContext
              lingui={{ i18n }}
              id="msg.select"
              context={"Context!"}
              comment={"hello"}
              component={(props) => null}
              // render={() => null as unknown as ReactElement}
              value={value}
              _male="He"
              _female={`She`}
              other={<strong>Other</strong>}
            />
          </>
        )
        const actual = nodesToMessage(fragment.props.children)

        expect(actual).toMatchInlineSnapshot(`
                {
                  "components": {
                    "0": <strong />,
                  },
                  "message": "{value, select, male {He} female {She} other {<0>Other</0>}}",
                  "values": {
                    "value": "female",
                  },
                }
            `)
      })
    })
    describe("SelectOrdinal", () => {
      test("Should expand SelectOrdinal component into icu string", () => {
        const count = 5
        const fragment = (
          <>
            <SelectOrdinalNoContext
              lingui={{ i18n }}
              value={count}
              one="#st"
              two={`#nd`}
              other={<strong>#rd</strong>}
            />
          </>
        )
        const actual = nodesToMessage(fragment.props.children)
        expect(actual).toMatchInlineSnapshot(`
                {
                  "components": {
                    "0": <strong />,
                  },
                  "message": "{value, selectordinal, one {#st} two {#nd} other {<0>#rd</0>}}",
                  "values": {
                    "value": 5,
                  },
                }
            `)
      })
    })
  })

  describe("Render JSX", () => {
    const html = (node: React.ReactNode) => render(node).container.innerHTML

    describe("With Wrapping Trans", () => {
      it("should render Plural", () => {
        const count = 5

        expect(
          html(
            <TransNoContext lingui={{ i18n }}>
              Here is{" "}
              <PluralNoContext
                lingui={{ i18n }}
                value={count}
                offset={1}
                _0="Zero items"
                // todo: test with a Trans in the options
                one={<>{{ count }} items</>}
                other={<a href="/more">A lot of them</a>}
              />
            </TransNoContext>
          )
        ).toMatchInlineSnapshot(`"Here is <a href="/more">A lot of them</a>"`)
      })

      it("should render Select", () => {
        const value = "female"

        expect(
          html(
            <TransNoContext lingui={{ i18n }}>
              Prefix{" "}
              <SelectNoContext
                lingui={{ i18n }}
                id="msg.select"
                context="context"
                comment="hello"
                value={value}
                _male="He"
                _female={`She`}
                other={<strong>Other</strong>}
              />
            </TransNoContext>
          )
        ).toMatchInlineSnapshot(`"Prefix She"`)
      })
      it("should render SelectOrdinal", () => {
        const count = 5

        expect(
          html(
            <TransNoContext lingui={{ i18n }}>
              This is my{" "}
              <SelectOrdinalNoContext
                lingui={{ i18n }}
                value={count}
                one="#st"
                two={`#nd`}
                other={<strong>#rd</strong>}
              />{" "}
              cat.
            </TransNoContext>
          )
        ).toMatchInlineSnapshot(`"This is my <strong>5rd</strong> cat."`)
      })
    })

    describe("ICU Components without wrapping Trans", () => {
      it("should render Plural", () => {
        const count = 5

        expect(
          html(
            <PluralNoContext
              lingui={{ i18n }}
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
            <SelectNoContext
              lingui={{ i18n }}
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
            <SelectOrdinalNoContext
              lingui={{ i18n }}
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
