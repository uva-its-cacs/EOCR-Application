// @vitest-environment jsdom
import { it, expect, describe, afterEach } from 'vitest';
import { screen, within, cleanup } from '@testing-library/react';

import { renderWithTheme } from 'src/test/render-with-theme';

import { StatCard } from './stat-card';
import { StatCardGroup } from './stat-card-group';

// ----------------------------------------------------------------------

afterEach(cleanup);

describe('StatCardGroup and StatCard', () => {
  it('is a region named by its hidden h2, holding term and definition pairs', () => {
    renderWithTheme(
      <StatCardGroup title="Summary">
        <StatCard title="Drafts" value={2} />
        <StatCard title="Decided" value={0} />
      </StatCardGroup>
    );

    const region = screen.getByRole('region', { name: 'Summary' });

    expect(within(region).getByRole('heading', { level: 2, name: 'Summary' })).toBeTruthy();
    expect(region.querySelector('dl')).toBeTruthy();
    expect(
      within(region)
        .getAllByRole('term')
        .map((t) => t.textContent)
    ).toEqual(['Drafts', 'Decided']);
    expect(
      within(region)
        .getAllByRole('definition')
        .map((d) => d.textContent)
    ).toEqual(['2', '0']);
    expect(region.getAttribute('aria-busy')).toBe('false');
  });

  it('shows an em dash and "Loading" (not 0) while the value is null, with aria-busy', () => {
    renderWithTheme(
      <StatCardGroup title="Summary" busy>
        <StatCard title="Drafts" value={null} />
      </StatCardGroup>
    );

    const region = screen.getByRole('region', { name: 'Summary' });
    const definition = within(region).getByRole('definition');

    expect(region.getAttribute('aria-busy')).toBe('true');
    expect(definition.textContent).toBe('—Loading');
    expect(within(definition).getByText('—').getAttribute('aria-hidden')).toBe('true');
    expect(within(definition).queryByText('0')).toBeNull();
  });
});
