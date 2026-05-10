import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import path from "path"

const dbPath = path.resolve(__dirname, "..", "dev.db")
const adapter = new PrismaBetterSqlite3({ url: dbPath })
const prisma = new PrismaClient({ adapter })

async function main() {
  const shops = await prisma.shop.deleteMany({})
  console.log(`Deleted ${shops.count} shops`)
  const users = await prisma.user.deleteMany({ where: { email: "demo@thelittleshop.app" } })
  console.log(`Deleted ${users.count} demo user`)
}
main().catch(console.error).finally(() => prisma.$disconnect())
