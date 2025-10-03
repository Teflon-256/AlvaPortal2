/// <reference types="vite/client" />

declare module '@assets/*.PNG' {
  const src: string;
  export default src;
}

declare module '@assets/*.png' {
  const src: string;
  export default src;
}

declare module '@assets/*.jpg' {
  const src: string;
  export default src;
}

declare module '@assets/*.jpeg' {
  const src: string;
  export default src;
}

declare module '@assets/*.svg' {
  const src: string;
  export default src;
}
