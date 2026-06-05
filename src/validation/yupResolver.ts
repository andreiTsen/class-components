import type { Resolver } from 'react-hook-form';
import { ValidationError } from 'yup';
import { createFormSchema, type FormValues } from './formSchema';

function getErrorMessage(error: ValidationError): string {
  return error.message || 'Invalid value';
}

function createResolveFormValues(countries: string[]): Resolver<FormValues> {
  return async (values) => {
    try {
      const validatedValues = await createFormSchema(countries).validate(
        values,
        {
          abortEarly: false,
        }
      );

      return {
        errors: {},
        values: validatedValues,
      };
    } catch (error) {
      if (!(error instanceof ValidationError)) {
        throw error;
      }

      return {
        errors: Object.fromEntries(
          error.inner.map((validationError) => [
            validationError.path ?? '',
            {
              message: getErrorMessage(validationError),
              type: validationError.type ?? 'validation',
            },
          ])
        ),
        values: {},
      };
    }
  };
}

export function yupResolver(countries: string[]): Resolver<FormValues> {
  return createResolveFormValues(countries);
}
