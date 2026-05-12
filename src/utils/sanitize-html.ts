import { marked } from "marked";

export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown, { async: false }) as string;
}

const ALLOWED_TAGS = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "em",
  "i",
  "li",
  "ol",
  "p",
  "span",
  "strong",
  "u",
  "ul",
]);

const ALLOWED_ATTRIBUTES = new Set(["href", "title", "target", "rel"]);

function sanitizeElementAttributes(element: Element) {
  const attributes = Array.from(element.attributes);

  for (const attribute of attributes) {
    const name = attribute.name.toLowerCase();
    const value = attribute.value;

    if (!ALLOWED_ATTRIBUTES.has(name)) {
      element.removeAttribute(attribute.name);
      continue;
    }

    if (name === "href") {
      const lowerValue = value.trim().toLowerCase();
      const isSafeLink =
        lowerValue.startsWith("http://") ||
        lowerValue.startsWith("https://") ||
        lowerValue.startsWith("/") ||
        lowerValue.startsWith("#");

      if (!isSafeLink) {
        element.removeAttribute(attribute.name);
      }
    }

    if (name === "target") {
      if (value !== "_blank") {
        element.removeAttribute(attribute.name);
      } else if (!element.getAttribute("rel")) {
        element.setAttribute("rel", "noopener noreferrer");
      }
    }
  }
}

function sanitizeNode(node: Node, document: Document): Node | null {
  if (node.nodeType === Node.TEXT_NODE) {
    return document.createTextNode(node.textContent ?? "");
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const sourceElement = node as Element;
  const tagName = sourceElement.tagName.toLowerCase();

  if (!ALLOWED_TAGS.has(tagName)) {
    const fragment = document.createDocumentFragment();
    for (const child of Array.from(sourceElement.childNodes)) {
      const sanitizedChild = sanitizeNode(child, document);
      if (sanitizedChild) {
        fragment.appendChild(sanitizedChild);
      }
    }
    return fragment;
  }

  const cleanElement = document.createElement(tagName);

  for (const attribute of Array.from(sourceElement.attributes)) {
    cleanElement.setAttribute(attribute.name, attribute.value);
  }
  sanitizeElementAttributes(cleanElement);

  for (const child of Array.from(sourceElement.childNodes)) {
    const sanitizedChild = sanitizeNode(child, document);
    if (sanitizedChild) {
      cleanElement.appendChild(sanitizedChild);
    }
  }

  return cleanElement;
}

export function sanitizeWooHtml(html: string | null): string | null {
  if (!html || html.trim() === "") {
    return null;
  }

  const parser = new DOMParser();
  const sourceDocument = parser.parseFromString(html, "text/html");
  const outputDocument = document.implementation.createHTMLDocument("");
  const container = outputDocument.createElement("div");

  for (const child of Array.from(sourceDocument.body.childNodes)) {
    const sanitized = sanitizeNode(child, outputDocument);
    if (sanitized) {
      container.appendChild(sanitized);
    }
  }

  const cleanHtml = container.innerHTML.trim();
  return cleanHtml !== "" ? cleanHtml : null;
}
