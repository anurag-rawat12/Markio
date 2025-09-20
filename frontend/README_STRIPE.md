# Stripe-Inspired Homepage

A beautiful, modern homepage inspired by Stripe's design with smooth animations and interactive elements.

## Features

- 🎨 **Gradient Animations**: Smooth moving gradient backgrounds similar to Stripe's design
- 🌊 **Floating Cards**: Interactive draggable cards with payment form, analytics, and task management
- ✨ **Smooth Animations**: Powered by Framer Motion for fluid transitions
- 📱 **Responsive Design**: Optimized for all screen sizes using Tailwind CSS
- 🎭 **Glass Morphism**: Modern frosted glass effects on navigation and cards
- 🎪 **Interactive Elements**: Hover effects, drag functionality, and animated progress bars

## Components

### Navigation
- Fixed navigation bar with backdrop blur
- Animated menu items with gradient underlines
- Responsive design with mobile optimization

### Hero Section
- Animated gradient background with floating orbs
- Typewriter-style text animations
- Call-to-action button with hover effects
- Preview badge with smooth entrance animation

### Floating Cards
- **Task Card**: Progress tracking with animated progress bar
- **Analytics Card**: Revenue metrics with animated SVG chart
- **Payment Card**: Interactive payment form similar to Stripe's design
- All cards are draggable and have smooth hover effects

## Technologies Used

- **React 19** - Latest React version
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Modern icon library

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:5174 in your browser

## Animations

The homepage features several types of animations:
- **Entrance animations**: Components fade in and slide from different directions
- **Background animations**: Moving gradient orbs and color transitions
- **Interaction animations**: Hover effects, button presses, and drag interactions
- **Progress animations**: Animated progress bars and chart drawings
- **Continuous animations**: Floating elements and gradient shifts

## Customization

You can easily customize the colors, animations, and content by modifying:
- `src/components/HeroSection.jsx` - Main content and text
- `src/components/FloatingCards.jsx` - Card content and data
- `src/components/Navigation.jsx` - Menu items and links
- `src/App.css` - Custom animations and styles
- `tailwind.config.js` - Tailwind configuration

## Performance

The animations are optimized for performance using:
- CSS transforms instead of layout properties
- Framer Motion's optimized animation engine
- Proper use of `will-change` CSS property
- Efficient re-rendering patterns

## Browser Support

Works on all modern browsers that support:
- CSS Grid and Flexbox
- CSS Custom Properties
- ES6+ JavaScript features
- SVG animations

Enjoy your beautiful Stripe-inspired homepage! 🎉