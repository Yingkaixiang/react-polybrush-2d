import * as React from "react";

// export interface Element {
//   constructor(opts?: any);
//   shape: any;
//   style: any;
//   type: string;
//   setShape(opts: any): void;
//   setStyle(opts: any): void;
// }

// export interface Group extends Element {
//   id: number;
//   add(child: Element): void;
//   remove(child: Element): void;
//   children(): Element[];
//   childOfName(name: string): Element[];
// }

export type PolyBrush2DType = "polygon" | "line";

export interface PolyBrush2DProps {
  width?: number | string;
  height?: number | string;
  background?: string;
  color?: string;
  errorColor?: string;
  type?: any;
  logging?: boolean;
  onBeforeDraw?: (event: MouseEvent) => boolean;
  onMove?: (event: MouseEvent) => void;
  onComplete?: (group: any) => void;
  onUndo?: (group: any) => void;
}

declare class Polybrush2D extends React.Component<PolyBrush2DProps, any> {}

export default Polybrush2D;
