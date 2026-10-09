// @vitest-environment jsdom
import { useState } from 'react';
import { it, vi, expect, describe, afterEach } from 'vitest';
import { screen, waitFor, cleanup, fireEvent } from '@testing-library/react';

import { renderWithTheme } from 'src/test/render-with-theme';

import { ConfirmDialog } from './confirm-dialog';

// ----------------------------------------------------------------------

type HarnessProps = {
  destructive?: boolean;
  content?: string;
  onConfirm?: () => void;
};

function Harness({ destructive, content, onConfirm = () => {} }: HarnessProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open
      </button>
      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Delete this draft?"
        content={content}
        confirmLabel="Delete"
        destructive={destructive}
        onConfirm={onConfirm}
      />
    </>
  );
}

function openFromTrigger() {
  const trigger = screen.getByRole('button', { name: 'Open' });
  trigger.focus();
  fireEvent.click(trigger);
  return trigger;
}

afterEach(cleanup);

describe('ConfirmDialog', () => {
  it('is named by its title and described by its content', () => {
    renderWithTheme(<Harness content="This cannot be undone." />);
    openFromTrigger();

    const dialog = screen.getByRole('dialog', { name: 'Delete this draft?' });

    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(document.getElementById(dialog.getAttribute('aria-describedby')!)?.textContent).toBe(
      'This cannot be undone.'
    );
  });

  it('has no aria-describedby without content', () => {
    renderWithTheme(<Harness />);
    openFromTrigger();

    expect(screen.getByRole('dialog').hasAttribute('aria-describedby')).toBe(false);
  });

  it('focuses Cancel first when destructive', () => {
    renderWithTheme(<Harness destructive />);
    openFromTrigger();

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cancel' }));
  });

  it('focuses the confirm button first when not destructive', () => {
    renderWithTheme(<Harness />);
    openFromTrigger();

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Delete' }));
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    renderWithTheme(<Harness destructive />);
    const trigger = openFromTrigger();

    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(document.activeElement).toBe(trigger);
  });

  it('calls onConfirm from the confirm button', () => {
    const onConfirm = vi.fn();
    renderWithTheme(<Harness onConfirm={onConfirm} />);
    openFromTrigger();

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
