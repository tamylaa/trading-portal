import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeatureFlagProvider, useFeatureFlag, useFeatureFlags, FEATURE_FLAGS } from '../FeatureFlagContext';

const TestComponent = () => {
  const { isEnabled } = useFeatureFlag(FEATURE_FLAGS.SMART_EMAIL_COMPOSER);
  const { updateFlag } = useFeatureFlags();
  return (
    <div>
      <div data-testid="state">{isEnabled ? 'enabled' : 'disabled'}</div>
      <button onClick={() => updateFlag(FEATURE_FLAGS.SMART_EMAIL_COMPOSER, true)}>enable</button>
    </div>
  );
};

describe('FeatureFlagContext', () => {
  beforeEach(() => {
    localStorage.removeItem('featureFlags');
  });

  it('has defaults and can update a flag', () => {
    render(
      <FeatureFlagProvider>
        <TestComponent />
      </FeatureFlagProvider>
    );

    expect(screen.getByTestId('state').textContent).toMatch(/disabled|enabled/);

    fireEvent.click(screen.getByText('enable'));
    expect(screen.getByTestId('state').textContent).toBe('enabled');

    const stored = JSON.parse(localStorage.getItem('featureFlags') || '{}');
    expect(stored[FEATURE_FLAGS.SMART_EMAIL_COMPOSER]).toBe(true);
  });
});
