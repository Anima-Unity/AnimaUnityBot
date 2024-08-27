declare module 'audioconcat' {
  const audioconcat: (inputFiles: string[]) => {
    concat(outputFile: string, callback: (error: Error | null) => void): void;
  };
  export default audioconcat;
}