// @vitest-environment jsdom
import { it, vi, expect, describe, afterEach } from 'vitest';
import { screen, cleanup, fireEvent } from '@testing-library/react';

import { renderWithTheme } from 'src/test/render-with-theme';

import { PageLoading } from 'src/components/page-loading';

import { ErrorState } from './error-state';
import { EmptyState } from './empty-state';
import { LoadingState } from './loading-state';

// ----------------------------------------------------------------------

afterEach(cleanup);

describe('LoadingState', () => {
  it('is a status region with visible text and a hidden spinner', () => {
    renderWithTheme(<LoadingState message="Loading requests" />);

    const status = screen.getByRole('status');

    expect(status.textContent).toBe('Loading requests');
    expect(status.querySelector('[role="progressbar"]')?.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('ErrorState', () => {
  it('is an alert, and Retry calls onRetry', () => {
    const onRetry = vi.fn();
    renderWithTheme(<ErrorState onRetry={onRetry}>Could not load</ErrorState>);

    expect(screen.getByRole('alert').textContent).toContain('Could not load');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('has no Retry button without onRetry', () => {
    renderWithTheme(<ErrorState>Could not load</ErrorState>);

    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('EmptyState', () => {
  it('shows its title, description and action', () => {
    renderWithTheme(
      <EmptyState
        title="No requests yet"
        description="Requests you start appear here."
        action={<button type="button">New request</button>}
      />
    );

    expect(screen.getByText('No requests yet').tagName).toBe('P');
    expect(screen.queryByRole('heading')).toBeNull();
    expect(screen.getByText('Requests you start appear here.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'New request' })).toBeTruthy();
  });
});

describe('PageLoading', () => {
  it('names the progress bar and announces loading', () => {
    renderWithTheme(<PageLoading />);

    expect(screen.getByRole('progressbar', { name: 'Loading' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toBe('Loading page');
  });
});
