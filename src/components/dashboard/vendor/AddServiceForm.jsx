"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import ServiceForm from "@/components/dashboard/vendor/ServiceForm";

export default function AddServiceForm() {
  const router = useRouter();

  const handleCreate = async (values) => {
    const result = await apiFetch("/api/services", {
      method: "POST",
      body: values,
    });
    toast.success(result.message || "Service submitted successfully");
    router.push("/dashboard/vendor/services");
    router.refresh();
  };

  return (
    <ServiceForm
      submitLabel="Submit Service"
      onSubmit={handleCreate}
      cancelHref="/dashboard/vendor/services"
    />
  );
}
