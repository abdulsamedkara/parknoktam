"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function FavoriteButton({ spotId, initialFavorited }: { spotId: string; initialFavorited: boolean }) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/user/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spotId }),
      });
      const data = await res.json();
      if (res.ok) {
        setFavorited(data.favorited);
        toast.success(data.favorited ? "Favorilere eklendi! ❤️" : "Favorilerden çıkarıldı.");
      } else if (res.status === 401) {
        toast.error("Favorilere eklemek için giriş yapmalısınız.");
      }
    } catch {
      toast.error("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="fav-btn"
      onClick={toggle}
      disabled={loading}
      style={{ opacity: loading ? 0.7 : 1 }}
    >
      <span
        className="material-symbols-outlined"
        style={{
          fontVariationSettings: favorited ? "'FILL' 1" : "'FILL' 0",
          color: favorited ? "#ef4444" : "white",
        }}
      >
        favorite
      </span>
    </button>
  );
}
