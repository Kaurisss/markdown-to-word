// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Select } from '@/components/ui/Select';

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

function getCommandItem(label: string) {
  const item = screen.getAllByText(label)
    .map(element => element.closest('[cmdk-item]'))
    .find((element): element is Element => element !== null);

  if (!item) throw new Error(`Command item not found: ${label}`);
  return item;
}

describe('Select', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverMock);
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('highlights the selected option when opened', () => {
    render(
      <Select
        value="second"
        onChange={vi.fn()}
        options={[
          { label: 'First option', value: 'first' },
          { label: 'Second option', value: 'second' },
          { label: 'Third option', value: 'third' },
        ]}
      />
    );

    fireEvent.click(screen.getByRole('combobox'));

    expect(getCommandItem('First option').getAttribute('data-selected')).toBe('false');
    expect(getCommandItem('Second option').getAttribute('data-selected')).toBe('true');
  });
});
