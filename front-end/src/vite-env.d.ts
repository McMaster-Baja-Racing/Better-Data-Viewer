// This file is needed to allow importing of images in TypeScript files
// The solution was found here: https://github.com/vitejs/vite/discussions/6799#discussioncomment-5393727
/// <reference types="vite/client" />

declare module '*.obj' {
  const content: string;
  export default content;
}