/**
 * URL and hostname utility functions for TalkAStranger Linker SDK
 */

function safeParseUrl(urlString) {
  if (!urlString || typeof urlString !== "string") return null;
  const trimmed = urlString.trim();
  if (!trimmed) return null;
  try {
    if (trimmed.startsWith("//")) {
      return new URL("https:" + trimmed);
    }
    return new URL(trimmed);
  } catch (e) {
    return null;
  }
}

function isAllowedHostname(hostname, allowedHostnames) {
  if (!hostname || typeof hostname !== "string") return false;
  const normalized = hostname.toLowerCase().replace(/\.$/, "").split(":")[0];
  return allowedHostnames.includes(normalized);
}

function getPathSegments(parsedUrl) {
  if (!parsedUrl || !parsedUrl.pathname) return [];
  return parsedUrl.pathname
    .split("/")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

module.exports = {
  safeParseUrl,
  isAllowedHostname,
  getPathSegments,
};
