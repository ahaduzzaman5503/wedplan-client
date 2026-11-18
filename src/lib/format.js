export function formatPrice(price) {
  const number = Number(price) || 0;
  return `$${number.toLocaleString("en-US")}`;
}
