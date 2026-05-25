export const parsePositiveInteger = (value: unknown): number | null => {
  const parsedValue = Number(value);

  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null;
};
