declare module 'jssoup' {
  class TreeBuilder {
    public canBeEmptyElement(name: string): boolean
  }

  export class SoupElement {
    public parent?: SoupTag
    public previousElement?: SoupTag
    public nextElement?: SoupTag
    public text: string

    constructor(
      parent?: SoupTag,
      previousElement?: SoupTag,
      nextElement?: SoupTag
    )

    public get nextSibling(): SoupTag | undefined
    public get previousSibling(): SoupTag | undefined
    public get nextSiblings(): SoupTag | undefined
    public get previousSiblings(): SoupTag | undefined

    /** remove item from dom tree */
    public extract(): void
    public insert(index: number, newElement: SoupElement | string): void
    public replaceWith(newElement: SoupElement | string): this | undefined
  }

  export class SoupString extends SoupElement {
    constructor(
      text: string,
      parent?: SoupElement,
      previousElement?: SoupElement,
      nextElement?: SoupElement
    )

    toString(): string
  }

  type Attributes =
    | string
    | string[]
    | { class: string }
    | { class: string[] }
    | { [attribute: string]: string }

  export class SoupTag extends SoupElement {
    public name: string
    public builder: TreeBuilder
    public attrs: { [attribute: string]: string }

    /** contains direct children of current element */
    public contents: SoupTag[]

    constructor(
      name: string,
      builder: TreeBuilder,
      attrs: { [attribute: string]: string }
    )

    public get string(): SoupString
    public get text(): string

    /** includes all elements of which current element is the ancestor of */
    public get descendants(): SoupElement[]

    public find<T extends SoupElement>(
      name?: string,
      attrs?: Attributes,
      string?: string
    ): T | undefined

    /** like find_all in BeautifulSoup */
    public findAll<T extends SoupElement>(
      name?: string,
      attrs?: Attributes,
      string?: string
    ): T[]

    public findPreviousSibling<T extends SoupElement>(
      name?: string,
      attrs?: Attributes,
      string?: string
    ): T | undefined

    public findPreviousSiblings<T extends SoupElement>(
      name?: string,
      attrs?: Attributes,
      string?: string
    ): T[]

    public findNextSibling<T extends SoupElement>(
      name?: string,
      attrs?: Attributes,
      string?: string
    ): T | undefined

    public findNextSiblings<T extends SoupElement>(
      name?: string,
      attrs?: Attributes,
      string?: string
    ): T[]

    public getText(separator?: string): string
    public prettify(indent?: string, breakline?: string): string
    public toString(): string
    public append(item: SoupElement): void

    /** @param expression - a CSS expression like "div > .class1"*/
    public select<T extends SoupElement>(expression: string): T[]

    /** @param expression - a CSS expression like "div > .class1"*/
    public selectOne<T extends SoupElement>(expression: string): T | undefined
  }

  export default class JSSoup extends SoupTag {
    /** The text element only contains whitespace will be ignored by default. To disable this feature, set "ignoreWhitespace" to true. */
    constructor(text: string, ignoreWhitespace?: boolean)
  }
}
