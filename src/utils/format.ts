/**
 * Format number to Indonesian Rupiah currency
 * @param amount - The number to format
 * @param options - Optional formatting options
 * @returns Formatted string in Indonesian Rupiah format
 */
export const formatRupiah = (
  amount: number | string,
  options: {
    withSymbol?: boolean;
    withDecimals?: boolean;
  } = {}
) => {
  const { withSymbol = true, withDecimals = false } = options;

  // Convert to number and handle invalid input
  const num = Number(amount);
  if (isNaN(num)) return "0";

  // Format the number with thousand separators
  const formatted = num.toLocaleString("id-ID", {
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  });

  // Add currency symbol if requested
  return withSymbol ? `Rp ${formatted}` : formatted;
};

/**
 * Format number to compact form (e.g., 1.2K, 1.2M)
 * @param amount - The number to format
 * @returns Formatted string in compact form
 */
export const formatCompact = (amount: number | string) => {
  const num = Number(amount);
  if (isNaN(num)) return "0";
  return num.toLocaleString("id-ID", { notation: "compact" });
};

/**
 * Format number to percentage
 * @param amount - The number to format
 * @param decimals - Number of decimal places
 * @returns Formatted string as percentage
 */
export const formatPercentage = (
  amount: number | string,
  decimals: number = 1
) => {
  const num = Number(amount);
  if (isNaN(num)) return "0%";
  return `${num.toFixed(decimals)}%`;
};
