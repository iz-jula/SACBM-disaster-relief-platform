export type PortalCurrency = "MZN" | "USD";

export const formatPortalCurrency = (amount: number, currency: PortalCurrency) =>
  new Intl.NumberFormat(currency === "MZN" ? "en-MZ" : "en-US", {
    style: "currency",
    currency,
    currencyDisplay: "code",
    maximumFractionDigits: 0,
  }).format(amount);
