type Validator<T> = (value: unknown) => value is T;

export const fetchValidated = async <T>(
  url: string,
  validator: Validator<T>,
  errorMessage: string
): Promise<T> => {
  try {
    const response: Response = await fetch(url);

    if (!response.ok) {
      throw new Error(errorMessage);
    }

    const data: unknown = await response.json();

    if (!validator(data)) {
      throw new Error(errorMessage);
    }

    return data;
  } catch {
    throw new Error(errorMessage);
  }
};
