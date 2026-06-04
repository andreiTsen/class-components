import type { Resolver } from 'react-hook-form';
import { ValidationError } from 'yup';
import { formSchema, type FormValues } from './formSchema';

function getErrorMessage(error: ValidationError): string {
  return error.message || 'Invalid value';
}

const resolveFormValues: Resolver<FormValues> = async (values) => {
  try {
    const validatedValues = await formSchema.validate(values, {
      abortEarly: false,
    });

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

export function yupResolver(): Resolver<FormValues> {
  return resolveFormValues;
}
