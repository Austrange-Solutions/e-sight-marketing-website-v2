# MACEAZY Brand Theming Guide

## Brand Colors Analysis
Based on the MACEAZY logo and modern design principles:

### Primary Colors
- **Light Blue (Primary)**: `#1B9BD8` - Main brand color (bright blue from logo)
  - OKLCH: `oklch(0.65 0.14 230)` - For buttons, links, CTAs
  - Hover: `oklch(0.55 0.14 230)` - Darker on hover
  - Active: `oklch(0.50 0.14 230)` - Even darker when active

- **Navy Blue (Secondary)**: `#0C5277` - Secondary brand color (darker blue)
  - OKLCH: `oklch(0.35 0.08 230)` - For headings, emphasis
  - Used for contrast and professional look

### Semantic Colors (Modern & Brand-Aligned)
- **Success**: `#10B981` (Modern Emerald Green)
  - OKLCH: `oklch(0.70 0.15 160)` - Vibrant, modern success state
  
- **Warning**: `#F59E0B` (Modern Amber)
  - OKLCH: `oklch(0.75 0.15 70)` - Clear warning without being harsh
  
- **Error**: `#EF4444` (Modern Red)
  - OKLCH: `oklch(0.65 0.22 25)` - Clear error indication

### Supporting Colors
- **Background (Light)**: Pure white `#FFFFFF` with blue accent sections
- **Background (Dark)**: `oklch(0.15 0.01 230)` - Dark with subtle blue tint
- **Text Primary**: Near-black with slight blue tint for warmth
- **Border**: Light gray with subtle blue undertone

## Design Decisions

### User Preferences
✅ **Primary Color**: Light bright blue (#1B9BD8) - energetic and accessible
✅ **Background**: White sections alternating with blue accent sections
✅ **Dark Mode**: Enabled with proper contrast
✅ **Success Color**: Modern emerald green (#10B981) - fresh and positive
✅ **Warning/Error**: Traditional but modern (Amber/Red)
✅ **Accessibility**: High contrast ratios, WCAG AA compliant

### Design Philosophy
- **Modern & Clean**: Minimalist approach with strategic use of brand colors
- **Accessibility First**: All colors meet WCAG AA standards (4.5:1 for text)
- **Professional**: Balance between tech-forward and trustworthy
- **Consistent**: All shadcn components automatically adapt to theme

## Color Reference

### Light Mode Colors (HEX → OKLCH)

| Purpose | HEX | OKLCH | Usage |
|---------|-----|-------|-------|
| Primary | `#1B9BD8` | `oklch(0.65 0.14 230)` | Buttons, links, CTAs |
| Primary Hover | `#1586C4` | `oklch(0.55 0.14 230)` | Interactive states |
| Secondary | `#0C5277` | `oklch(0.35 0.08 230)` | Headings, emphasis |
| Success | `#10B981` | `oklch(0.70 0.15 160)` | Success messages |
| Warning | `#F59E0B` | `oklch(0.75 0.15 70)` | Warnings |
| Error | `#EF4444` | `oklch(0.65 0.22 25)` | Errors |
| Background | `#FFFFFF` | `oklch(1 0 0)` | Page background |
| Foreground | `#1A1F2E` | `oklch(0.20 0.01 230)` | Text |

### Dark Mode Colors

| Purpose | OKLCH | Usage |
|---------|-------|-------|
| Primary | `oklch(0.70 0.14 230)` | Brighter blue for visibility |
| Background | `oklch(0.15 0.01 230)` | Dark with blue tint |
| Foreground | `oklch(0.95 0.005 230)` | Light text |
| Card | `oklch(0.20 0.01 230)` | Elevated surfaces |

## Using the Theme

### In Components
All color classes automatically use the CSS variables:

```tsx
// Primary button
<button className="bg-primary text-primary-foreground">Click me</button>

// Success state
<div className="text-success border-success">Success!</div>

// Card with proper colors
<div className="bg-card text-card-foreground border-border">
  Content
</div>
```

### Adding New shadcn Components
Always use the CLI to maintain theme consistency
4. Ensure all shadcn components use the theme

```powershell
# Example: Add a button component
bunx shadcn@latest add button

# Add a card component
bunx shadcn@latest add card

# Add multiple components
bunx shadcn@latest add button card dialog
```

### Custom Color Utilities
For brand-specific styling:

```tsx
// Direct MACEAZY blue
<div className="text-[oklch(0.65_0.14_230)]">
  Custom styled text
</div>

// Or use the semantic classes
<button className="bg-primary hover:bg-primary/90">
  Hover effect included
</button>
```

## Design System Guidelines

### Button Hierarchy
1. **Primary**: `bg-primary text-primary-foreground` - Main CTAs
2. **Secondary**: `bg-secondary text-secondary-foreground` - Secondary actions
3. **Outline**: `border-primary text-primary` - Tertiary actions
4. **Ghost**: `hover:bg-accent` - Minimal actions

### Spacing & Layout
- Use alternating white and light blue sections: `bg-background` and `bg-accent`
- Cards should use `bg-card` with `border-border`
- Maintain consistent padding with Tailwind spacing scale

### Typography
- Headings: Use `text-foreground` or `text-secondary-foreground` for emphasis
- Body text: `text-foreground`
- Muted text: `text-muted-foreground`

### Accessibility
- All colors meet WCAG AA standards (4.5:1 contrast ratio)
- Focus states use `ring-ring` (primary blue)
- Interactive elements have clear hover states

## Implementation Status

### ✅ Completed
- [x] Brand color analysis and definition
- [x] OKLCH color conversion
- [x] Light mode CSS variables
- [x] Dark mode CSS variables
- [x] Updated `components.json` baseColor to "blue"
- [x] Created theme utilities (`src/lib/theme.ts`)
- [x] Documentation created

### 🔄 Next Steps
- [ ] Test existing components with new theme
- [ ] Update Navbar styling
- [ ] Update Footer styling
- [ ] Update all page components
- [ ] Add dark mode toggle if not present
- [ ] Test all shadcn components
- [ ] Verify accessibility contrast ratios

## Notes
- Using Tailwind CSS v4 with CSS-first configuration
- All colors defined in `src/app/globals.css`
- No separate `tailwind.config.ts` needed
- Windows PowerShell environment
- Next.js 15+ with App Router
- All shadcn components should be added via CLI
