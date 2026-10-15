import type { RequestDetail } from './types';
import type { EeaapValues } from './request-eeaap-schema';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { paths } from 'src/routes/paths';

import { ApiError } from 'src/lib/api';

import { toast } from 'src/components/snackbar';

import { requestQueryKey } from './use-request';
import { saveException, submitException } from './api';
import { MY_REQUESTS_QUERY_KEY } from './use-my-requests';
import {
  eeaapInputFrom,
  eeaapSaveSchema,
  eeaapValuesFrom,
  eeaapSubmitSchema,
} from './request-eeaap-schema';

// ----------------------------------------------------------------------

/**
 * The requester's EEAAP form (as useRequestIntake): "Save" keeps the answers; "Submit EEAAP" checks that
 * all three are answered (focus moves to the first missing one), saves, submits and opens the request.
 * Server field errors go back onto the fields; errors are persistent toasts.
 */
export function useRequestException(initial: RequestDetail) {
  const navigate = useNavigate();
  const client = useQueryClient();
  const [formError, setFormError] = useState('');
  const [request, setRequest] = useState<RequestDetail>(initial);
  const requestId = initial.requestId;

  const methods = useForm<EeaapValues>({
    resolver: zodResolver(eeaapSaveSchema),
    defaultValues: eeaapValuesFrom(initial.exception),
  });

  const refresh = (saved: RequestDetail) => {
    setRequest(saved);
    client.setQueryData(requestQueryKey(saved.requestId), saved);
    void client.invalidateQueries({ queryKey: MY_REQUESTS_QUERY_KEY });
  };

  const save = useMutation({
    mutationFn: (values: EeaapValues) =>
      saveException(requestId, eeaapInputFrom(values, request.exception?.updatedAt ?? '')),
    onSuccess: refresh,
  });

  const submit = useMutation({
    mutationFn: (saved: RequestDetail) =>
      submitException(requestId, saved.exception?.updatedAt ?? ''),
    onSuccess: refresh,
  });

  const busy = save.isPending || submit.isPending;

  const showServerErrors = (error: unknown) => {
    if (!(error instanceof ApiError)) {
      toast.error('The EEAAP could not be saved. Your answers are still here. Try again.', {
        duration: Infinity,
      });
      return;
    }
    const fields = Object.keys(methods.getValues()) as (keyof EeaapValues)[];
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
        ? `${error.problem?.title ?? 'This EEAAP was changed somewhere else.'} ${error.problem?.detail ?? ''}`.trim()
        : (error.problem?.title ?? 'The EEAAP could not be saved. Check the fields or try again.'),
      { duration: Infinity }
    );
  };

  const saveAnswers = methods.handleSubmit(
    async (values) => {
      if (busy) return;
      setFormError('');
      try {
        await save.mutateAsync(values);
        toast.success('EEAAP saved.');
      } catch (error) {
        showServerErrors(error);
      }
    },
    () => setFormError('Check the highlighted fields.')
  );

  const submitPlan = methods.handleSubmit(
    async (values) => {
      if (busy) return;
      setFormError('');

      // The submit rules are stricter than the save rules the form validates with.
      const checked = eeaapSubmitSchema.safeParse(values);
      if (!checked.success) {
        let first = true;
        for (const issue of checked.error.issues) {
          methods.setError(
            issue.path[0] as keyof EeaapValues,
            { type: 'submit', message: issue.message },
            { shouldFocus: first }
          );
          first = false;
        }
        setFormError('Answer the highlighted questions before submitting.');
        return;
      }

      try {
        const saved = await save.mutateAsync(values);
        await submit.mutateAsync(saved);
        toast.success('EEAAP submitted to the reviewer.');
        navigate(paths.requests.details(requestId));
      } catch (error) {
        showServerErrors(error);
      }
    },
    () => setFormError('Check the highlighted fields.')
  );

  return { methods, saveAnswers, submitPlan, formError, busy };
}
