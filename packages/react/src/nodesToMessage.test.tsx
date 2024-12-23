import { nodesToMessage } from "./nodesToMessage"
import React, { PropsWithChildren } from "react"
import { getConsoleMockCalls, mockConsole } from "@lingui/jest-mocks"
import { generateMessageId } from "@lingui/message-utils/generateMessageId"
import { setLinguiToMessageFn } from "./meta-utils"

describe("trans nodesToMessage", () => {
  describe("treat like other components (legacy)", () => {
    it("should handle self closed elements", () => {
      const fragment = (
        <>
          lorem <br /> ipsum
        </>
      )
      const actual = nodesToMessage(fragment.props.children)

      expect(actual).toMatchInlineSnapshot(`
        {
          "components": {
            "0": <br />,
          },
          "message": "lorem <0/> ipsum",
          "values": {},
        }
      `)

      expect((actual.components["0"] as any).props.children).toBeFalsy()
    })

    it("should handle elements with children", () => {
      const fragment = (
        <>
          lorem <strong>bold</strong> ipsum
        </>
      )
      const actual = nodesToMessage(fragment.props.children)
      expect(actual).toMatchInlineSnapshot(`
        {
          "components": {
            "0": <strong />,
          },
          "message": "lorem <0>bold</0> ipsum",
          "values": {},
        }
      `)
    })

    it("should handle other props", () => {
      const fragment = (
        <>
          lorem <i className="icon-gear" /> ipsum
        </>
      )
      const actual = nodesToMessage(fragment.props.children)
      expect(actual).toMatchInlineSnapshot(`
        {
          "components": {
            "0": <i
              className="icon-gear"
            />,
          },
          "message": "lorem <0/> ipsum",
          "values": {},
        }
      `)
    })

    it("should handle nested structures", () => {
      const fragment = (
        <>
          {"lorem "}
          <ul>
            <li>a</li>
            <li>
              <div>{{ foo: "bar" } as any}</div>
            </li>
          </ul>
          {" ipsum"}
        </>
      )
      const actual = nodesToMessage(fragment.props.children)
      expect(actual).toMatchInlineSnapshot(`
        {
          "components": {
            "0": <ul />,
            "1": <li />,
            "2": <li />,
            "3": <div />,
          },
          "message": "lorem <0><1>a</1><2><3>{foo}</3></2></0> ipsum",
          "values": {
            "foo": "bar",
          },
        }
      `)
    })
  })

  it("should print a variable placeholder", () => {
    const fragment = <>lorem {{ user: "hello!" }} ipsum</>
    const actual = nodesToMessage(fragment.props.children)
    expect(actual).toMatchInlineSnapshot(`
      {
        "components": {},
        "message": "lorem {user} ipsum",
        "values": {
          "user": "hello!",
        },
      }
    `)
  })

  it("should warn when invalid interpolation object passed", () => {
    mockConsole((console) => {
      const fragment = <>lorem {{ foo: "hello!", bar: "" }} ipsum</>
      const actual = nodesToMessage(fragment.props.children)

      expect(getConsoleMockCalls(console.warn)).toMatchInlineSnapshot(
        `"Trans: the passed in object contained more than one variable - the object should look like {{ value }}."`
      )

      expect(actual).toMatchInlineSnapshot(`
        {
          "components": {},
          "message": "lorem  ipsum",
          "values": {},
        }
      `)
    })
  })

  it("should warn when two values with the same name are passed", () => {
    mockConsole((console) => {
      const fragment = (
        <>
          lorem {{ foo: "hello!" }} ipsum {{ foo: "ola!" }}
        </>
      )
      const actual = nodesToMessage(fragment.props.children)

      expect(getConsoleMockCalls(console.warn)).toMatchInlineSnapshot(`
        "Lingui: you passed different values with the same name "foo".
             Most likely it is not what you want. Las value will overwrite previous.
             First value: "hello!"
             Second value: "ola!""
      `)

      expect(actual).toMatchInlineSnapshot(`
        {
          "components": {},
          "message": "lorem {foo} ipsum {foo}",
          "values": {
            "foo": "ola!",
          },
        }
      `)
    })
  })

  it("should warn when two values with the same name are passed", () => {
    mockConsole((console) => {
      const fragment = (
        <>
          lorem {{ foo: "hello!" }} ipsum {{ foo: "ola!" }}
        </>
      )
      const actual = nodesToMessage(fragment.props.children)

      expect(getConsoleMockCalls(console.warn)).toMatchInlineSnapshot(`
        "Lingui: you passed different values with the same name "foo".
             Most likely it is not what you want. Las value will overwrite previous.
             First value: "hello!"
             Second value: "ola!""
      `)

      expect(actual).toMatchInlineSnapshot(`
        {
          "components": {},
          "message": "lorem {foo} ipsum {foo}",
          "values": {
            "foo": "ola!",
          },
        }
      `)
    })
  })

  it("should warn when invalid interpolation passed", () => {
    mockConsole((console) => {
      const variable = 5
      const fragment = <>lorem {variable} ipsum</>
      const actual = nodesToMessage(fragment.props.children)
      expect(getConsoleMockCalls(console.warn)).toMatchInlineSnapshot(
        `"Trans: the passed in value is invalid - seems you passed in a variable like {number} - please pass in variables for interpolation as full objects like {{number}}."`
      )

      expect(actual).toMatchInlineSnapshot(`
        {
          "components": {},
          "message": "lorem  ipsum",
          "values": {},
        }
      `)
    })
  })

  it("should warn when null interpolation passed", () => {
    mockConsole((console) => {
      const variable = null
      const fragment = <>lorem {variable} ipsum</>
      const actual = nodesToMessage(fragment.props.children)
      expect(getConsoleMockCalls(console.warn)).toMatchInlineSnapshot(
        `"Trans: the passed in value is invalid - seems you passed in a null child."`
      )

      expect(actual).toMatchInlineSnapshot(`
        {
          "components": {},
          "message": "lorem  ipsum",
          "values": {},
        }
      `)
    })
  })
})

describe("Macro compatibility", () => {
  test("Elements are replaced with placeholders", () => {
    const name = "user"
    const fragment = (
      <>
        Hello <strong>World!</strong>
        <br />
        <p>
          My name is{" "}
          <a href="/about">
            {" "}
            <em>{{ name } as any}</em>
          </a>
        </p>
      </>
    )

    const actual = nodesToMessage(fragment.props.children)
    const messageId = generateMessageId(actual.message)
    expect({
      id: messageId,
      ...actual,
    }).toMatchInlineSnapshot(`
      {
        "components": {
          "0": <strong />,
          "1": <br />,
          "2": <p />,
          "3": <a
            href="/about"
          />,
          "4": <em />,
        },
        "id": "k9gsHO",
        "message": "Hello <0>World!</0><1/><2>My name is <3> <4>{name}</4></3></2>",
        "values": {
          "name": "user",
        },
      }
    `)
  })

  test("HTML attributes are handled", () => {
    const Text = (props: PropsWithChildren) => <>props.children</>

    const fragment = (
      <>
        <Text>This should work &nbsp;</Text>
      </>
    )

    const actual = nodesToMessage(fragment.props.children)
    const messageId = generateMessageId(actual.message)
    expect({
      id: messageId,
      ...actual,
    }).toMatchInlineSnapshot(`
      {
        "components": {
          "0": <Text />,
        },
        "id": "K/1Xpr",
        "message": "<0>This should work  </0>",
        "values": {},
      }
    `)
  })
})

test("Should use toMessage function of the custom component", () => {
  const MyComponent = (props: { foo: string }) => null
  setLinguiToMessageFn(MyComponent, (props, nodesToString, ctx) => {
    ctx.values["test"] = 10

    return "MyComponentToString_" + nodesToString(<>{props.foo}</>)
  })

  const fragment = (
    <>
      <MyComponent foo={"props.foo"} />
    </>
  )
  const actual = nodesToMessage(fragment.props.children)
  expect(actual).toMatchInlineSnapshot(`
    {
      "components": {
        "0": <React.Fragment />,
      },
      "message": "MyComponentToString_<0>props.foo</0>",
      "values": {
        "test": 10,
      },
    }
  `)
})

// todo: extractor will produce here "lorem <0>{0}</0> ipsum"
// eslint rule which will flag all interpolations in Trans component which are not {{  }}

// conditional expressions in Trans will not work, should be covered with eslint rule described above
// {props.world ? <Trans>world</Trans> : <Trans>guys</Trans>}

// <Plural
//   value={count}
//   offset="1"
//   _0="Zero items"
//   few={\`\${count} items\`}
//   other={<a href="/more">A lot of them</a>}
// />
// few={`${count} items`} is not supported, instead should be a fragment few={<>{{ count }} items</>}

// what would be if we will have few plural expressions in one message? They will clash values
