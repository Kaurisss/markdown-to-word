// @vitest-environment jsdom

import React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Preview from './Preview';
import { DEFAULT_CONFIG } from '../config/defaultConfig';

describe('Preview', () => {
  it('renders underline html as an underline element', () => {
    render(<Preview markdown="This is <u>underlined</u> text" cfg={DEFAULT_CONFIG} />);

    const underlined = screen.getByText('underlined');

    expect(underlined.tagName.toLowerCase()).toBe('u');
  });

  it('does not render arbitrary raw html elements', () => {
    render(<Preview markdown={'Before <script>alert("x")</script> after'} cfg={DEFAULT_CONFIG} />);

    expect(document.querySelector('script')).toBeNull();
    expect(screen.getByText(/Before/)).toBeTruthy();
  });

  it('strips raw img and input tags', () => {
    render(<Preview markdown={'<img src="x" /> <input type="checkbox" />'} cfg={DEFAULT_CONFIG} />);

    expect(document.querySelector('img')).toBeNull();
    expect(document.querySelector('input')).toBeNull();
  });
});
