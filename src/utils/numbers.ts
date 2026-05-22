export const isPositiveInteger = (value: number): boolean => {
  return Number.isInteger(value) && value > 0;
};

export const parsePositiveInteger = (
  value: string | null | undefined
): number | null => {
  const parsedValue = Number(value);

  return isPositiveInteger(parsedValue) ? parsedValue : null;
};
