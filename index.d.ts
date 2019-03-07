import React from "react";

export interface CanvasProps {
  width: number | string;
  height: number | string;
  color?: string;
  beforeDraw?: (event: MouseEvent) => boolean;
  onMove?: (event: MouseEvent) => void;
  onComplete?: (group: any) => void;
  onUndo?: (group: any) => void;
  type?: "polygon" | "line";
  background?: string;
}

declare class Polybrush extends React.Component<CanvasProps, any> {}

export default Polybrush;
