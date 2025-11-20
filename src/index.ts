import { App } from "./app";
import { PrismaClient } from "./generated/prisma";

const prisma = new PrismaClient();

const main = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully!");

    const app = new App();
    app.start();
    
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    process.exit(1);
  }
};

main();
