export const formatNumberWithComma = (number: number) => {
  return new Intl.NumberFormat().format(Number(number.toFixed(2)));
};
