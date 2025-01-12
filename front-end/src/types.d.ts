declare module '*.scss' {
  const classes: Record<string, string>;
  export default classes;
}

import { ThreeElements } from '@react-three/fiber'

declare global {
  namespace React {
    namespace JSX {
        interface IntrinsicElements extends ThreeElements {
        }
    }
  }
}

// Can also look into more strict approaches such as typed-scss-modules