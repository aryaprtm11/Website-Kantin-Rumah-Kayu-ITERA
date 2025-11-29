# 🎨 Design Guide - Kantin RK ITERA

## Visual Design Overview

### 🎭 Design Philosophy
Website ini menggunakan pendekatan **modern, clean, dan user-friendly** dengan fokus pada kemudahan navigasi dan estetika yang menarik untuk mahasiswa.

---

## 🎨 Color Palette

### Primary Colors
```css
/* Main Brand Gradient */
Purple Gradient: #667eea → #764ba2

/* Used for: Navbar, buttons, headings, accents */
```

### Secondary Colors
```css
Background Light: #f5f7fa
Background Gradient: #c3cfe2
Text Dark: #2d3748
Text Light: #718096
Text Muted: #cbd5e0
```

### Status Colors
```css
Success (Open): #c6f6d5 (background) + #22543d (text)
Error (Closed): #fed7d7 (background) + #742a2a (text)
Warning: #ffd89b → #19547b
```

### Neutral Colors
```css
White: #ffffff
Card Shadow: rgba(0, 0, 0, 0.08)
Hover Shadow: rgba(102, 126, 234, 0.2)
```

---

## 📐 Layout Structure

```
┌─────────────────────────────────────────────┐
│           NAVBAR (Sticky)                    │
│  🏠 Logo  |  Home  Kantin  Tentang  [Login] │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│         HERO SECTION (Gradient BG)          │
│                                             │
│  ┌─────────────┐  ┌──────────────────┐     │
│  │   Content   │  │   Illustration   │     │
│  │  - Title    │  │   🍜 🍔 🍕      │     │
│  │  - Desc     │  │   🥗 ☕ 🍰      │     │
│  │  - Buttons  │  │  (Animated)      │     │
│  │  - Stats    │  │                  │     │
│  └─────────────┘  └──────────────────┘     │
│                                             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│       TENANT LIST SECTION (White BG)        │
│                                             │
│         Kantin Tersedia                     │
│    Pilih kantin favorit Anda...            │
│                                             │
│  ┌────────┐  ┌────────┐  ┌────────┐       │
│  │ Card 1 │  │ Card 2 │  │ Card 3 │       │
│  │  🏪    │  │  🏪    │  │  🏪    │       │
│  │ Name   │  │ Name   │  │ Name   │       │
│  │ Desc   │  │ Desc   │  │ Desc   │       │
│  │ [Menu] │  │ [Menu] │  │ [Menu] │       │
│  └────────┘  └────────┘  └────────┘       │
│                                             │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│           FOOTER (Dark Gradient)            │
│                                             │
│  About | Quick Links | Info | Contact      │
│  Social Icons                               │
│  © 2025 Kantin RK ITERA                    │
└─────────────────────────────────────────────┘
```

---

## 🎯 Component Details

### 1. NAVBAR
```
┌──────────────────────────────────────────────┐
│ Gradient Purple Background (Sticky)          │
│ ┌────────────────────────────────────────┐  │
│ │ 🏠 Kantin RK ITERA    [Links] [Login] │  │
│ │ Pesan Makanan dengan Mudah              │  │
│ └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘

Features:
- Sticky position (tetap di atas saat scroll)
- White text on purple gradient
- Hover effects pada links
- Login button dengan white background
```

### 2. HERO SECTION
```
┌─────────────────────────────────────────────┐
│  Left Side (60%)       Right Side (40%)     │
│                                             │
│  Selamat Datang di     ┌─────────────┐     │
│  Kantin Rumah Kayu     │   🍜  🍔   │     │
│  ITERA                 │             │     │
│  (Gradient Text)       │   🍕  🥗   │     │
│                        │             │     │
│  [Description text]    │   ☕  🍰   │     │
│                        └─────────────┘     │
│  [🍽️ Lihat Menu]                          │
│  [📖 Cara Pemesanan]                       │
│                                             │
│  10+      50+      1000+                   │
│  Kantin   Menu     Pesanan                 │
└─────────────────────────────────────────────┘

Features:
- Gradient background (#f5f7fa → #c3cfe2)
- Large gradient title text
- Floating emoji animations
- 2 CTA buttons dengan hover effects
- Statistics display
```

### 3. TENANT CARD
```
┌────────────────────┐
│                    │
│   [Image/Logo]     │
│      or 🏪         │
│                    │
├────────────────────┤
│ Nama Kantin        │
│                    │
│ Deskripsi singkat  │
│ tentang kantin...  │
│                    │
│ 🟢 Buka / 🔴 Tutup │
│                    │
│ [Lihat Menu]       │
│                    │
└────────────────────┘

Features:
- White card dengan shadow
- Hover effect (lift up + shadow increase)
- Status badge dengan warna
- Disabled button jika tutup
- Rounded corners
- Smooth transitions
```

### 4. FOOTER
```
┌─────────────────────────────────────────────┐
│  Dark Gradient Background                   │
│                                             │
│  🏠 Kantin RK    Menu Cepat   Info   Hubungi│
│  ITERA                                      │
│                  - Home       - FAQ  📍 ITERA│
│  [Description]   - Kantin     - Privacy    │
│                  - Tentang    - Terms  📧 Email│
│  📘 📷 🐦        - Kontak               📱 Phone│
│                                             │
│ ────────────────────────────────────────── │
│       © 2025 Kantin RK ITERA               │
└─────────────────────────────────────────────┘
```

---

## 📱 Responsive Design

### Desktop (> 1200px)
- Navbar: Full width dengan semua links
- Hero: 2 columns (60/40)
- Tenant Grid: 3-4 columns
- Footer: 4 columns

### Tablet (768px - 1200px)
- Navbar: Slightly smaller
- Hero: 2 columns (50/50)
- Tenant Grid: 2-3 columns
- Footer: 2 columns

### Mobile (< 768px)
```
┌─────────────┐
│   NAVBAR    │
│  (Stacked)  │
└─────────────┘
┌─────────────┐
│    HERO     │
│  (Stacked)  │
│   Content   │
│     ↓       │
│   Images    │
└─────────────┘
┌─────────────┐
│   TENANTS   │
│   (Single)  │
│ ┌─────────┐ │
│ │ Card 1  │ │
│ └─────────┘ │
│ ┌─────────┐ │
│ │ Card 2  │ │
│ └─────────┘ │
└─────────────┘
┌─────────────┐
│   FOOTER    │
│  (Stacked)  │
└─────────────┘
```

---

## ✨ Animation & Effects

### Loading Animation
```
  ⟳  (Rotating spinner)
Memuat data kantin...
```

### Hover Effects
- Cards: `translateY(-8px)` + shadow increase
- Buttons: `translateY(-2px)` + shadow
- Links: Opacity change
- Images: Scale(1.05)

### Page Load Animations
- Hero: Fade in from left/right
- Cards: Fade in with stagger
- Elements: Slide up on scroll (optional for next iteration)

### Floating Animation
```css
/* Emoji float up and down */
0%, 100%: translateY(0)
50%: translateY(-20px)
Duration: 3s infinite
```

---

## 🎯 Typography

### Font Family
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 
             'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 
             'Cantarell', 'Fira Sans', 'Droid Sans', 
             'Helvetica Neue', sans-serif;
```

### Font Sizes
```css
Hero Title: 3rem (48px)
Section Title: 2.5rem (40px)
Card Title: 1.3rem (20.8px)
Body: 1rem (16px)
Small: 0.9rem (14.4px)
```

### Font Weights
```css
Extra Bold: 800 (Titles)
Bold: 700 (Headings)
Semi-Bold: 600 (Buttons)
Medium: 500 (Links)
Normal: 400 (Body)
Light: 300 (Taglines)
```

---

## 🖼️ Images & Icons

### Icons Used
- Emoji icons (🏠🍽️📖🟢🔴📘📷🐦📍📧📱🏪🍜🍔🍕🥗☕🍰)
- Simple, universal, no icon library needed
- Consistent with modern web design

### Placeholder
- Kantin tanpa logo: Large emoji 🏪
- Hero illustration: Grid of food emojis

---

## 🎨 UI Patterns

### Cards
```css
- Background: white
- Border-radius: 15px
- Shadow: 0 4px 20px rgba(0,0,0,0.08)
- Padding: 1.5rem
- Hover: lift + shadow increase
```

### Buttons
```css
Primary:
  - Gradient background
  - White text
  - Rounded (25-30px)
  - Hover: slight lift

Secondary:
  - White background
  - Gradient border
  - Hover: fill with gradient
```

### Badges
```css
- Inline-block
- Rounded (20px)
- Padding: 0.4rem 1rem
- Small font size
- Colored background + text
```

---

## 📊 State Indicators

### Loading State
```
┌─────────────┐
│      ⟳      │
│  Loading... │
└─────────────┘
```

### Error State
```
┌─────────────────┐
│      ❌          │
│  Error message  │
│  [Retry Button] │
└─────────────────┘
```

### Empty State
```
┌───────────────────┐
│       😔          │
│  No data found    │
└───────────────────┘
```

### Success State (Status Badge)
```
┌──────────┐
│ 🟢 Buka  │
└──────────┘
```

---

## 🎪 User Experience

### Visual Hierarchy
1. **Primary**: Hero title + CTA buttons
2. **Secondary**: Section titles + tenant names
3. **Tertiary**: Descriptions + metadata

### Call-to-Actions
- "Lihat Menu" - Primary CTA
- "Cara Pemesanan" - Secondary CTA
- "Login" - Utility CTA

### Feedback
- Hover states on all interactive elements
- Loading spinners during API calls
- Error messages dengan retry option
- Success indicators (status badges)

---

## 🌟 Unique Features

### Gradient Text
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
```

### Glassmorphism (Optional for next iteration)
```css
background: rgba(255, 255, 255, 0.7);
backdrop-filter: blur(10px);
```

### Smooth Scroll
```css
html {
  scroll-behavior: smooth;
}
```

---

## 🎯 Accessibility Considerations

- ✅ Semantic HTML (nav, main, section, footer)
- ✅ Color contrast ratios (WCAG AA)
- ✅ Hover states untuk feedback
- ✅ Disabled states yang jelas
- ⏳ Keyboard navigation (to be added)
- ⏳ Screen reader support (to be enhanced)
- ⏳ Focus indicators (to be enhanced)

---

## 💡 Design Tips for Next Iteration

1. Add loading skeletons instead of spinners
2. Implement micro-interactions
3. Add page transitions
4. Enhance mobile menu with hamburger
5. Add dark mode toggle
6. Implement toast notifications
7. Add image lazy loading
8. Enhance accessibility features

---

**Design Status**: ✅ MVP Complete & Polished

Website memiliki tampilan yang **modern, professional, dan user-friendly** yang cocok untuk aplikasi pemesanan makanan kampus.

