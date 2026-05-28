type CsvValue = string | number;

const escapeCsvValue = (value: CsvValue): string => {
  const stringValue = String(value);

  if (!/[",\n]/.test(stringValue)) {
    return stringValue;
  }

  return `"${stringValue.replaceAll('"', '""')}"`;
};

export const createCsvContent = (rows: CsvValue[][]): string => {
  return rows
    .map((row) => row.map((value) => escapeCsvValue(value)).join(','))
    .join('\n');
};
