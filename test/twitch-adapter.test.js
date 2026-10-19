const test = require("node:test");
const assert = require("node:assert/strict");
const { TwitchAdapter, ALLOWED_HOSTNAMES, CHANNEL_REGEX, RESERVED_PATHS } = require("../adapters/twitch");

test("TwitchAdapter - Instantiation & Properties", () => {
  const adapter = new TwitchAdapter();
  assert.equal(adapter.name, "twitch");
  assert.equal(adapter.displayName, "Twitch");
  assert.deepEqual(adapter.allowedHostnames, ["twitch.tv", "www.twitch.tv", "m.twitch.tv"]);
});

test("TwitchAdapter - Valid channel URLs with regex validation and lowercase normalization", () => {
  const adapter = new TwitchAdapter();
  const validCases = [
    { url: "https://twitch.tv/shroud", expectedId: "shroud" },
    { url: "https://www.twitch.tv/ninja", expectedId: "ninja" },
    { url: "https://m.twitch.tv/pokimane", expectedId: "pokimane" },
    { url: "http://twitch.tv/streamer_123", expectedId: "streamer_123" },
    { url: "https://twitch.tv/CAPITAL_NAME/", expectedId: "capital_name" },
    { url: "https://www.twitch.tv/gamer_pro?referrer=raid&tt_medium=app", expectedId: "gamer_pro" },
    { url: "https://twitch.tv/user_three#chat", expectedId: "user_three" },
    { url: "//twitch.tv/protocol_rel", expectedId: "protocol_rel" },
  ];

  for (const c of validCases) {
    assert.equal(adapter.validateUrl(c.url), true, `validateUrl failed for ${c.url}`);
    const res = adapter.parse(c.url);
    assert.equal(res.platform, "twitch");
    assert.equal(res.channelId, c.expectedId, `channelId should be lowercased to ${c.expectedId}`);
    assert.equal(res.normalizedUrl, `https://www.twitch.tv/${c.expectedId}`);
    assert.equal(res.canonicalUrl, `https://www.twitch.tv/${c.expectedId}`);
    assert.ok(res.metadata);
    assert.equal(res.metadata.channel, c.expectedId);
  }
});

test("TwitchAdapter - Rejects deceptive hostnames and lookalikes", () => {
  const adapter = new TwitchAdapter();
  const deceptiveUrls = [
    "https://twitch.tv.evil.com/shroud",
    "https://faketwitch.tv/shroud",
    "https://twitch.com/shroud",
    "https://not-twitch.tv/shroud",
    "https://twitch.tv.phishing.org/shroud",
    "https://api.twitch.tv/shroud",
    "https://id.twitch.tv/shroud",
  ];

  for (const url of deceptiveUrls) {
    assert.equal(adapter.validateUrl(url), false, `Should reject deceptive URL: ${url}`);
    assert.throws(() => adapter.parse(url), /Invalid or deceptive hostname/, `Should throw deceptive error for ${url}`);
  }
});

test("TwitchAdapter - Rejects reserved platform paths", () => {
  const adapter = new TwitchAdapter();
  const reservedPaths = [
    "https://twitch.tv/directory",
    "https://twitch.tv/p",
    "https://twitch.tv/videos",
    "https://twitch.tv/moderator",
    "https://twitch.tv/settings",
    "https://twitch.tv/friends",
    "https://twitch.tv/subscriptions",
    "https://twitch.tv/inventory",
    "https://twitch.tv/wallet",
    "https://twitch.tv/drops",
    "https://twitch.tv/messages",
    "https://twitch.tv/popout",
    "https://twitch.tv/embed",
    "https://twitch.tv/downloads",
    "https://twitch.tv/jobs",
    "https://twitch.tv/turbo",
    "https://twitch.tv/prime",
    "https://twitch.tv/broadcast",
    "https://twitch.tv/creatorcamp",
    "https://twitch.tv/search",
    "https://twitch.tv/login",
    "https://twitch.tv/signup",
  ];

  for (const url of reservedPaths) {
    assert.equal(adapter.validateUrl(url), false, `Should reject reserved path: ${url}`);
    assert.throws(() => adapter.parse(url), /reserved Twitch platform path/, `Should throw reserved error for ${url}`);
  }
});

test("TwitchAdapter - Enforces Twitch 3-25 char regex validation", () => {
  const adapter = new TwitchAdapter();
  const invalidChannelUrls = [
    "https://twitch.tv/ab", // too short (< 3 chars)
    "https://twitch.tv/a",  // too short (< 3 chars)
    "https://twitch.tv/this_username_is_way_too_long_for_twitch", // > 25 chars
    "https://twitch.tv/user-with-hyphens", // hyphens forbidden on Twitch
    "https://twitch.tv/user.with.dots",    // dots forbidden
    "https://twitch.tv/user@special!",     // special chars forbidden
  ];

  for (const url of invalidChannelUrls) {
    assert.equal(adapter.validateUrl(url), false, `Should fail validation for invalid username in ${url}`);
    assert.throws(() => adapter.parse(url), /Invalid Twitch channel identifier/, `Should throw identifier error for ${url}`);
  }
});

test("TwitchAdapter - Rejects missing channel and subpaths", () => {
  const adapter = new TwitchAdapter();
  const badUrls = [
    "https://twitch.tv",
    "https://twitch.tv/",
    "https://www.twitch.tv/",
    "https://twitch.tv/shroud/videos",
    "https://twitch.tv/shroud/clip/123",
  ];

  for (const url of badUrls) {
    assert.equal(adapter.validateUrl(url), false);
    assert.throws(() => adapter.parse(url));
  }
});

test("TwitchAdapter - formatChannelUrl produces canonical lowercased URL", () => {
  const adapter = new TwitchAdapter();
  assert.equal(adapter.formatChannelUrl("SHROUD"), "https://www.twitch.tv/shroud");
  assert.equal(adapter.formatChannelUrl("ninja"), "https://www.twitch.tv/ninja");
  assert.throws(() => adapter.formatChannelUrl("ab"), /Invalid channel identifier/);
  assert.throws(() => adapter.formatChannelUrl("hyphen-user"), /Invalid channel identifier/);
});
