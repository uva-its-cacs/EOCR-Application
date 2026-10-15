import type { Path, FieldValues, UseFormReturn } from 'react-hook-form';
import type { ReviewRequestDetail } from './types';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ApiError } from 'src/lib/api';

import { toast } from 'src/components/snackbar';

import { requestQueryKey } from 'src/sections/requests/use-request';
import { MY_REQUESTS_QUERY_KEY } from 'src/sections/requests/use-my-requests';
import { SOFTWARE_QUERY_KEY, SOFTWARE_CATALOG_QUERY_KEY } from 'src/sections/software/use-software';

import { assignRequest } from './api';
import { reviewRequestQueryKey, REVIEW_QUEUE_QUERY_KEY } from './use-review';

// ----------------------------------------------------------------------

/**
 * One review page write (assign, save the review, a status move or the decision). On success the page's
 * data is replaced with the server's answer and the lists that show the request are refreshed. Errors are
 * persistent toasts; server field errors are put on the form's fields when a form is given.
 */
export function useReviewWrite<TInput>(
  requestId: number,
  write: (input: TInput) => Promise<ReviewRequestDetail>,
  successMessage: string
) {
  const client = useQueryClient();

  const mutation = useMutation({
    mutationFn: write,
    onSuccess: (detail) => {
      client.setQueryData(reviewRequestQueryKey(requestId), detail);
      void client.invalidateQueries({ queryKey: REVIEW_QUEUE_QUERY_KEY, exact: true });
      void client.invalidateQueries({ queryKey: MY_REQUESTS_QUERY_KEY });
      void client.invalidateQueries({ queryKey: requestQueryKey(requestId) });
      void client.invalidateQueries({ queryKey: SOFTWARE_QUERY_KEY });
      void client.invalidateQueries({ queryKey: SOFTWARE_CATALOG_QUERY_KEY });
      toast.success(successMessage);
    },
  });

  // Runs the write; returns true on success. Failures are reported here.
  const run = async <TValues extends FieldValues>(
    input: TInput,
    form?: UseFormReturn<TValues>
  ): Promise<boolean> => {
    try {
      await mutation.mutateAsync(input);
      return true;
    } catch (error) {
      reportWriteError(error, form);
      if (error instanceof ApiError && error.status === 409) {
        // The request moved on: show its current state.
        void client.invalidateQueries({ queryKey: reviewRequestQueryKey(requestId) });
      }
      return false;
    }
  };

  return { run, pending: mutation.isPending };
}

function reportWriteError<TValues extends FieldValues>(
  error: unknown,
  form?: UseFormReturn<TValues>
) {
  if (!(error instanceof ApiError)) {
    toast.error('The change could not be saved. Try again.', { duration: Infinity });
    return;
  }
  if (form) {
    const fields = Object.keys(form.getValues()) as Path<TValues>[];
    let first = true;
    for (const [serverField, messages] of Object.entries(error.problem?.errors ?? {})) {
      const field = fields.find((name) => name.toLowerCase() === serverField.toLowerCase());
      if (field && messages.length) {
        form.setError(
          field,
          { type: 'server', message: messages.join(' ') },
          { shouldFocus: first }
        );
        first = false;
      }
    }
  }
  toast.error(
    error.status === 409
      ? `${error.problem?.title ?? 'This request was changed by someone else.'} The page now shows its current state.`
      : error.status === 403 || error.status === 401
        ? 'You no longer have administrator access. The change was not saved.'
        : (error.problem?.title ?? 'The change could not be saved. Check the fields or try again.'),
    { duration: Infinity }
  );
}

// "Assign to me" from the queue. Returns true on success.
export function useAssignFromQueue() {
  const client = useQueryClient();
  const mutation = useMutation({
    mutationFn: (row: { requestId: number; updatedAt: string }) =>
      assignRequest(row.requestId, null, row.updatedAt),
    onSuccess: (detail) => {
      client.setQueryData(reviewRequestQueryKey(detail.request.requestId), detail);
      void client.invalidateQueries({ queryKey: REVIEW_QUEUE_QUERY_KEY, exact: true });
    },
  });

  const assign = async (row: { requestId: number; updatedAt: string; softwareName: string }) => {
    try {
      await mutation.mutateAsync(row);
      toast.success(`${row.softwareName} is assigned to you.`);
      return true;
    } catch (error) {
      reportWriteError(error);
      void client.invalidateQueries({ queryKey: REVIEW_QUEUE_QUERY_KEY, exact: true });
      return false;
    }
  };

  return { assign, pending: mutation.isPending };
}
