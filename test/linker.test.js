const test = require("node:test");
const assert = require("node:assert/strict");
const {
  TalkAStrangerLinker,
  KickAdapter,
  TwitchAdapter,
  parseStreamUrl,
  getAdapter,
  registerAdapter,
  SUPPORTED_PLATFORMS,
} = require("../talkastranger-linker");

test("TalkAStrangerLinker - Public exports and supported platforms", () => {
  assert.ok(TalkAStrangerLinker);
  assert.ok(KickAdapter);
  assert.ok(TwitchAdapter);
  assert.ok(parseStreamUrl);
  assert.ok(getAdapter);
  assert.ok(registerAdapter);
  assert.ok(Array.isArray(SUPPORTED_PLATFORMS));
  assert.ok(SUPPORTED_PLATFORMS.includes("kick"));
  assert.ok(SUPPORTED_PLATFORMS.includes("twitch"));
  assert.ok(SUPPORTED_PLATFORMS.includes("tiktok"));
  assert.ok(SUPPORTED_PLATFORMS.includes("youtube"));
});

test("TalkAStrangerLinker - Options and URL helpers", () => {
  assert.throws(() => new TalkAStrangerLinker(), /creatorUsername is required/);
  assert.throws(() => new TalkAStrangerLinker({}), /creatorUsername is required/);

  const linker = new TalkAStrangerLinker({
    creatorUsername: "streamer_pro",
    autoSupportLink: true,
  });

  assert.equal(linker.getProfileUrl(), "https://talkastranger.com/streamer_pro");
  assert.equal(linker.getCreatorStudioUrl(), "https://talkastranger.com/creator-studio");
  assert.ok(linker.getSupportLinkText().includes("streamer_pro"));
  assert.ok(linker.getCountryLaneLinks(5).includes("United States"));
});

test("TalkAStrangerLinker - linkStream with Kick.com", async () => {
  const linker = new TalkAStrangerLinker({
    creatorUsername: "creator_test",
  });

  const res = await linker.linkStream({
    platform: "kick",
    streamUrl: "https://kick.com/ninja",
    title: "Live Kick Stream on TalkAStranger",
    description: "Welcome to my Kick broadcast!",
  });

  assert.ok(res.id.startsWith("stream_"));
  assert.equal(res.platform, "kick");
  assert.equal(res.channelId, "ninja");
  assert.equal(res.streamUrl, "https://kick.com/ninja");
  assert.equal(res.title, "Live Kick Stream on TalkAStranger");
  assert.ok(res.description.includes("Welcome to my Kick broadcast!"));
  assert.ok(res.description.includes("Stream powered by TalkAStranger"));
  assert.ok(res.supportLink);
  assert.equal(res.creatorProfile, "https://talkastranger.com/creator_test");
  assert.equal(res.creatorStudio, "https://talkastranger.com/creator-studio");

  assert.equal(linker.getLinkedStreams().length, 1);
  assert.equal(linker.getLinkedStreams()[0].id, res.id);

  // Unlink stream
  const removed = linker.unlinkStream(res.id);
  assert.equal(removed, true);
  assert.equal(linker.getLinkedStreams().length, 0);
});

test("TalkAStrangerLinker - linkStream with Twitch.tv", async () => {
  const linker = new TalkAStrangerLinker({
    creatorUsername: "creator_test",
  });

  const res = await linker.linkStream({
    platform: "twitch",
    streamUrl: "https://www.twitch.tv/SHROUD?ref=promo#chat",
    title: "Championship Live",
  });

  assert.equal(res.platform, "twitch");
  assert.equal(res.channelId, "shroud"); // normalized to lowercase
  assert.equal(res.streamUrl, "https://www.twitch.tv/shroud");
  assert.equal(res.title, "Championship Live");
  assert.ok(res.metadata);
  assert.equal(res.metadata.channel, "shroud");
});

test("TalkAStrangerLinker - Rejects platform and URL mismatch", async () => {
  const linker = new TalkAStrangerLinker({ creatorUsername: "test" });

  // Providing kick platform with twitch URL should fail
  await assert.rejects(
    async () => {
      await linker.linkStream({
        platform: "kick",
        streamUrl: "https://www.twitch.tv/shroud",
      });
    },
    /KickAdapter/
  );

  // Providing twitch platform with kick URL should fail
  await assert.rejects(
    async () => {
      await linker.linkStream({
        platform: "twitch",
        streamUrl: "https://kick.com/xqc",
      });
    },
    /TwitchAdapter/
  );
});

test("parseStreamUrl helper - automatic detection and parsing", () => {
  const kickResult = parseStreamUrl("https://kick.com/streamer_abc");
  assert.equal(kickResult.platform, "kick");
  assert.equal(kickResult.channelId, "streamer_abc");

  const twitchResult = parseStreamUrl("https://www.twitch.tv/POKIMANE");
  assert.equal(twitchResult.platform, "twitch");
  assert.equal(twitchResult.channelId, "pokimane");
});
