# 🎨 MACEAZY Theme - Quick Reference Card

## 🎯 Brand Colors

```
Primary Blue:   #1B9BD8  →  oklch(0.65 0.14 230)
Navy Blue:      #0C5277  →  oklch(0.35 0.08 230)
Success Green:  #10B981  →  oklch(0.70 0.15 160)
Warning Amber:  #F59E0B  →  oklch(0.75 0.15 70)
Error Red:      #EF4444  →  oklch(0.65 0.22 25)
```

## 🚀 Most Common Classes

### Buttons
```tsx
// Primary (MACEAZY Blue)
className="bg-primary text-primary-foreground hover:bg-primary/90"

// Secondary
className="bg-secondary text-secondary-foreground hover:bg-secondary/90"

// Outline
className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"

// Destructive
className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
```

### Cards
```tsx
// Standard Card
className="bg-card text-card-foreground border-border border rounded-lg p-6"

// Interactive Card
className="bg-card border-border border rounded-lg p-6 hover:shadow-md hover:border-primary cursor-pointer"
```

### Sections
```tsx
// White Section
className="bg-background py-16"

// Light Blue Section
className="bg-accent py-16"
```

### Text Colors
```tsx
// Primary Text
className="text-foreground"

// Muted Text
className="text-muted-foreground"

// Primary Color Text (links, emphasis)
className="text-primary"

// Success
className="text-[oklch(0.70_0.15_160)]"

// Error
className="text-destructive"
```

### Links
```tsx
// Standard Link
className="text-primary hover:text-primary/80 underline"

// Nav Link Active
className="text-primary font-medium"

// Nav Link Inactive
className="text-muted-foreground hover:text-primary"
```

### Form Inputs
```tsx
// Input Field
className="border-input focus:ring-ring focus:border-ring bg-background text-foreground"

// Success State
className="border-[oklch(0.70_0.15_160)] border-2"

// Error State
className="border-destructive border-2"
```

### Badges
```tsx
// Primary Badge
className="bg-primary text-primary-foreground px-3 py-1 rounded-full"

// Success Badge
className="bg-[oklch(0.70_0.15_160)] text-white px-3 py-1 rounded-full"
```

## 📦 Adding shadcn Components

```powershell
# Single component
bunx shadcn@latest add button

# Multiple components
bunx shadcn@latest add button card input dialog
```

## 🌓 Dark Mode Support

All colors automatically adjust for dark mode!
The theme is fully configured with dark mode variants.

## ⚡ Quick Replace Guide

Replace these old colors with new theme colors:

```tsx
// OLD → NEW
"text-indigo-600"        →  "text-primary"
"bg-indigo-600"          →  "bg-primary"
"hover:text-indigo-600"  →  "hover:text-primary"
"bg-indigo-50"           →  "bg-accent"
"text-gray-600"          →  "text-muted-foreground"
"text-gray-900"          →  "text-foreground"
"bg-white"               →  "bg-background" or "bg-card"
"bg-red-500"             →  "bg-destructive"
"text-red-500"           →  "text-destructive"
"bg-green-500"           →  "bg-[oklch(0.70_0.15_160)]"
```

## 📁 Key Files

- **Colors**: `src/app/globals.css`
- **Config**: `components.json`
- **Utilities**: `src/lib/theme.ts`
- **Documentation**: `THEMING-GUIDE.md`
- **Summary**: `THEME-IMPLEMENTATION-SUMMARY.md`

---

**Pro Tip**: Use VSCode IntelliSense! Type `bg-` or `text-` and you'll see all available theme colors.
