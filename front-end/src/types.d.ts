declare module '*.scss' {
  const classes: Record<string, string>;
  export default classes;
}

// Can also look into more strict approaches such as typed-scss-modules