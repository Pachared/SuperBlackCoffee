declare module '*.svg' {
  const source: string;
  export default source;
}

interface ImportMeta {
  readonly env: Record<string, string | undefined>;
}
