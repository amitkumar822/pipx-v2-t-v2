

export const CurrencyFormat = (num) => {
  if (num === null || num === undefined) return "0";

  const number = Number(num);

  if (number >= 10000000) {
    return `${(number / 10000000).toFixed(1).replace(/\.0$/, "")}Cr`; // Crore
  } else if (number >= 100000) {
    return `${(number / 100000).toFixed(1).replace(/\.0$/, "")}L`; // Lakh
  } else if (number >= 1000) {
    return `${(number / 1000).toFixed(1).replace(/\.0$/, "")}k`; // Thousand
  } else {
    return String(number);
  }
};
