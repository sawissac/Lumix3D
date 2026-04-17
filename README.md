# Lumix3D

A powerful 3D SVG extrusion and manipulation tool built with Next.js, Three.js, and React Three Fiber.

## Features

### 3D Object Selection & Transformation
- **Click to Select**: Click any 3D object to select it
- **Multi-Selection**: Hold `Ctrl` (Windows/Linux) or `Cmd` (Mac) and click to select multiple objects
- **Visual Feedback**: Selected objects show yellow edges and a subtle amber glow
- **Transform Modes**:
  - **Move (G)**: Translate objects in 3D space
  - **Rotate (R)**: Rotate objects around their center
  - **Scale (S)**: Scale objects uniformly or per-axis
- **Keyboard Shortcuts**:
  - `G` - Toggle Move mode
  - `R` - Toggle Rotate mode
  - `S` - Toggle Scale mode
  - `ESC` - Deselect all objects
- **Axis Locking**: Lock rotation on specific axes (X, Y, Z)

### Object Grouping
- **Create Groups**: Select 2 or more objects and click "Create Group" to group them together
- **Named Groups**: Give custom names to your groups for easy organization
- **Group Transform**: Select a group to transform all objects within it simultaneously
- **Ungroup**: Break apart groups to manipulate objects individually
- **Group Management**: View all groups in the bottom-left panel with object counts
- **Persistent Groups**: Groups maintain their structure throughout your session

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
