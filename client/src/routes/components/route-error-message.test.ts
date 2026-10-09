import { it, expect, describe } from 'vitest';

import { routeErrorMessage, GENERIC_ERROR_MESSAGE } from './route-error-message';

// ----------------------------------------------------------------------

describe('routeErrorMessage', () => {
  it('shows the status of a route error response in both modes', () => {
    // The shape react-router's isRouteErrorResponse recognizes (what a loader's 404 produces).
    const response = { status: 404, statusText: 'Not Found', internal: false, data: null };

    expect(routeErrorMessage(response, true)).toBe('404 Not Found');
    expect(routeErrorMessage(response, false)).toBe('404 Not Found');
  });

  it("shows an Error's message only in development", () => {
    const error = new Error('Cannot read properties of undefined');

    expect(routeErrorMessage(error, true)).toBe('Cannot read properties of undefined');
    expect(routeErrorMessage(error, false)).toBe(GENERIC_ERROR_MESSAGE);
  });

  it('never returns the stack', () => {
    const error = new Error('boom');

    expect(routeErrorMessage(error, true)).not.toContain('at ');
  });

  it('uses the generic message for anything else', () => {
    expect(routeErrorMessage('a string', true)).toBe(GENERIC_ERROR_MESSAGE);
    expect(routeErrorMessage(undefined, false)).toBe(GENERIC_ERROR_MESSAGE);
    expect(routeErrorMessage(new Error(''), true)).toBe(GENERIC_ERROR_MESSAGE);
  });
});
