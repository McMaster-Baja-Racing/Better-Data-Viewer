// Declare module type for SVG and image files
declare module '*.svg' {
    const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
    export default content;
}
  
declare module '*.png' {
    const content: React.FunctionComponent<React.PNGAttributes<PNGElement>>;
    export default content;
}

declare module '*.gif' {
    const content: React.FunctionComponent<React.GIFAttributes<GIFElement>>;
    export default content;
}