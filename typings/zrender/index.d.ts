declare module "zrender" {
  class Element {
    constructor(opts?: any);
    shape: any;
    style: any;
    type: string;
    setShape(opts: any): void;
    setStyle(opts: any): void;
  }
  class Group extends Element {
    id: number;
    add(child: Element): void;
    remove(child: Element): void;
    children(): Element[];
    childOfName(name: string): Element[];
  }
  class Displayable extends Element {}
  class Circle extends Displayable {}
  class Line extends Displayable {}
  class Image extends Displayable {}
  class Text extends Displayable {}

  type EventHandler = (event: MouseEvent) => void;

  interface ZRender {
    add: (el: Element) => void;
    remove: (el: Element) => void;
    on: (
      eventName: string,
      eventHandler: EventHandler,
      context: object,
    ) => void;
    off: (
      eventName: string,
      eventHandler: EventHandler,
      context: object,
    ) => void;
  }

  interface initOpts {
    renderer?: string;
    devicePixelRatio?: number;
    width?: string | number;
    height?: string | number;
  }

  function init(dom: HTMLElement, opts?: initOpts): ZRender;
}
