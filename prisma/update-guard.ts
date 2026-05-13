import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Güvenlik özelliği güncelleniyor...");

  // hasGuard: true yapılacak spotlar
  const guardSpots = [
    "Rize Devlet Hastanesi Yanı Park",
    "Recep Tayyip Erdoğan Üniversitesi Park Alanı",
    "Rize Çarşı Merkez Kapalı Otoparkı",
    "Rize Belediyesi İskele Otoparkı",
    "Fener Mahallesi Site Otoparkı",
  ];

  for (const title of guardSpots) {
    const result = await prisma.parkingSpot.updateMany({
      where: { title },
      data: { hasGuard: true },
    });
    console.log(`✓ ${title}: ${result.count} kayıt güncellendi`);
  }

  console.log("\nMevcut spot durumları:");
  const all = await prisma.parkingSpot.findMany({
    select: { title: true, hasGuard: true, hasCCTV: true, hasEVCharger: true, isHandicapped: true },
  });
  for (const s of all) {
    console.log(`  ${s.title}`);
    console.log(`    Güvenlik: ${s.hasGuard} | CCTV: ${s.hasCCTV} | EV: ${s.hasEVCharger} | Engelli: ${s.isHandicapped}`);
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
