/// <reference types="vite/client" />

// Type declarations for CSS and other asset imports
declare module '*.css' {
  const content: string;
  export default content;
}

declare module 'leaflet/dist/leaflet.css' {
  const content: string;
  export default content;
}

declare module '*.scss' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}
