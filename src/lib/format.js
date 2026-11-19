export function formatPrice(price) {
  const number = Number(price) || 0;
  return `$${number.toLocaleString("en-US")}`;
}


// "2027-06-15" -> "Jun 15, 2027" (no time zone shifting)
export function formatEventDate(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ISO timestamp -> "Nov 18, 2026"
export function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Stripe stores money in the smallest unit (cents), so 999 -> "$9.99"
export function formatMoney(amountInCents, currency = "usd") {
  const value = (Number(amountInCents) || 0) / 100;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: String(currency).toUpperCase(),
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${String(currency).toUpperCase()}`;
  }
}

// ISO timestamp -> "Nov 18, 2026, 4:30 PM"
export function formatDateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

