"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useOrderStore } from "@/app/store/useOrderStore";

export default function EsewaSuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { placeUserOrder } = useOrderStore();

  useEffect(() => {
    const encoded = searchParams.get("data");
    if (!encoded) {
      toast.error("No payment data received.");
      return;
    }

    const confirmPayment = async () => {
      const res = await placeUserOrder(encoded);

      if (res) router.push("/");
      else router.push("/esewa/failure");
    };

    confirmPayment();
  }, [placeUserOrder, searchParams, router]);

  return <div>Processing your payment...</div>;
}
