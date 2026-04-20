// Auth middleware devre dışı - JWT cookie Vercel ortamında çalışmıyor
// Koruma her sayfanın kendi useSession() kontrolüyle yapılıyor
export default function middleware() {}

export const config = {
  matcher: [],
};
