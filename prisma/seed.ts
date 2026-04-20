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
      title: "Kadıköy İskele Açık Otopark",
      description: "Kadıköy iskelesine ve çarşıya yürüme mesafesinde güvenli açık otopark.",
      address: "Caferağa Mah. Moda Cad. No: 15, Kadıköy, İstanbul",
      lat: 40.9893,
      lng: 29.0256,
      category: "isletme",
      spotType: "acik",
      pricePerHour: 45.0,
      hasCCTV: true,
      hasEVCharger: false,
      isHandicapped: true,
      rating: 4.8,
      reviewCount: 152,
      photos: generatePhotoArr(),
    },
    {
      title: "Moda Sahil Özel Garaj",
      description: "Moda sahilinde kapalı, güvenli ve 7/24 kamera sistemli bireysel otopark alanı.",
      address: "Caferağa Mah. Cem Sok. No: 5, Kadıköy, İstanbul",
      lat: 40.9822,
      lng: 29.0264,
      category: "bireysel",
      spotType: "kapali",
      pricePerHour: 60.0,
      hasCCTV: true,
      hasEVCharger: true,
      isHandicapped: false,
      rating: 5.0,
      reviewCount: 34,
      photos: generatePhotoArr(),
    },
    {
      title: "Beşiktaş Çarşı Yeraltı Otoparkı",
      description: "Beşiktaş merkezde, elektrikli şarj istasyonlu geniş yeraltı otoparkı.",
      address: "Sinanpaşa Mah. Beşiktaş Meydanı, Beşiktaş, İstanbul",
      lat: 41.0422,
      lng: 29.0067,
      category: "belediye",
      spotType: "kapali",
      pricePerHour: 35.0,
      hasCCTV: true,
      hasEVCharger: true,
      isHandicapped: true,
      rating: 4.5,
      reviewCount: 420,
      photos: generatePhotoArr(),
    },
    {
      title: "Mecidiyeköy Plaza VIP Park",
      description: "Trump Towers arkasında, rezidans güvenliğine sahip özel park noktası.",
      address: "Mecidiyeköy Mah. Ali Sami Yen Sok. No: 10, Şişli, İstanbul",
      lat: 41.0658,
      lng: 28.9950,
      category: "site",
      spotType: "kapali",
      pricePerHour: 80.0,
      hasCCTV: true,
      hasEVCharger: false,
      isHandicapped: true,
      rating: 4.9,
      reviewCount: 88,
      photos: generatePhotoArr(),
    },
    {
      title: "Şişhane Katlı Otopark A Bölgesi",
      description: "Galata Kulesi'ne çok yakın, geniş ve rahat park edilebilen alan.",
      address: "Müeyyedzade Mah. Meşrutiyet Cad. Beyoğlu, İstanbul",
      lat: 41.0285,
      lng: 28.9739,
      category: "isletme",
      spotType: "kapali",
      pricePerHour: 55.0,
      hasCCTV: true,
      hasEVCharger: false,
      isHandicapped: true,
      rating: 4.6,
      reviewCount: 215,
      photos: generatePhotoArr(),
    },
    {
      title: "Üsküdar Sahil Bireysel Park",
      description: "Marmaray istasyonuna 2 dakika uzaklıkta, açık kısa süreli park noktası.",
      address: "Mimar Sinan Mah. Harem Sahil Yolu, Üsküdar, İstanbul",
      lat: 41.0264,
      lng: 29.0146,
      category: "bireysel",
      spotType: "acik",
      pricePerHour: 40.0,
      hasCCTV: false,
      hasEVCharger: false,
      isHandicapped: false,
      rating: 4.4,
      reviewCount: 15,
      photos: generatePhotoArr(),
    }
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
