export function decodeHtmlEntities(value: string): string {
  if (!value.includes("&")) {
    return value;
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(value, "text/html");
  return document.documentElement.textContent ?? value;
}

export function getPlainTextFromHtml(html: string | null): string | null {
  if (!html || html.trim() === "") {
    return null;
  }

  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");
  const textContent = document.body.textContent?.replace(/\s+/g, " ").trim() ?? "";

  return textContent !== "" ? textContent : null;
}
