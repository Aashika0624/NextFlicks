export const roundItUp = (value, decimal) => {
  const factor = Math.pow(10, decimal);
  return Math.round(value * factor) / factor;
};
