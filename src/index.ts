import { App } from "./app";
import { PrismaClient } from "./generated/prisma";
import { startCronJob } from "./utils/scheduler";

const prisma = new PrismaClient();

const main = async () => {
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully!");

    startCronJob();

    const app = new App();
    app.start();
    
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    process.exit(1);
  }
};

main();
