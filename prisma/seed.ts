import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create a default test user
  const hashedPassword = await bcrypt.hash("123456", 10);
  const owner = await prisma.user.upsert({
    where: { email: "owner@parknoktam.com" },
    update: {},
    create: {
      name: "Ahmet Yılmaz",
      email: "owner@parknoktam.com",
      password: hashedPassword,
      phone: "+905551234567",
      tcKimlik: "12345678901",
      birthDate: new Date("1990-01-01"),
      gender: "erkek",
    },
  });

  const generatePhotoArr = () => JSON.stringify(["https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&q=80&w=400"]);

  const spotsData = [
    {
      title: "Rize Çarşı Merkez Kapalı Otoparkı",
      description: "Rize çarşı merkezinde, alışveriş ve iş bölgesine yürüme mesafesinde kapalı ve güvenli otopark.",
      address: "Cumhuriyet Cad. No: 12, Merkez, Rize",
      lat: 41.0201,
      lng: 40.5234,
      category: "isletme",
      spotType: "kapali",
      pricePerHour: 30.0,
      hasCCTV: true,
      hasEVCharger: false,
      isHandicapped: true,
      rating: 4.7,
      reviewCount: 98,
      photos: generatePhotoArr(),
    },
    {
      title: "Rize Belediyesi İskele Otoparkı",
      description: "Rize iskelesine ve sahiline çok yakın, 7/24 güvenlik kameralı belediye otoparkı.",
      address: "İskele Mah. Atatürk Cad. No: 3, Rize",
      lat: 41.0220,
      lng: 40.5260,
      category: "belediye",
      spotType: "acik",
      pricePerHour: 20.0,
      hasCCTV: true,
      hasEVCharger: true,
      isHandicapped: true,
      rating: 4.5,
      reviewCount: 210,
      photos: generatePhotoArr(),
    },
    {
      title: "Tophane Mahallesi Bireysel Garaj",
      description: "Sakin bir mahallede, özel kapalı garaj. Günlük ve aylık kiralama imkânı.",
      address: "Tophane Mah. Çay Sok. No: 7, Merkez, Rize",
      lat: 41.0185,
      lng: 40.5215,
      category: "bireysel",
      spotType: "kapali",
      pricePerHour: 45.0,
      hasCCTV: false,
      hasEVCharger: false,
      isHandicapped: false,
      rating: 4.9,
      reviewCount: 22,
      photos: generatePhotoArr(),
    },
    {
      title: "Rize Devlet Hastanesi Yanı Park",
      description: "Hastane ziyaretçileri ve yakın esnaf için uygun fiyatlı açık otopark alanı.",
      address: "Bahçelievler Mah. Hastane Cad. No: 5, Rize",
      lat: 41.0175,
      lng: 40.5200,
      category: "isletme",
      spotType: "acik",
      pricePerHour: 25.0,
      hasCCTV: true,
      hasEVCharger: false,
      isHandicapped: true,
      rating: 4.3,
      reviewCount: 67,
      photos: generatePhotoArr(),
    },
    {
      title: "Fener Mahallesi Site Otoparkı",
      description: "Fener mahallesindeki rezidans sitesinin kapalı otoparkı. Güvenlik görevlisi 24 saat.",
      address: "Fener Mah. Deniz Yolu Cad. No: 18, Rize",
      lat: 41.0210,
      lng: 40.5250,
      category: "site",
      spotType: "kapali",
      pricePerHour: 50.0,
      hasCCTV: true,
      hasEVCharger: true,
      isHandicapped: false,
      rating: 4.8,
      reviewCount: 41,
      photos: generatePhotoArr(),
    },
    {
      title: "Recep Tayyip Erdoğan Üniversitesi Park Alanı",
      description: "RTEÜ kampüsü yakınında, öğrenci ve akademisyenler için uygun fiyatlı park noktası.",
      address: "Zihni Derin Kampüsü, Merkez, Rize",
      lat: 41.0155,
      lng: 40.5180,
      category: "bireysel",
      spotType: "acik",
      pricePerHour: 15.0,
      hasCCTV: false,
      hasEVCharger: false,
      isHandicapped: false,
      rating: 4.2,
      reviewCount: 33,
      photos: generatePhotoArr(),
    },
  ];


  for (const spot of spotsData) {
    const existing = await prisma.parkingSpot.findFirst({
      where: { title: spot.title }
    });

    if (!existing) {
      await prisma.parkingSpot.create({
        data: {
          ...spot,
          ownerId: owner.id,
        }
      });
      console.log(`Created spot: ${spot.title}`);
    }
  }

  console.log("Seeding finished successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
