import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  const r = await p.parkingSpot.deleteMany({});
  console.log("Silindi:", r.count, "otopark");
  await p.$disconnect();
}
main().catch(console.error);
