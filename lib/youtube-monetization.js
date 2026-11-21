const crypto = require("crypto");
const { EventEmitter } = require("events");

class YouTubeLiveMonetization extends EventEmitter {
  constructor(options = {}) {
    super();
    this.channelId = options.channelId || null;
    this.creatorAccountId = options.creatorAccountId || null;
    this.secret = options.secret || crypto.randomBytes(16).toString("hex");
  }

  createPayPerViewSession(options = {}) {
    const broadcastId = options.broadcastId;
    if (!broadcastId) {
      throw new Error("YouTubeLiveMonetization: broadcastId is required to create a PPV session");
    }

    const title = options.title || "Exclusive YouTube Live Pass";
    const ticketPriceUSD = typeof options.ticketPriceUSD === "number" ? options.ticketPriceUSD : 9.99;
    const destination = options.creatorAccountId || this.creatorAccountId;
    const amountInCents = Math.round(ticketPriceUSD * 100);

    const ticketId = `ppv_${crypto.randomBytes(8).toString("hex")}`;
    const tokenPayload = {
      ticketId,
      broadcastId,
      expiresAt: Date.now() + (options.validHours || 24) * 3600 * 1000
    };
    const tokenData = Buffer.from(JSON.stringify(tokenPayload)).toString("base64url");
    const signature = crypto.createHmac("sha256", this.secret).update(tokenData).digest("base64url");
    const accessToken = `${tokenData}.${signature}`;

    const checkoutConfig = {
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Live Pass: ${title}`,
              description: `Ticket access for YouTube Live broadcast ${broadcastId}`
            },
            unit_amount: amountInCents
          },
          quantity: 1
        }
      ],
      mode: "payment",
      metadata: {
        type: "youtube_live_ppv_ticket",
        ticketId,
        broadcastId,
        accessToken
      },
      success_url: options.successUrl || `https://talkastranger.com/live-gate?broadcastId=${broadcastId}&access_token=${accessToken}`,
      cancel_url: options.cancelUrl || `https://talkastranger.com/live-gate?broadcastId=${broadcastId}&canceled=1`
    };

    if (destination) {
      checkoutConfig.payment_intent_data = {
        transfer_data: { destination }
      };
    }

    return {
      ticketId,
      accessToken,
      checkoutConfig,
      accessUrl: checkoutConfig.success_url
    };
  }

  verifyTicketAccess(accessToken, expectedBroadcastId) {
    if (!accessToken || typeof accessToken !== "string" || !accessToken.includes(".")) {
      return { authorized: false, error: "Malformed access token" };
    }
    const [tokenData, receivedHmac] = accessToken.split(".");
    const expectedHmac = crypto.createHmac("sha256", this.secret).update(tokenData).digest("base64url");
    if (receivedHmac !== expectedHmac) {
      return { authorized: false, error: "Invalid ticket cryptographic signature" };
    }
    try {
      const payload = JSON.parse(Buffer.from(tokenData, "base64url").toString("utf-8"));
      if (Date.now() > payload.expiresAt) {
        return { authorized: false, error: "Ticket has expired" };
      }
      if (expectedBroadcastId && payload.broadcastId !== expectedBroadcastId) {
        return { authorized: false, error: "Ticket is for a different broadcast" };
      }
      return { authorized: true, ticket: payload };
    } catch {
      return { authorized: false, error: "Corrupted ticket token" };
    }
  }

  createDirectTipConfig(options = {}) {
    const broadcastId = options.broadcastId;
    const amountUSD = options.amountUSD || 5.0;
    const viewerName = options.viewerName || "Supporter";
    const message = options.message || "Keep up the great stream!";
    const destination = options.creatorAccountId || this.creatorAccountId;

    return {
      title: "Direct 0%-Cut Stream Tip",
      platform: "youtube-direct-stripe",
      comparisonVsSuperChat: {
        creatorReceivesPercent: "100%",
        youtubeSuperChatDeduction: "30% (Avoided)"
      },
      stripeConfig: {
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Direct Tip from ${viewerName}`,
                description: message
              },
              unit_amount: Math.round(amountUSD * 100)
            },
            quantity: 1
          }
        ],
        mode: "payment",
        metadata: {
          broadcastId,
          viewerName,
          message,
          type: "youtube_direct_tip"
        }
      }
    };
  }
}

module.exports = {
  YouTubeLiveMonetization
};
