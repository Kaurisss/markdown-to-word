// @vitest-environment jsdom

import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CustomColorPicker } from '@/components/ui/color-picker';

describe('CustomColorPicker', () => {
  let onChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onChange = vi.fn();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('renders the react-colorful picker with saturation and hue sliders', () => {
      render(<CustomColorPicker color="#FF0000" onChange={onChange} />);
      // react-colorful renders role="slider" for saturation and hue
      const sliders = screen.getAllByRole('slider');
      expect(sliders.length).toBeGreaterThanOrEqual(2);
    });

    it('keeps the picker height explicit so the saturation plane is visible', () => {
      const { container } = render(<CustomColorPicker color="#FF0000" onChange={onChange} />);
      const picker = container.querySelector('.react-colorful');

      expect(picker?.getAttribute('style')).toContain('width: 100%');
      expect(picker?.getAttribute('style')).toContain('height: 200px');
    });

    it('renders the color preview circle with the current color', () => {
      const { container } = render(<CustomColorPicker color="#FF0000" onChange={onChange} />);
      // The preview is a div with inline background-color style
      const preview = container.querySelector('[style*="background-color"]');
      expect(preview).toBeTruthy();
    });

    it('does not render eyedropper button when EyeDropper API is unavailable', () => {
      const { container } = render(<CustomColorPicker color="#FF0000" onChange={onChange} />);
      expect(container.querySelector('button[title="吸取颜色"]')).toBeNull();
    });

    it('renders eyedropper button when EyeDropper API is available', () => {
      class MockEyeDropper {
        open() { return Promise.resolve({ sRGBHex: '#00FF00' }); }
      }
      vi.stubGlobal('EyeDropper', MockEyeDropper);

      const { container } = render(<CustomColorPicker color="#FF0000" onChange={onChange} />);
      expect(container.querySelector('button[title="吸取颜色"]')).toBeTruthy();
    });
  });

  describe('value normalization', () => {
    it('clamps RGB input above 255 to 255', () => {
      const { container } = render(
        <CustomColorPicker color="#000000" onChange={onChange} />
      );
      const inputs = container.querySelectorAll('input[type="number"]');
      fireEvent.change(inputs[0], { target: { value: '300' } });
      expect(onChange).toHaveBeenCalledWith('#FF0000');
    });

    it('clamps negative RGB input to 0', () => {
      const { container } = render(
        <CustomColorPicker color="#FF0000" onChange={onChange} />
      );
      const inputs = container.querySelectorAll('input[type="number"]');
      fireEvent.change(inputs[0], { target: { value: '-50' } });
      expect(onChange).toHaveBeenCalledWith('#000000');
    });

    it('treats non-numeric RGB input as 0', () => {
      const { container } = render(
        <CustomColorPicker color="#FF0000" onChange={onChange} />
      );
      const inputs = container.querySelectorAll('input[type="number"]');
      fireEvent.change(inputs[0], { target: { value: 'abc' } });
      expect(onChange).toHaveBeenCalledWith('#000000');
    });

    it('updates multiple RGB channels correctly', () => {
      const { container } = render(
        <CustomColorPicker color="#000000" onChange={onChange} />
      );
      const inputs = container.querySelectorAll('input[type="number"]');
      // Set R=128, G=64, B=255
      fireEvent.change(inputs[0], { target: { value: '128' } });
      expect(onChange).toHaveBeenLastCalledWith('#800000');

      fireEvent.change(inputs[1], { target: { value: '64' } });
      expect(onChange).toHaveBeenLastCalledWith('#804000');

      fireEvent.change(inputs[2], { target: { value: '255' } });
      expect(onChange).toHaveBeenLastCalledWith('#8040FF');
    });

    it('normalizes HEX input to uppercase', () => {
      render(<CustomColorPicker color="#FF0000" onChange={onChange} />);
      fireEvent.click(screen.getByTitle('切换颜色格式')); // RGB → HEX
      const hexInput = screen.getByDisplayValue('#FF0000');
      fireEvent.change(hexInput, { target: { value: '#00ff00' } });
      expect(onChange).toHaveBeenCalledWith('#00FF00');
    });

    it('rejects invalid HEX input', () => {
      render(<CustomColorPicker color="#FF0000" onChange={onChange} />);
      fireEvent.click(screen.getByTitle('切换颜色格式'));
      const hexInput = screen.getByDisplayValue('#FF0000');
      fireEvent.change(hexInput, { target: { value: '#GGGGGG' } });
      expect(onChange).not.toHaveBeenCalled();
    });

    it('auto-prepends # to HEX input', () => {
      render(<CustomColorPicker color="#FF0000" onChange={onChange} />);
      fireEvent.click(screen.getByTitle('切换颜色格式'));
      const hexInput = screen.getByDisplayValue('#FF0000');
      fireEvent.change(hexInput, { target: { value: '00ff00' } });
      expect(onChange).toHaveBeenCalledWith('#00FF00');
    });
  });

  describe('format cycling', () => {
    it('cycles through RGB to HEX to HSL and back', () => {
      render(<CustomColorPicker color="#FF0000" onChange={onChange} />);
      const cycleBtn = screen.getByTitle('切换颜色格式');

      // Initially RGB
      expect(screen.getByText('R')).toBeTruthy();
      expect(screen.getByText('G')).toBeTruthy();
      expect(screen.getByText('B')).toBeTruthy();

      // RGB → HEX
      fireEvent.click(cycleBtn);
      expect(screen.getByText('HEX')).toBeTruthy();

      // HEX → HSL
      fireEvent.click(cycleBtn);
      expect(screen.getByText('H')).toBeTruthy();
      expect(screen.getByText('S')).toBeTruthy();
      expect(screen.getByText('L')).toBeTruthy();

      // HSL → RGB
      fireEvent.click(cycleBtn);
      expect(screen.getByText('R')).toBeTruthy();
      expect(screen.getByText('G')).toBeTruthy();
      expect(screen.getByText('B')).toBeTruthy();
    });
  });

  describe('HSL display correctness', () => {
    it('shows correct HSL for pure red (#FF0000)', () => {
      const { container } = render(
        <CustomColorPicker color="#FF0000" onChange={onChange} />
      );
      fireEvent.click(screen.getByTitle('切换颜色格式')); // RGB → HEX
      fireEvent.click(screen.getByTitle('切换颜色格式')); // HEX → HSL

      const inputs = container.querySelectorAll('input[type="number"]');
      expect(inputs[0].value).toBe('0');   // H
      expect(inputs[1].value).toBe('100'); // S
      expect(inputs[2].value).toBe('50');  // L (not 100 like old HSV V)
    });

    it('shows correct HSL for pure green (#00FF00)', () => {
      const { container } = render(
        <CustomColorPicker color="#00FF00" onChange={onChange} />
      );
      fireEvent.click(screen.getByTitle('切换颜色格式'));
      fireEvent.click(screen.getByTitle('切换颜色格式'));

      const inputs = container.querySelectorAll('input[type="number"]');
      expect(inputs[0].value).toBe('120'); // H
      expect(inputs[1].value).toBe('100'); // S
      expect(inputs[2].value).toBe('50');  // L
    });

    it('shows correct HSL for white (#FFFFFF)', () => {
      const { container } = render(
        <CustomColorPicker color="#FFFFFF" onChange={onChange} />
      );
      fireEvent.click(screen.getByTitle('切换颜色格式'));
      fireEvent.click(screen.getByTitle('切换颜色格式'));

      const inputs = container.querySelectorAll('input[type="number"]');
      expect(inputs[0].value).toBe('0');   // H
      expect(inputs[1].value).toBe('0');    // S
      expect(inputs[2].value).toBe('100'); // L
    });

    it('shows correct HSL for a mid-gray (#808080)', () => {
      const { container } = render(
        <CustomColorPicker color="#808080" onChange={onChange} />
      );
      fireEvent.click(screen.getByTitle('切换颜色格式'));
      fireEvent.click(screen.getByTitle('切换颜色格式'));

      const inputs = container.querySelectorAll('input[type="number"]');
      expect(inputs[0].value).toBe('0');   // H
      expect(inputs[1].value).toBe('0');    // S
      expect(inputs[2].value).toBe('50');  // L ≈ 50.2 → 50
    });
  });

  describe('keyboard and pointer accessibility', () => {
    it('renders saturation plane and hue slider from react-colorful', () => {
      // pointer test: verify the interactive elements exist
      const { container } = render(<CustomColorPicker color="#FF0000" onChange={onChange} />);
      expect(container.querySelector('.react-colorful__saturation')).toBeTruthy();
      expect(container.querySelector('.react-colorful__hue')).toBeTruthy();
    });

    it('saturation and hue controls have role=slider and are keyboard-focusable', () => {
      render(<CustomColorPicker color="#FF0000" onChange={onChange} />);
      const sliders = screen.getAllByRole('slider');
      expect(sliders.length).toBeGreaterThanOrEqual(2);

      for (const slider of sliders) {
        expect(slider.getAttribute('tabindex')).toBe('0');
        expect(slider.getAttribute('role')).toBe('slider');
      }
    });

    it('saturation slider has aria-label and aria-valuetext', () => {
      render(<CustomColorPicker color="#FF0000" onChange={onChange} />);
      const sliders = screen.getAllByRole('slider');
      const satSlider = sliders[0];

      expect(satSlider.getAttribute('aria-label')).toBeTruthy();
      expect(satSlider.getAttribute('aria-valuetext')).toBeTruthy();
    });

    it('hue slider has aria-label, aria-valuemin, aria-valuemax, and aria-valuenow', () => {
      render(<CustomColorPicker color="#FF0000" onChange={onChange} />);
      const sliders = screen.getAllByRole('slider');
      const hueSlider = sliders[sliders.length - 1];

      expect(hueSlider.getAttribute('aria-label')).toBe('Hue');
      expect(hueSlider.getAttribute('aria-valuemin')).toBe('0');
      expect(hueSlider.getAttribute('aria-valuemax')).toBe('360');
      expect(hueSlider.getAttribute('aria-valuenow')).toBe('0'); // hue=0 for red
    });

    it('always displays color in uppercase in HEX format', () => {
      // Verifies uppercase normalization: even lowercase color prop shows uppercase
      render(<CustomColorPicker color="#ff0000" onChange={onChange} />);
      fireEvent.click(screen.getByTitle('切换颜色格式')); // RGB -> HEX
      const hexInput = screen.getByDisplayValue('#FF0000');
      expect(hexInput).toBeTruthy();
    });

    it('can be focused without errors', () => {
      render(<CustomColorPicker color="#FF0000" onChange={onChange} />);
      const sliders = screen.getAllByRole('slider');
      for (const slider of sliders) {
        expect(() => slider.focus()).not.toThrow();
      }
    });
  });

  describe('eyedropper', () => {
    it('calls onChange with the picked color', async () => {
      const openMock = vi.fn().mockResolvedValue({ sRGBHex: '#00ff00' });
      class MockEyeDropper {
        open = openMock;
      }
      vi.stubGlobal('EyeDropper', MockEyeDropper);

      const { container } = render(
        <CustomColorPicker color="#FF0000" onChange={onChange} />
      );
      const btn = container.querySelector('button[title="吸取颜色"]')!;
      fireEvent.click(btn);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith('#00FF00');
      });
      expect(openMock).toHaveBeenCalled();
    });

    it('does not throw when user cancels the eyedropper', async () => {
      const openMock = vi.fn().mockRejectedValue(new Error('canceled'));
      class MockEyeDropper {
        open = openMock;
      }
      vi.stubGlobal('EyeDropper', MockEyeDropper);

      const { container } = render(
        <CustomColorPicker color="#FF0000" onChange={onChange} />
      );
      const btn = container.querySelector('button[title="吸取颜色"]')!;

      // Should not throw
      fireEvent.click(btn);

      await waitFor(() => {
        expect(openMock).toHaveBeenCalled();
      });
      // onChange should NOT be called since the user canceled
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('external color sync', () => {
    it('updates RGB display when color prop changes externally', () => {
      const { container, rerender } = render(
        <CustomColorPicker color="#FF0000" onChange={onChange} />
      );
      let inputs = container.querySelectorAll('input[type="number"]');
      expect(inputs[0].value).toBe('255'); // R

      // Simulate external color change (e.g., from a swatch)
      rerender(<CustomColorPicker color="#0000FF" onChange={onChange} />);

      inputs = container.querySelectorAll('input[type="number"]');
      expect(inputs[0].value).toBe('0');   // R
      expect(inputs[1].value).toBe('0');   // G
      expect(inputs[2].value).toBe('255'); // B
    });
  });
});
