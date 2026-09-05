import { RecoveryCase, PaymentInfo, RecoveryAttempt, AuditEvent } from "@/types";

export async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  // In browser, relative /api/... is proxied by Next.js rewrite to http://localhost:8080/api/...
  try {
    const res = await fetch(path, options);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return (await res.json()) as T;
  } catch {
    const directUrl = `http://localhost:8080${path}`;
    const directRes = await fetch(directUrl, options);
    if (!directRes.ok) throw new Error(`HTTP ${directRes.status}: ${directRes.statusText}`);
    return (await directRes.json()) as T;
  }
}

export function formatINR(val: number | string | null | undefined): string {
  if (val === null || val === undefined || isNaN(Number(val))) return "₹0.00";
  const num = Number(val);
  return "₹" + num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatCompactINR(val: number | string | null | undefined): string {
  if (val === null || val === undefined || isNaN(Number(val))) return "₹0.00";
  const num = Number(val);
  if (num >= 100000) {
    const lakhs = num / 100000;
    return `₹${lakhs.toFixed(2)} L`;
  }
  return "₹" + num.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function shortPaymentId(paymentId?: string): string {
  if (!paymentId) return "P-UNKNOWN";
  // If paymentId is a UUID, grab characters to form P-xxxxx
  const cleaned = paymentId.replace(/-/g, "");
  return `P-${cleaned.slice(0, 5).toUpperCase()}`;
}

export function shortCaseId(caseId?: string): string {
  if (!caseId) return "CASE-UNKNOWN";
  const cleaned = caseId.replace(/-/g, "");
  return `RC-${cleaned.slice(0, 5).toUpperCase()}`;
}
