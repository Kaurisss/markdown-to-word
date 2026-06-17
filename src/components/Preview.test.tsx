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

  it('adds slug ids to markdown headings', () => {
    render(<Preview markdown={'# Hello World\n\n## 中文 标题'} cfg={DEFAULT_CONFIG} />);

    expect(document.querySelector('h1')?.getAttribute('id')).toBe('user-content-hello-world');
    expect(document.querySelector('h2')?.getAttribute('id')).toBe('user-content-中文-标题');
  });

  it('deduplicates repeated heading ids', () => {
    render(<Preview markdown={'# Same\n\n# Same'} cfg={DEFAULT_CONFIG} />);

    const headings = Array.from(document.querySelectorAll('h1')).map((node) =>
      node.getAttribute('id')
    );

    expect(headings).toEqual(['user-content-same', 'user-content-same-1']);
  });

  it('does not preserve raw heading ids from html input', () => {
    render(<Preview markdown={'<h1 id="dangerous">Safe Title</h1>'} cfg={DEFAULT_CONFIG} />);

    expect(document.querySelector('h1')?.getAttribute('id')).toBe('user-content-safe-title');
  });
});
