---
name: Epicurean Harmony
colors:
  surface: '#141311'
  surface-dim: '#141311'
  surface-bright: '#3a3936'
  surface-container-lowest: '#0f0e0c'
  surface-container-low: '#1c1c19'
  surface-container: '#20201d'
  surface-container-high: '#2b2a27'
  surface-container-highest: '#363532'
  on-surface: '#e6e2dd'
  on-surface-variant: '#ddc1b3'
  inverse-surface: '#e6e2dd'
  inverse-on-surface: '#31302d'
  outline: '#a58c7f'
  outline-variant: '#564338'
  surface-tint: '#ffb68d'
  primary: '#ffb68d'
  on-primary: '#532200'
  primary-container: '#df7328'
  on-primary-container: '#481d00'
  inverse-primary: '#9a4600'
  secondary: '#e9c176'
  on-secondary: '#412d00'
  secondary-container: '#604403'
  on-secondary-container: '#dab36a'
  tertiary: '#c8c6c5'
  on-tertiary: '#313030'
  tertiary-container: '#929090'
  on-tertiary-container: '#2a2a2a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbc9'
  primary-fixed-dim: '#ffb68d'
  on-primary-fixed: '#321200'
  on-primary-fixed-variant: '#763400'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#e9c176'
  on-secondary-fixed: '#261900'
  on-secondary-fixed-variant: '#5d4201'
  tertiary-fixed: '#e5e2e1'
  tertiary-fixed-dim: '#c8c6c5'
  on-tertiary-fixed: '#1b1b1b'
  on-tertiary-fixed-variant: '#474746'
  background: '#141311'
  on-background: '#e6e2dd'
  surface-variant: '#363532'
typography:
  display-lg:
    fontFamily: ebGaramond
    fontSize: 48px
    fontWeight: '500'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: ebGaramond
    fontSize: 36px
    fontWeight: '500'
    lineHeight: '1.2'
  headline-md:
    fontFamily: ebGaramond
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: ebGaramond
    fontSize: 24px
    fontWeight: '400'
    lineHeight: '1.4'
  body-lg:
    fontFamily: manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-margin: 24px
  gutter: 16px
  touch-target: 48px
  section-gap: 64px
---

## Brand & Style

This design system is crafted for high-end culinary experiences, balancing the prestige of fine dining with the warmth of a welcoming hearth. The brand personality is **sophisticated, artisanal, and intentional**. It aims to evoke an emotional response of anticipation and comfort, suggesting a space where quality is paramount but pretense is secondary.

The visual style leans into **Minimalist-Luxury**. It prioritizes high-quality typography and generous whitespace to allow food photography and curated content to breathe. We utilize a "Warm Dark" mode as the default, moving away from harsh pure blacks to deep, organic charcoals that feel more like a physical menu in a dimly lit dining room.

## Colors

The palette is rooted in the "Terre d'Ombre" philosophy—shadow and earth. 

- **Primary (Terracotta):** A vibrant, earthy orange used for primary actions and highlights. It is scientifically proven to stimulate appetite and provides a warm glow against dark backgrounds.
- **Secondary (Pale Gold):** Used sparingly for accents, borders, or "Recommended" tags to denote quality and prestige.
- **Neutrals (Carbon & Cream):** The background is a deep **#1C1C1C** (Carbon), providing a softer contrast than pure black. Typography for body text uses **#F9F5F0** (Cream) to reduce eye strain and feel more organic than stark white.

## Typography

The typographic hierarchy relies on the tension between the classic, literary feel of **ebGaramond** and the precise, modern clarity of **Manrope**.

- **Serif (Headings):** Used for titles, menu item names, and section headers. Use "Display" sizes for impact, ensuring the elegant ligatures of the serif are visible.
- **Sans-Serif (Body & UI):** Used for descriptions, prices, and navigation. It provides a contemporary counterbalance to the serif, ensuring high legibility on mobile screens.
- **Uppercase Labels:** Small caps with tracking (letter-spacing) are used for metadata like "Vegetarian," "Spicy," or "Chef's Choice" to create a distinct visual layer without adding weight.

## Layout & Spacing

The layout follows a **Fluid Grid** with a strong emphasis on vertical rhythm. 

- **Mobile-First:** A 4-column grid with 24px side margins is the standard. Touch targets for all interactive elements (buttons, selectors) are strictly a minimum of 48x48px to accommodate one-handed browsing during transit or at a table.
- **Desktop:** Scales to a 12-column centered layout with a max-width of 1200px.
- **Whitespace:** Use generous `section-gap` units between different menu categories (e.g., Starters vs. Mains) to maintain a feeling of unhurried luxury.

## Elevation & Depth

We avoid heavy drop shadows in favor of **Tonal Layers** and **Soft Ambient Occlusion**.

- **Surfaces:** Use subtle variations in the charcoal base. A "Card" should be only slightly lighter than the background (#252525) to create a sense of presence.
- **Shadows:** When necessary (e.g., for floating booking buttons), use a highly diffused shadow: `0px 12px 32px rgba(0, 0, 0, 0.4)`.
- **Inner Borders:** For high-end elements, use a 1px solid border in the Secondary Gold color at 15% opacity to simulate a delicate metallic inlay.

## Shapes

The shape language is **Soft (0.25rem - 0.75rem)**. 

While sharp corners feel too aggressive and pill-shapes feel too "tech-oriented," a slight rounding of corners suggests the softness of linen and the organic nature of food. 
- **Buttons:** Use `rounded-lg` (0.5rem) for a comfortable, modern feel.
- **Product Cards:** Use `rounded-xl` (0.75rem) to frame food photography softly.
- **Images:** All food photography should have a subtle corner radius to match the UI elements.

## Components

- **Primary Buttons:** Solid Terracotta background with Cream text. Use `label-caps` for the text to give it an authoritative, menu-like feel.
- **Ghost Buttons:** Transparent background with a 1px Gold border. Used for secondary actions like "View Ingredients."
- **Cards (Menu Items):** A subtle background lift (#252525) with the image on the left (mobile) or top (desktop). Price should be in ebGaramond, placed clearly apart from the description.
- **Chips (Dietary):** Small, low-profile outlines in Pale Gold. They should be informative but not distracting from the item name.
- **Input Fields:** Underlined style (rather than boxed) for a more elegant, "written" appearance for reservation forms.
- **Reservation Bar:** A sticky bottom component on mobile containing the "Book a Table" CTA, using the Primary Terracotta color for maximum visibility.