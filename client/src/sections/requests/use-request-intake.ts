import type { RequestDetail } from './types';
import type { RequestIntakeValues } from './request-intake-schema';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { paths } from 'src/routes/paths';

import { ApiError } from 'src/lib/api';

import { toast } from 'src/components/snackbar';

import { requestQueryKey } from './use-request';
import { MY_REQUESTS_QUERY_KEY } from './use-my-requests';
import { createRequest, submitRequest, updateRequest } from './api';
import {
  saveInputFrom,
  intakeValuesFrom,
  emptyIntakeValues,
  requestDraftSchema,
  requestSubmitSchema,
} from './request-intake-schema';

// ----------------------------------------------------------------------

/**
 * The request intake form: one react-hook-form instance validated with the draft rules (only the
 * software name). "Save as draft" creates or updates the draft; "Submit request" first checks the submit
 * rules (focus moves to the first missing field), saves, then submits. Server field errors are mapped
 * back onto the form, and errors are raised as persistent toasts.
 */
export function useRequestIntake(draft: RequestDetail | null) {
  const navigate = useNavigate();
  const client = useQueryClient();
  const [formError, setFormError] = useState('');
  const [request, setRequest] = useState<RequestDetail | null>(draft);

  const methods = useForm<RequestIntakeValues>({
    resolver: zodResolver(requestDraftSchema),
    defaultValues: draft ? intakeValuesFrom(draft) : emptyIntakeValues,
  });

  const refresh = (saved: RequestDetail) => {
    setRequest(saved);
    client.setQueryData(requestQueryKey(saved.requestId), saved);
    void client.invalidateQueries({ queryKey: MY_REQUESTS_QUERY_KEY });
  };

  const save = useMutation({
    mutationFn: (values: RequestIntakeValues) =>
      request
        ? updateRequest(request.requestId, saveInputFrom(values, request.updatedAt))
        : createRequest(saveInputFrom(values)),
    onSuccess: refresh,
  });

  const submit = useMutation({
    mutationFn: (saved: RequestDetail) => submitRequest(saved.requestId, saved.updatedAt),
    onSuccess: refresh,
  });

  const busy = save.isPending || submit.isPending;

  const showServerErrors = (error: unknown) => {
    if (!(error instanceof ApiError)) {
      toast.error('The request could not be saved. Your answers are still here. Try again.', {
        duration: Infinity,
      });
      return;
    }
    const fields = Object.keys(methods.getValues()) as (keyof RequestIntakeValues)[];
    let first = true;
    for (const [serverField, messages] of Object.entries(error.problem?.errors ?? {})) {
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
    if (!first) setFormError('Check the highlighted fields.');
    toast.error(
      error.status === 409
        ? (error.problem?.detail ??
            'This request was changed somewhere else. Reload it and try again.')
        : error.status === 401
          ? 'Your session could not be verified. Sign in again; your answers have not been saved.'
          : (error.problem?.title ??
            'The request could not be saved. Check the fields or try again.'),
      { duration: Infinity }
    );
  };

  const saveDraft = methods.handleSubmit(
    async (values) => {
      if (busy) return;
      setFormError('');
      try {
        const saved = await save.mutateAsync(values);
        toast.success('Draft saved.');
        if (!draft) navigate(paths.requests.edit(saved.requestId), { replace: true });
      } catch (error) {
        showServerErrors(error);
      }
    },
    () => setFormError('Check the highlighted fields.')
  );

  const submitForReview = methods.handleSubmit(
    async (values) => {
      if (busy) return;
      setFormError('');

      // The submit rules are stricter than the draft rules the form validates with.
      const checked = requestSubmitSchema.safeParse(values);
      if (!checked.success) {
        let first = true;
        for (const issue of checked.error.issues) {
          const field = issue.path[0] as keyof RequestIntakeValues;
          methods.setError(
            field,
            { type: 'submit', message: issue.message },
            { shouldFocus: first }
          );
          first = false;
        }
        setFormError('Complete the highlighted fields before submitting.');
        return;
      }

      try {
        const saved = await save.mutateAsync(values);
        const submitted = await submit.mutateAsync(saved);
        toast.success('Request submitted for review.');
        navigate(paths.requests.details(submitted.requestId));
      } catch (error) {
        showServerErrors(error);
      }
    },
    () => setFormError('Check the highlighted fields.')
  );

  return { methods, saveDraft, submitForReview, formError, busy, request };
}
