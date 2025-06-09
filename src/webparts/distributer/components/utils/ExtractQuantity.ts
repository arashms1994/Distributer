export function extractQuantity(text: string | undefined | null): number {
  if (typeof text !== "string") {
    return 1;
  }

  const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  persianNumbers.forEach((num, index) => {
    const regex = new RegExp(num, "g");
    text = text.replace(regex, index.toString());
  });

  const match = text.match(/(\d+)\s*(?:متر[یي]|رول|حلقه|بسته|کارتن)/);

  if (match) {
    return parseInt(match[1], 10);
  } else {
    return 1;
  }
}
