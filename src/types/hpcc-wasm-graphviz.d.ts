// @hpcc-js/wasm/graphviz's own .d.ts is `export * from "@hpcc-js/wasm-graphviz"`,
// a devDependency of the umbrella package that npm does not install, so tsc
// sees no exports (TS2305). The runtime bundle is self-contained and works.
// simplify: declares only the two calls this repo makes (load, dot); delete
// this file once the umbrella package ships resolvable types.
declare module "@hpcc-js/wasm-graphviz" {
  export class Graphviz {
    static load(): Promise<Graphviz>;
    dot(src: string, outputFormat?: string): string;
  }
}
