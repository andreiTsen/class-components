type TypeGuard<T> = (value: unknown) => value is T;

export const fetchValidatedResponse = async <T>(
  url: string,
  isExpectedResponse: TypeGuard<T>,
  errorMessage: string
): Promise<T> => {
  try {
    const response: Response = await fetch(url);

    if (!response.ok) {
      throw new Error(errorMessage);
    }

    const data: unknown = await response.json();

    if (!isExpectedResponse(data)) {
      throw new Error(errorMessage);
    }

    return data;
  } catch {
    throw new Error(errorMessage);
  }
};
