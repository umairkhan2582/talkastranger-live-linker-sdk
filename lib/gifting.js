const { EventEmitter } = require("events");

const GIFT_CATALOG = {
  rose: { id: "rose", name: "Rose", priceUSD: 1.00, sound: "spark", icon: "🌹", tier: "common" },
  energy: { id: "energy", name: "Energy Drink", priceUSD: 3.00, sound: "spark", icon: "⚡", tier: "common" },
  diamond: { id: "diamond", name: "Diamond Ring", priceUSD: 5.00, sound: "hearts", icon: "💎", tier: "rare" },
  crown: { id: "crown", name: "Golden Crown", priceUSD: 10.00, sound: "crown", icon: "👑", tier: "epic" },
  dragon: { id: "dragon", name: "Mythic Dragon", priceUSD: 25.00, sound: "crown", icon: "🐉", tier: "legendary" },
  galaxy: { id: "galaxy", name: "Celestial Galaxy", priceUSD: 50.00, sound: "crown", icon: "🌌", tier: "mythic" },
  universe: { id: "universe", name: "The Universe", priceUSD: 100.00, sound: "crown", icon: "🪐", tier: "celestial" }
};

class StripeGiftingBridge extends EventEmitter {
  constructor(options = {}) {
    super();
    this.creatorAccountId = options.creatorAccountId || null;
    this.streamerUsername = options.streamerUsername || "Streamer";
    this.currency = (options.currency || "usd").toLowerCase();
    this.platformFeePercent = options.platformFeePercent !== undefined ? options.platformFeePercent : 0.0; // 0% platform fee for creator-direct gifts
  }

  getGiftCatalog() {
    return Object.values(GIFT_CATALOG);
  }

  getGift(giftId) {
    return GIFT_CATALOG[giftId] || null;
  }

  createGiftCheckoutConfig(options = {}) {
    const giftId = options.giftId;
    const gift = this.getGift(giftId);
    if (!gift) {
      throw new Error(`StripeGiftingBridge: Unknown giftId "${giftId}". Available gifts: ${Object.keys(GIFT_CATALOG).join(", ")}`);
    }

    const creatorId = options.creatorAccountId || this.creatorAccountId;
    if (!creatorId) {
      throw new Error("StripeGiftingBridge: creatorAccountId (Stripe Connect ID, e.g. acct_123) is required for gift checkout.");
    }

    const viewerName = options.viewerName || "Anonymous Fan";
    const message = options.message || `Sent ${gift.name} ${gift.icon}`;
    const amountInCents = Math.round(gift.priceUSD * 100);
    const feeAmountInCents = Math.round(amountInCents * (this.platformFeePercent / 100));

    return {
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: this.currency,
            product_data: {
              name: `Live Stream Gift: ${gift.name} ${gift.icon}`,
              description: `Direct gift to @${this.streamerUsername}: "${message}"`,
              images: [`https://talkastranger.com/assets/gifts/${gift.id}.png`]
            },
            unit_amount: amountInCents
          },
          quantity: 1
        }
      ],
      mode: "payment",
      payment_intent_data: {
        application_fee_amount: feeAmountInCents,
        transfer_data: {
          destination: creatorId
        },
        metadata: {
          type: "talkastranger_live_gift",
          giftId: gift.id,
          giftName: gift.name,
          viewerName,
          streamerUsername: this.streamerUsername,
          message
        }
      },
      metadata: {
        giftId: gift.id,
        viewerName,
        streamerUsername: this.streamerUsername
      },
      success_url: options.successUrl || `https://talkastranger.com/gift-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: options.cancelUrl || `https://talkastranger.com/gift-canceled`
    };
  }

  recordGiftReceived(giftEvent) {
    const gift = this.getGift(giftEvent.giftId) || {
      id: giftEvent.giftId || "custom",
      name: "Custom Gift",
      priceUSD: giftEvent.amountUSD || 5.0,
      sound: "spark",
      icon: "🎁"
    };

    const event = {
      id: giftEvent.id || `gift_${Date.now()}`,
      giftId: gift.id,
      giftName: gift.name,
      icon: gift.icon,
      priceUSD: gift.priceUSD,
      viewerName: giftEvent.viewerName || "A generous viewer",
      message: giftEvent.message || "",
      sound: gift.sound,
      receivedAt: Date.now()
    };

    this.emit("gift:received", event);
    return event;
  }
}

module.exports = {
  GIFT_CATALOG,
  StripeGiftingBridge
};
