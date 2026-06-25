### Task 1: Update Tailwind and CSS Variables

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Update the CSS variables in the root scope**

Modify the `:root` pseudo-class in `src/index.css` to set all custom UI radius variables to 8px. Do not touch `shadow`, `color` or `space` variables. 

```css
:root {
  /* ... existing vars ... */
  --ui-radius-control: 8px;
  --ui-radius-panel: 8px;
  --ui-radius-popover: 8px;
  --ui-radius-swatch: 8px;
  /* ... existing vars ... */
}
```

- [ ] **Step 2: Flatten the Tailwind radius scale in the `@theme` block**

In the `@theme` block in `src/index.css`, add the radius overrides. This ensures that any component using classes like `rounded`, `rounded-sm`, `rounded-md`, or `rounded-lg` gets exactly 8px, effectively unifying the design system's border radii without needing to modify every `.tsx` file.

```css
@theme {
  /* ... existing theme overrides ... */
  
  /* Flatten Tailwind radius scale to 8px */
  --radius: 8px;
  --radius-xs: 8px;
  --radius-sm: 8px;
  --radius-md: 8px;
  --radius-lg: 8px;
  --radius-xl: 8px;
  --radius-2xl: 8px;
  --radius-3xl: 8px;
}
```

- [ ] **Step 3: Verify the application builds successfully**

Since this is purely a CSS change and we are overriding variables safely, we simply verify the project typechecks and builds without error. 

Run: `pnpm run typecheck`
Expected: Passes successfully with no TypeScript errors (exit code 0).

- [ ] **Step 4: Commit changes**

```bash
git add src/index.css
git commit -m "style: unify border radius of all controls to 8px"
```
