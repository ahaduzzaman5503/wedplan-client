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