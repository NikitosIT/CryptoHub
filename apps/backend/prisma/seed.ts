import { prisma } from "@/libs/db.js";

async function main() {
  // создаём тестового пользователя
  const user = await prisma.user.create({
    data: {
      name: "Sanya",
      email: "test22@example.com",
    },
  });
  console.log(user);
  // создаём несколько Telegram постов
  await prisma.telegramPost.createMany({
    data: [
      {
        textCaption: "Bitcoin is going up 🚀",
        cryptoTokens: ["BTC"],
        likeCount: 10,
        tgAuthorTitle: "Crypto Alpha",
        tgAuthorUsername: "cryptoalpha",
        tgAuthorId: "-3456787654",
        mediaGroupId: "grp1",
        media: [0],
        dislikeCount: 1,
        favoritesCount: 0,
      },
      {
        textCaption: "Ethereum update incoming",
        cryptoTokens: ["ETH"],
        tgAuthorTitle: "Crypto Vision",
        tgAuthorUsername: "cryptovision",
        tgAuthorId: "-3456787653",
        mediaGroupId: "grp1",
        media: [1],
        dislikeCount: 1,
        favoritesCount: 2,
      },
      {
        textCaption: "Solana ecosystem growing fast",
        cryptoTokens: ["SOL"],
        tgAuthorTitle: "Solana Daily",
        tgAuthorUsername: "solanadaily",
        tgAuthorId: "-34567876543",
        mediaGroupId: "grp2",
        media: [2],
        dislikeCount: 0,
        favoritesCount: 1,
      },
      {
        textCaption: "BNB chain activity rising",
        cryptoTokens: ["BNB"],
        tgAuthorTitle: "BNB Radar",
        tgAuthorUsername: "bnbradar",
        tgAuthorId: "-3456787654",
        mediaGroupId: "grp2",
        media: [3],
        likeCount: 5,
        dislikeCount: 0,
        favoritesCount: 0,
      },
      {
        textCaption: "XRP legal news update",
        cryptoTokens: ["XRP"],
        tgAuthorTitle: "XRP Journal",
        tgAuthorUsername: "xrpjournal",
        tgAuthorId: "-3456787654",
        mediaGroupId: "grp3",
        media: [4],
        likeCount: 3,
        dislikeCount: 1,
        favoritesCount: 1,
      },
      {
        textCaption: "Cardano roadmap released",
        cryptoTokens: ["ADA"],
        tgAuthorTitle: "Cardano Hub",
        tgAuthorUsername: "cardanohub",
        tgAuthorId: "-3456787654",
        mediaGroupId: "grp3",
        media: [5],
        likeCount: 7,
        dislikeCount: 0,
        favoritesCount: 2,
      },
      {
        textCaption: "Dogecoin trending again",
        cryptoTokens: ["DOGE"],
        tgAuthorTitle: "Doge Times",
        tgAuthorUsername: "dogetimes",
        tgAuthorId: "-3456787654",
        mediaGroupId: "grp4",
        media: [6],
        likeCount: 15,
        dislikeCount: 3,
        favoritesCount: 5,
      },
      {
        textCaption: "Polkadot parachains expanding",
        cryptoTokens: ["DOT"],
        tgAuthorTitle: "Dot Wire",
        tgAuthorUsername: "dotwire",
        tgAuthorId: "-3456787654",
        mediaGroupId: "grp4",
        media: [7],
        likeCount: 4,
        dislikeCount: 0,
        favoritesCount: 1,
      },
      {
        textCaption: "Avalanche DeFi growth",
        cryptoTokens: ["AVAX"],
        tgAuthorTitle: "Avax Flow",
        tgAuthorUsername: "avaxflow",
        tgAuthorId: "-3456787654",
        mediaGroupId: "grp5",
        media: [8],
        likeCount: 6,
        dislikeCount: 1,
        favoritesCount: 2,
      },
      {
        textCaption: "Chainlink oracle expansion",
        cryptoTokens: ["LINK"],
        tgAuthorTitle: "Link Pulse",
        tgAuthorUsername: "linkpulse",
        tgAuthorId: "-3456787654",
        mediaGroupId: "grp5",
        media: [9],
        likeCount: 8,
        dislikeCount: 0,
        favoritesCount: 3,
      },
      {
        textCaption: "Litecoin adoption increasing",
        cryptoTokens: ["LTC"],
        tgAuthorTitle: "Litecoin Feed",
        tgAuthorUsername: "litecoinfeed",
        tgAuthorId: "-3456787654",
        mediaGroupId: "grp6",
        media: [10],
        likeCount: 2,
        dislikeCount: 0,
        favoritesCount: 0,
      },
      {
        textCaption: "Toncoin gaining traction",
        cryptoTokens: ["TON"],
        tgAuthorTitle: "TON Scope",
        tgAuthorUsername: "tonscope",
        tgAuthorId: "-3456787654",
        mediaGroupId: "grp6",
        media: [11],
        likeCount: 9,
        dislikeCount: 1,
        favoritesCount: 4,
      },
    ],
  });

  await prisma.userCard.createMany({
    data: [
      {
        amount: 23,
        cardName: "PrivatBank",
        name: "Jora",
        pin: "1235",
      },
      {
        amount: 126,
        cardName: "MonoBank",
        name: "Kolya",
        pin: "6666",
      },
      {
        amount: 88,
        cardName: "Tinkoff",
        name: "Jeka",
        pin: "9191",
      },
    ],
  });

  console.log("✅ Seed data created");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
