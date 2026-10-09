// @vitest-environment jsdom
import { cleanup } from '@testing-library/react';
import { it, expect, describe, afterEach } from 'vitest';

import { renderWithTheme } from 'src/test/render-with-theme';

import {
  getStatusColor,
  REQUEST_STATUS_COLORS,
  APPROVAL_STATUS_COLORS,
} from 'src/sections/requests/status-colors';

import { StatusChip } from './status-chip';

// ----------------------------------------------------------------------

afterEach(cleanup);

describe('StatusChip', () => {
  it('shows the label as its text and has no aria-label', () => {
    const { container } = renderWithTheme(
      <StatusChip code="MoreInfoNeeded" label="More info needed" colors={REQUEST_STATUS_COLORS} />
    );
    const chip = container.querySelector('.minimal__label__root');

    expect(chip?.textContent).toBe('More info needed');
    expect(chip?.hasAttribute('aria-label')).toBe(false);
  });

  it('shows an unknown code with its label', () => {
    const { container } = renderWithTheme(
      <StatusChip code="SomethingNew" label="Something new" colors={REQUEST_STATUS_COLORS} />
    );

    expect(container.textContent).toBe('Something new');
  });

  it('falls back to the code when the label is empty', () => {
    const { container } = renderWithTheme(
      <StatusChip code="SomethingNew" label="" colors={REQUEST_STATUS_COLORS} />
    );

    expect(container.textContent).toBe('SomethingNew');
  });
});

describe('getStatusColor', () => {
  it('maps the agreed colors', () => {
    expect(getStatusColor(REQUEST_STATUS_COLORS, 'Draft')).toBe('default');
    expect(getStatusColor(REQUEST_STATUS_COLORS, 'AiReview')).toBe('info');
    expect(getStatusColor(REQUEST_STATUS_COLORS, 'ApprovedWithConditions')).toBe('warning');
    expect(getStatusColor(REQUEST_STATUS_COLORS, 'Denied')).toBe('error');
    expect(getStatusColor(APPROVAL_STATUS_COLORS, 'ApprovedWithConditions')).toBe('warning');
    expect(getStatusColor(APPROVAL_STATUS_COLORS, 'Expired')).toBe('warning');
  });

  it('falls back to default for unknown codes and object keys', () => {
    expect(getStatusColor(REQUEST_STATUS_COLORS, 'SomethingNew')).toBe('default');
    expect(getStatusColor(REQUEST_STATUS_COLORS, 'toString')).toBe('default');
  });
});
