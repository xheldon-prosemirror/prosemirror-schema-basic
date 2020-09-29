import {Schema} from "prosemirror-model"

const pDOM = ["p", 0], blockquoteDOM = ["blockquote", 0], hrDOM = ["hr"],
      preDOM = ["pre", ["code", 0]], brDOM = ["br"]

// :: Object
// [Specs](#model.NodeSpec) for the nodes defined in this schema.
//
// @cn 定义在该 schema 中节点们的 [Specs（配置对象）](#model.NodeSpec)。
export const nodes = {
  // :: NodeSpec The top level document node.
  //
  // @cn 文档顶级节点。
  doc: {
    content: "block+"
  },

  // :: NodeSpec A plain paragraph textblock. Represented in the DOM
  // as a `<p>` element.
  //
  // @cn 普通段落文本块。在 DOM 中表现为一个 `<p>` 元素。
  paragraph: {
    content: "inline*",
    group: "block",
    parseDOM: [{tag: "p"}],
    toDOM() { return pDOM }
  },

  // :: NodeSpec A blockquote (`<blockquote>`) wrapping one or more blocks.
  //
  // @cn 一个引用块（`<blockquote>`）包裹一个或者多个块级节点。
  blockquote: {
    content: "block+",
    group: "block",
    defining: true,
    parseDOM: [{tag: "blockquote"}],
    toDOM() { return blockquoteDOM }
  },

  // :: NodeSpec A horizontal rule (`<hr>`).
  //
  // @cn 水平分隔线（`<hr>`）。
  horizontal_rule: {
    group: "block",
    parseDOM: [{tag: "hr"}],
    toDOM() { return hrDOM }
  },

  // :: NodeSpec A heading textblock, with a `level` attribute that
  // should hold the number 1 to 6. Parsed and serialized as `<h1>` to
  // `<h6>` elements.
  //
  // @cn 标题文本块，带有一个 `level` 属性，该属性的值应该在 1 到 6 的范围。会被格式化和序列化为 `<h1>` 到 `<h6>` 元素。
  heading: {
    attrs: {level: {default: 1}},
    content: "inline*",
    group: "block",
    defining: true,
    parseDOM: [{tag: "h1", attrs: {level: 1}},
               {tag: "h2", attrs: {level: 2}},
               {tag: "h3", attrs: {level: 3}},
               {tag: "h4", attrs: {level: 4}},
               {tag: "h5", attrs: {level: 5}},
               {tag: "h6", attrs: {level: 6}}],
    toDOM(node) { return ["h" + node.attrs.level, 0] }
  },

  // :: NodeSpec A code listing. Disallows marks or non-text inline
  // nodes by default. Represented as a `<pre>` element with a
  // `<code>` element inside of it.
  //
  // @cn 代码块。默认情况下不允许 marks 和非文本行内节点。表现为一个包裹着 `<code>` 元素的 `<pre>` 元素。
  code_block: {
    content: "text*",
    marks: "",
    group: "block",
    code: true,
    defining: true,
    parseDOM: [{tag: "pre", preserveWhitespace: "full"}],
    toDOM() { return preDOM }
  },

  // :: NodeSpec The text node.
  //
  // @cn 文本节点。
  text: {
    group: "inline"
  },

  // :: NodeSpec An inline image (`<img>`) node. Supports `src`,
  // `alt`, and `href` attributes. The latter two default to the empty
  // string.
  //
  // @cn 行内图片节点。支持 `src`、`alt` 和 `href` 属性。后两者默认的值是空字符串。
  image: {
    inline: true,
    attrs: {
      src: {},
      alt: {default: null},
      title: {default: null}
    },
    group: "inline",
    draggable: true,
    parseDOM: [{tag: "img[src]", getAttrs(dom) {
      return {
        src: dom.getAttribute("src"),
        title: dom.getAttribute("title"),
        alt: dom.getAttribute("alt")
      }
    }}],
    toDOM(node) { let {src, alt, title} = node.attrs; return ["img", {src, alt, title}] }
  },

  // :: NodeSpec A hard line break, represented in the DOM as `<br>`.
  //
  // @cn 强制换行符，在 DOM 中表示为 `<br>` 元素。
  hard_break: {
    inline: true,
    group: "inline",
    selectable: false,
    parseDOM: [{tag: "br"}],
    toDOM() { return brDOM }
  }
}

const emDOM = ["em", 0], strongDOM = ["strong", 0], codeDOM = ["code", 0]

// :: Object [Specs](#model.MarkSpec) for the marks in the schema.
//
// @cn schema 中 marks 们的 [Specs（配置对象）](#model.MarkSpec)
export const marks = {
  // :: MarkSpec A link. Has `href` and `title` attributes. `title`
  // defaults to the empty string. Rendered and parsed as an `<a>`
  // element.
  //
  // @cn 链接。有 `href` 和 `title` 属性。`title` 默认是空字符串。会被渲染和格式化为一个 `<a>` 元素。
  link: {
    attrs: {
      href: {},
      title: {default: null}
    },
    inclusive: false,
    parseDOM: [{tag: "a[href]", getAttrs(dom) {
      return {href: dom.getAttribute("href"), title: dom.getAttribute("title")}
    }}],
    toDOM(node) { let {href, title} = node.attrs; return ["a", {href, title}, 0] }
  },

  // :: MarkSpec An emphasis mark. Rendered as an `<em>` element.
  // Has parse rules that also match `<i>` and `font-style: italic`.
  //
  // @cn 强调。渲染为一个 `<em>` 元素，格式化规则同样匹配 `<i>` 和 `font-style: italic`。
  //
  // @comment 这里可能是 em 加粗，或者 i/font-style: italic 斜体。
  //
  // @comment 「font-style: italic」写法中，样式名的冒号后面的空格要保持统一，要么都有，要么都无。
  em: {
    parseDOM: [{tag: "i"}, {tag: "em"}, {style: "font-style=italic"}],
    toDOM() { return emDOM }
  },

  // :: MarkSpec A strong mark. Rendered as `<strong>`, parse rules
  // also match `<b>` and `font-weight: bold`.
  //
  // @cn 加粗。渲染为 `<strong>`，格式化规则同样匹配 `<b>` 和 `font-weight: bold`。
  strong: {
    parseDOM: [{tag: "strong"},
               // This works around a Google Docs misbehavior where
               // pasted content will be inexplicably wrapped in `<b>`
               // tags with a font-weight normal.
               {tag: "b", getAttrs: node => node.style.fontWeight != "normal" && null},
               {style: "font-weight", getAttrs: value => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null}],
    toDOM() { return strongDOM }
  },

  // :: MarkSpec Code font mark. Represented as a `<code>` element.
  //
  // @cn 行内代码。表现为 `<code>` 元素。
  code: {
    parseDOM: [{tag: "code"}],
    toDOM() { return codeDOM }
  }
}

// :: Schema
// This schema roughly corresponds to the document schema used by
// [CommonMark](http://commonmark.org/), minus the list elements,
// which are defined in the [`prosemirror-schema-list`](#schema-list)
// module.
//
// @cn 该 schema 大致对应于 [CommonMark](http://commonmark.org/) 使用的文档 schema，减去在 [`prosemirror-schema-list`](#schema-list)
// 模块中定义的里列表元素。
//
// To reuse elements from this schema, extend or read from its
// `spec.nodes` and `spec.marks` [properties](#model.Schema.spec).
//
// @cn 为了能够从该 schema 中重用元素，可以扩展和读取 `spec.nodes` 和 `spec.marks` [属性](#model.Schema.spec)。
export const schema = new Schema({nodes, marks})
