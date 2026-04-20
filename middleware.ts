import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/giris",
  },
});

export const config = {
  // korumalı rotalar. Sadece giriş yapmış kullanıcılar girebilir.
  matcher: [
    "/ara/:path*",
    "/sonuclar/:path*",
    "/profil/:path*",
    "/rezervasyonlar/:path*",
  ],
};
