import React from "react";

export interface Element {
  constructor(opts?: any);
  shape: any;
  style: any;
  type: string;
  setShape(opts: any): void;
  setStyle(opts: any): void;
}

export interface Group extends Element {
  id: number;
  add(child: Element): void;
  remove(child: Element): void;
  children(): Element[];
  childOfName(name: string): Element[];
}

export interface CanvasProps {
  width: number | string;
  height: number | string;
  color?: string;
  beforeDraw?: (event: MouseEvent) => boolean;
  onMove?: (event: MouseEvent) => void;
  onComplete?: (group: Group) => void;
  onUndo?: (group: Group) => void;
  type?: "polygon" | "line";
  background?: string;
}

declare class Polybrush extends React.Component<CanvasProps, any> {}

export default Polybrush;
