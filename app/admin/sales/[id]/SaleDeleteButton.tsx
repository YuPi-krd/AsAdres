"use client";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, "");

import { useRouter } from "next/navigation";

export default function SaleDeleteButton({
  saleId,
}: {
  saleId: number;
}) {
  const router = useRouter();

  async function handleDelete() {
    const confirmed = confirm(
      "Удалить сделку?"
    );

    if (!confirmed) return;

    const res = await fetch(
      `${API_URL}/sales/${saleId}`,
      {
        method: "DELETE",
      }
    );

    if (res.ok) {
      router.push("/admin/sales");
      router.refresh();
    } else {
      alert("Ошибка удаления");
    }
  }

  return (
    <button
      onClick={handleDelete}
      style={{
        background: "#ef4444",
        color: "white",
        border: "none",
        padding: "12px 18px",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: 600,
      }}
    >
      🗑 Удалить
    </button>
  );
}