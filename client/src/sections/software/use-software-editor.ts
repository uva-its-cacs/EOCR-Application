import type { Software } from './types';
import type { SoftwareEditorValues } from './software-editor-schema';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { ApiError } from 'src/lib/api';

import { useToast } from 'src/components/toast/toast-provider';

import { SOFTWARE_QUERY_KEY } from './use-software';
import { updateSoftware, fetchSoftwareOptions } from './api';
import {
  softwareEditorInput,
  softwareEditorSchema,
  softwareEditorDefaults,
} from './software-editor-schema';

export function useSoftwareEditor(software: Software, onSaved: () => void) {
  const toast = useToast();
  const client = useQueryClient();
  const [saveError, setSaveError] = useState('');
  const methods = useForm<SoftwareEditorValues>({
    resolver: zodResolver(softwareEditorSchema),
    defaultValues: softwareEditorDefaults(software),
  });
  const options = useQuery({
    queryKey: ['software', 'options'],
    queryFn: fetchSoftwareOptions,
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: (values: SoftwareEditorValues) =>
      updateSoftware(software.softwareId, softwareEditorInput(values, software.updatedAt)),
    onSuccess: (saved) => {
      client.setQueryData<Software[]>(SOFTWARE_QUERY_KEY, (rows) =>
        rows?.map((row) => (row.softwareId === saved.softwareId ? saved : row))
      );
      void client.invalidateQueries({ queryKey: SOFTWARE_QUERY_KEY });
      toast.showSuccess('Software changes saved.');
    },
  });
  const submit = methods.handleSubmit(
    async (values) => {
      if (mutation.isPending || !options.data) return;
      setSaveError('');
      try {
        await mutation.mutateAsync(values);
        onSaved();
      } catch (error) {
        if (error instanceof ApiError) {
          const errors = error.problem?.errors ?? {};
          const fields = Object.keys(methods.getValues()) as (keyof SoftwareEditorValues)[];
          let first = true;
          for (const [serverField, messages] of Object.entries(errors)) {
            const field = fields.find((name) => name.toLowerCase() === serverField.toLowerCase());
            if (field && messages.length) {
              methods.setError(
                field,
                { type: 'server', message: messages.join(' ') },
                { shouldFocus: first }
              );
              first = false;
            }
          }
          toast.showError(
            error.status === 409
              ? 'Another administrator changed this software. Your edits are still here. Cancel, refresh the list, and reopen the editor before saving.'
              : error.status === 403 || error.status === 401
                ? 'You no longer have administrator access. Your edits have not been saved.'
                : (error.problem?.detail ??
                  'Software could not be saved. Check the fields or try again.')
          );
        } else {
          toast.showError('Software could not be saved. Your edits are still here. Try again.');
        }
      }
    },
    () => setSaveError('Check the highlighted fields before saving.')
  );
  return { methods, options, submit, saveError, saving: mutation.isPending };
}
