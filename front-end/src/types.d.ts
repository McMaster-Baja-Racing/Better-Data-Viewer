// Can also look into more strict approaches such as typed-scss-modules
declare module '*.scss' {
  const classes: Record<string, string>;
  export default classes;
}


// This fix is given by https://github.com/pmndrs/react-three-fiber/issues/3385#issuecomment-2446045646
import { ThreeElements } from '@react-three/fiber';

declare global {
  namespace React {
    namespace JSX {
        // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        interface IntrinsicElements extends ThreeElements {
        }
    }
  }
}