# LavApp

A modern laundry management application built with React, TypeScript, and Bun.

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) v1.0.0 or higher (required)

> **Important:** This project uses Bun exclusively. npm, pnpm, and yarn are not supported.

### Installation

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## 📦 Package Manager

This project enforces the use of **Bun** as the package manager. If you try to install dependencies with npm, pnpm, or yarn, the installation will fail with an error message.

### Why Bun?

- ⚡️ Extremely fast package installation
- 🔒 Built-in lockfile (bun.lock)
- 🎯 Native TypeScript support
- 📦 Smaller node_modules size
- 🚀 Faster script execution

## 🛠️ Tech Stack

- **Framework:** React 19
- **Language:** TypeScript
- **Build Tool:** Vite
- **Routing:** TanStack Router
- **State Management:** TanStack Query
- **UI Components:** shadcn/ui + Radix UI
- **Styling:** Tailwind CSS 4
- **Backend:** Supabase
- **Package Manager:** Bun

## 📝 Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run format` - Format code with Biome

## 🔒 Environment Variables

Create a `.env` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📄 License

This project is private and proprietary.
