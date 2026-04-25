import { prisma } from "@/libs/db.js";

async function main() {
  // создаём тестового пользователя
  const user = await prisma.user.create({
    data: {
      name: "Sanya",
      email: "test132@example.com",
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
        tgAuthorId: -3456787654,
        mediaGroupId: "3456787654",
        media: [0],
        dislikeCount: 1,
        favoritesCount: 0,
      },
      {
        textCaption: "Ethereum update incoming",
        cryptoTokens: ["ETH"],
        tgAuthorId: -3456787654,
        mediaGroupId: "3456787654",
        media: [0],
        dislikeCount: 1,
        favoritesCount: 0,
      },
      {
        textCaption: "Solana ecosystem growing fast",
        cryptoTokens: ["SOL"],
        tgAuthorId: -3456787654,
        mediaGroupId: "3456787654",
        media: [0],
        dislikeCount: 1,
        favoritesCount: 0,
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
