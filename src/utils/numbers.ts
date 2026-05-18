export const isPositiveInteger = (value: number) => {
  return Number.isInteger(value) && value > 0;
};

export const parsePositiveInteger = (value: string | null | undefined) => {
  const parsedValue = Number(value);

  return isPositiveInteger(parsedValue) ? parsedValue : null;
};
