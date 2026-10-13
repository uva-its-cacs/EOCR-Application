import type { TextFieldProps } from '@mui/material/TextField';

import { useId } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { transformValue, transformValueOnBlur, transformValueOnChange } from 'minimal-shared/utils';

import TextField from '@mui/material/TextField';

// ----------------------------------------------------------------------

export type RHFTextFieldProps = TextFieldProps & {
  name: string;
};

export function RHFTextField({
  name,
  id,
  helperText,
  slotProps,
  type = 'text',
  ...other
}: RHFTextFieldProps) {
  const { control } = useFormContext();
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const isNumberType = type === 'number';

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { ref, ...field }, fieldState: { error } }) => (
        <TextField
          {...field}
          id={inputId}
          inputRef={ref}
          fullWidth
          value={isNumberType ? transformValue(field.value) : field.value}
          onChange={(event) => {
            const transformedValue = isNumberType
              ? transformValueOnChange(event.target.value)
              : event.target.value;

            field.onChange(transformedValue);
          }}
          onBlur={(event) => {
            const transformedValue = isNumberType
              ? transformValueOnBlur(event.target.value)
              : event.target.value;

            field.onChange(transformedValue);
            field.onBlur();
          }}
          type={isNumberType ? 'text' : type}
          error={!!error}
          helperText={error?.message ?? helperText}
          slotProps={{
            ...slotProps,
            htmlInput: {
              ...slotProps?.htmlInput,
              ...(isNumberType && {
                inputMode: 'decimal',
                pattern: '[0-9]*\\.?[0-9]*',
              }),
              'aria-invalid': !!error,
            },
          }}
          {...other}
        />
      )}
    />
  );
}
