const test = require("node:test");
const assert = require("node:assert/strict");
const { KickAdapter, ALLOWED_HOSTNAMES, CHANNEL_REGEX, RESERVED_PATHS } = require("../adapters/kick");

test("KickAdapter - Instantiation & Properties", () => {
  const adapter = new KickAdapter();
  assert.equal(adapter.name, "kick");
  assert.equal(adapter.displayName, "Kick.com");
  assert.deepEqual(adapter.allowedHostnames, ["kick.com", "www.kick.com"]);
});

test("KickAdapter - Valid channel URLs across variations", () => {
  const adapter = new KickAdapter();
  const validCases = [
    { url: "https://kick.com/xqc", expectedId: "xqc" },
    { url: "https://www.kick.com/ninja", expectedId: "ninja" },
    { url: "http://kick.com/streamer_123", expectedId: "streamer_123" },
    { url: "https://kick.com/pro-gamer-99", expectedId: "pro-gamer-99" },
    { url: "https://kick.com/creator/", expectedId: "creator" },
    { url: "https://kick.com/creator?ref=talkastranger&lang=en", expectedId: "creator" },
    { url: "https://kick.com/creator#chat", expectedId: "creator" },
    { url: "//kick.com/protocol_relative", expectedId: "protocol_relative" },
  ];

  for (const c of validCases) {
    assert.equal(adapter.validateUrl(c.url), true, `Failed validateUrl for ${c.url}`);
    const res = adapter.parse(c.url);
    assert.equal(res.platform, "kick");
    assert.equal(res.channelId, c.expectedId);
    assert.equal(res.normalizedUrl, `https://kick.com/${c.expectedId}`);
    assert.equal(res.canonicalUrl, `https://kick.com/${c.expectedId}`);
    assert.ok(res.metadata);
    assert.equal(res.metadata.channel, c.expectedId);
  }
});

test("KickAdapter - Rejects deceptive hostnames and lookalikes", () => {
  const adapter = new KickAdapter();
  const deceptiveUrls = [
    "https://kick.com.fake.com/ninja",
    "https://notkick.com/ninja",
    "https://kick.fake/ninja",
    "https://evil-kick.com/ninja",
    "https://kick.com.attacker.org/ninja",
    "https://subdomain.kick.com/ninja",
    "https://mykick.com/ninja",
  ];

  for (const url of deceptiveUrls) {
    assert.equal(adapter.validateUrl(url), false, `Should reject deceptive URL: ${url}`);
    assert.throws(() => adapter.parse(url), /Invalid or deceptive hostname/, `Should throw for ${url}`);
  }
});

test("KickAdapter - Rejects non-HTTP protocols", () => {
  const adapter = new KickAdapter();
  const badProtocols = [
    "ftp://kick.com/ninja",
    "file:///kick.com/ninja",
    "ws://kick.com/ninja",
    "javascript:alert(1)",
  ];

  for (const url of badProtocols) {
    assert.equal(adapter.validateUrl(url), false);
    assert.throws(() => adapter.parse(url));
  }
});

test("KickAdapter - Rejects missing channel and unsupported subpaths", () => {
  const adapter = new KickAdapter();
  const badPaths = [
    "https://kick.com",
    "https://kick.com/",
    "https://www.kick.com/",
    "https://kick.com/ninja/videos",
    "https://kick.com/ninja/clips/123",
    "https://kick.com/a/b/c",
  ];

  for (const url of badPaths) {
    assert.equal(adapter.validateUrl(url), false);
    assert.throws(() => adapter.parse(url));
  }
});

test("KickAdapter - Rejects reserved platform paths", () => {
  const adapter = new KickAdapter();
  const reserved = [
    "https://kick.com/categories",
    "https://kick.com/following",
    "https://kick.com/leaderboard",
    "https://kick.com/video",
    "https://kick.com/clip",
    "https://kick.com/terms-of-service",
    "https://kick.com/privacy-policy",
    "https://kick.com/community-guidelines",
    "https://kick.com/dmca",
    "https://kick.com/search",
    "https://kick.com/browse",
    "https://kick.com/about",
    "https://kick.com/login",
    "https://kick.com/signup",
  ];

  for (const url of reserved) {
    assert.equal(adapter.validateUrl(url), false, `Should reject reserved path: ${url}`);
    assert.throws(() => adapter.parse(url), /reserved Kick platform path/, `Should throw reserved error for ${url}`);
  }
});

test("KickAdapter - Rejects malformed and invalid identifiers", () => {
  const adapter = new KickAdapter();
  const badIdentifiers = [
    "https://kick.com/invalid@user",
    "https://kick.com/has space",
    "https://kick.com/special$char",
    "https://kick.com/test!name",
  ];

  for (const url of badIdentifiers) {
    assert.equal(adapter.validateUrl(url), false);
    assert.throws(() => adapter.parse(url));
  }
});

test("KickAdapter - formatChannelUrl generates canonical links", () => {
  const adapter = new KickAdapter();
  assert.equal(adapter.formatChannelUrl("xqc"), "https://kick.com/xqc");
  assert.equal(adapter.formatChannelUrl("streamer_123"), "https://kick.com/streamer_123");
  assert.throws(() => adapter.formatChannelUrl(""), /Invalid channel identifier/);
  assert.throws(() => adapter.formatChannelUrl("bad@id"), /Invalid channel identifier/);
});
