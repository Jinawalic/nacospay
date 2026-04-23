const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function main() {
  console.log("Checking DATABASE_URL:", process.env.DATABASE_URL ? "Exists" : "MISSING");
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

  try {
    await prisma.$connect();
    console.log("✅ Successfully connected to the database!");
    const count = await prisma.student.count();
    console.log("Student count:", count);
  } catch (e) {
    console.error("❌ Connection failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
