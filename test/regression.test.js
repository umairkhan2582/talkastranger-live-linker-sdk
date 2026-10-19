const test = require("node:test");
const assert = require("node:assert/strict");
const { TalkAStrangerLinker } = require("../talkastranger-linker");

test("Regression - TikTok streaming links remain fully supported", async () => {
  const linker = new TalkAStrangerLinker({ creatorUsername: "creator_live" });

  const res = await linker.linkStream({
    platform: "tiktok",
    streamUrl: "https://www.tiktok.com/@tiktok_star/live",
    title: "TikTok Live Reactions",
    description: "Catch me live on TikTok!",
  });

  assert.equal(res.platform, "tiktok");
  assert.equal(res.channelId, "tiktok_star");
  assert.ok(res.streamUrl);
  assert.ok(res.description.includes("Catch me live on TikTok!"));
  assert.ok(res.description.includes("Stream powered by TalkAStranger"));
});

test("Regression - YouTube cross-broadcasting links remain fully supported", async () => {
  const linker = new TalkAStrangerLinker({ creatorUsername: "creator_live" });

  const res = await linker.linkStream({
    platform: "youtube",
    streamUrl: "https://www.youtube.com/@techcreator/live",
    title: "YouTube Live Show",
  });

  assert.equal(res.platform, "youtube");
  assert.equal(res.channelId, "@techcreator");
  assert.ok(res.streamUrl);
});

test("Regression - Auto support link can be disabled", async () => {
  const linker = new TalkAStrangerLinker({
    creatorUsername: "creator_live",
    autoSupportLink: false,
  });

  const res = await linker.linkStream({
    platform: "kick",
    streamUrl: "https://kick.com/cleanstream",
    description: "Pure custom description",
  });

  assert.equal(res.description, "Pure custom description");
});

test("Regression - Error handling on missing params", async () => {
  const linker = new TalkAStrangerLinker({ creatorUsername: "creator_live" });

  await assert.rejects(
    async () => await linker.linkStream(null),
    /platform and streamUrl are required/
  );

  await assert.rejects(
    async () => await linker.linkStream({ platform: "unsupported", streamUrl: "https://example.com" }),
    /platform must be one of/
  );
});
