import React from "react";
import zrender, { ZRender, Circle, Line, Group, Element } from "zrender";

import { checkIntersect } from "./util";

export type PolyBrush2DType = "polygon" | "line";

export interface PolyBrush2DProps {
  width?: number | string;
  height?: number | string;
  background?: string;
  color?: string;
  errorColor?: string;
  type?: PolyBrush2DType;
  logging?: boolean;
  onBeforeDraw?: (event: MouseEvent) => boolean;
  onMove?: (event: MouseEvent) => void;
  onComplete?: (group: Group) => void;
  onUndo?: (group: Group) => void;
}
interface PolyBrush2DState {}

class PolyBrush2D extends React.Component<PolyBrush2DProps, PolyBrush2DState> {
  static defaultProps = {
    width: 400,
    height: 300,
    background: "#000",
    color: "#fff",
    type: "polygon",
    logging: false,
    errorColor: "#f5222d"
  };

  private dom: React.RefObject<HTMLDivElement> = React.createRef();
  private zr: ZRender;
  private color: string = this.props.color;
  private type: string = this.props.type;
  // 当前正在绘制的线段是否和已绘制的线段交叉，仅限多边形
  private isIntersect: boolean = false;
  // 是否开始绘制
  private isStart: boolean = false;
  // 一个完整的图形为一个group
  private group: Group | null;
  // 当前绘制图形的元数据
  private dataSource: Group[] = [];
  private lineCount: number = 0;

  componentDidMount() {
    const current = this.dom.current;
    if (current) {
      this.zr = zrender.init(current);
      this.zr.on("mousedown", this.handleMouseDown, this);
      this.zr.on("mousemove", this.handleMouseMove, this);
      current.oncontextmenu = () => false;
    }
  }

  componentWillReceiveProps(nextProps: PolyBrush2DProps) {
    const { color, type } = nextProps;
    this.color = color;
    // 绘制过程中不能修改类型
    if (!this.isStart) {
      this.type = type;
    }
  }

  componentWillUnmount() {
    this.zr.off("mousedown", this.handleMouseDown);
    this.zr.off("mousemove", this.handleMouseMove);
  }

  handleMouseDown = (event: MouseEvent) => {
    const { onBeforeDraw } = this.props;
    if (onBeforeDraw) {
      if (!onBeforeDraw(event)) {
        this.print("已禁止绘制");
        return;
      }
    }

    switch (this.type) {
      case "polygon":
        this.handlePolygonMouseDown(event);
        break;
      case "line":
        this.handleLineMouseDown(event);
        break;
      default:
        break;
    }
  };

  handleMouseMove = (event: MouseEvent) => {
    if (!this.isStart) return;

    const { onMove, errorColor } = this.props;
    if (onMove) {
      onMove(event);
    }

    const { offsetX, offsetY } = event;
    const groupLine = this.childOfType("line");
    const current = groupLine.pop();

    if (!current) return;

    current.setShape({ x2: offsetX, y2: offsetY });

    switch (this.type) {
      case "polygon":
        // 判断相交
        // 相邻两套线段必定相交，因为连接点相同
        // 所以去除这条线段
        groupLine.pop();
        this.isIntersect = this.checkIsIntersect(current, groupLine);
        current.setStyle({
          stroke: this.isIntersect ? errorColor : this.color
        });
        break;
      case "line":
        if (this.lineCount > 1) return;
        break;
      default:
        break;
    }
  };

  // 绘制多边形
  handlePolygonMouseDown = (event: MouseEvent) => {
    this.print("绘制多边形");
    if (this.isIntersect) return;

    if (event.which === 1) {
      this.drawPolygon(event);
    } else if (event.which === 3) {
      this.completePolygon(event);
    }
  };

  handleLineMouseDown = (event: MouseEvent) => {
    this.print("绘制线段");
    if (event.which === 1) {
      this.drawLine(event);
    }
  };

  drawPolygon = (event: MouseEvent) => {
    const { offsetX, offsetY } = event;

    // 第一次绘制
    if (!this.isStart) {
      this.isStart = true;
      this.group = new zrender.Group();
      this.zr.add(this.group);
    }

    // 两次点击的点位相同则不进行绘制
    if (this.checkIsSamePosition(offsetX, offsetY)) return;

    if (!this.group) return;

    const junction = this.junction(offsetX, offsetY, 5, this.color);
    this.group.add(junction);
    const line = this.line(offsetX, offsetY, offsetX, offsetY, this.color);
    this.group.add(line);
  };

  // 绘制线段
  drawLine = (event: MouseEvent) => {
    if (event.which === 1) {
      const { offsetX, offsetY } = event;

      // 第一次绘制
      if (!this.isStart) {
        this.isStart = true;
        this.group = new zrender.Group();
        this.zr.add(this.group);
      }

      if (!this.group) return;

      if (this.lineCount < 2) {
        const junction = this.junction(offsetX, offsetY, 5, this.color);
        this.group.add(junction);
        const line = this.line(offsetX, offsetY, offsetX, offsetY, this.color);
        this.group.add(line);
        this.lineCount++;

        // 线段绘制完成
        if (this.lineCount === 2) {
          const { onComplete } = this.props;
          if (onComplete) {
            this.dataSource.push(this.group);
            onComplete(this.group);
          }
          this.reset();
          this.print("完成线段绘制");
        }
      }
    }
  };

  completePolygon = (event: MouseEvent) => {
    if (!this.isStart) return;

    const groupJunction = this.childOfType("circle");

    // 最少三个节点才能闭合
    if (groupJunction.length < 3) return;

    // 自动闭合多边形
    const firstJunction = groupJunction[0];
    const groupLine = this.childOfType("line");
    // 判断闭合线段和已绘制线段是否相交
    // 获取最后一条线段，即为闭合线段
    const lastLine = groupLine.pop();
    // 删除相邻的线段
    groupLine.pop();
    groupLine.shift();
    if (!lastLine) return;
    const virtualLine = this.line(
      lastLine.shape.x1,
      lastLine.shape.y1,
      firstJunction.shape.cx,
      firstJunction.shape.cy,
      this.color
    );
    const isIntersect = this.checkIsIntersect(virtualLine, groupLine);
    if (!isIntersect) {
      lastLine.setShape({
        x2: firstJunction.shape.cx,
        y2: firstJunction.shape.cy
      });

      if (!this.group) return;
      this.dataSource.push(this.group);

      const onComplete = this.props.onComplete;
      if (onComplete) {
        onComplete(this.group);
      }

      this.reset();

      this.print("完成多边形绘制");
    }
  };

  // 重置
  reset = () => {
    this.group = null;
    this.isStart = false;
    this.isIntersect = false;
    this.lineCount = 0;
  };

  // 连接点
  junction = (cx: number, cy: number, r: number, color: string): Circle => {
    return new zrender.Circle({
      shape: { cx, cy, r },
      style: { stroke: color, fill: color }
    });
  };

  // 连接线
  line = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    stroke: string
  ): Line => {
    return new zrender.Line({
      shape: { x1, y1, x2, y2 },
      style: { stroke, lineWidth: 2 }
    });
  };

  // 判断两次点击的位置是否相同
  checkIsSamePosition = (x: number, y: number): boolean => {
    const groupJunction = this.childOfType("circle");
    if (groupJunction.length) {
      const junction = groupJunction[groupJunction.length - 1];
      const { cx, cy } = junction.shape;
      return x === cx && y === cy;
    }
    return false;
  };

  // 判断指定线段是否和已知线段相交
  checkIsIntersect = (line: Line, groupLine: Line[]) => {
    for (let i = 0; i < groupLine.length; i += 1) {
      const current = groupLine[i];
      const isCross = checkIntersect(
        { x: line.shape.x1, y: line.shape.y1 },
        { x: line.shape.x2, y: line.shape.y2 },
        { x: current.shape.x1, y: current.shape.y1 },
        { x: current.shape.x2, y: current.shape.y2 }
      );
      // 直接返回会中断当前循环，不再遍历其他线段
      if (isCross) {
        return true;
      }
    }
    return false;
  };

  childOfType = (type: string, group?: Group) => {
    const current = group || this.group;
    if (!current) return [];
    return current.children().filter((item: Element) => item.type === type);
  };

  print = (text: string, color?: string) => {
    const { logging } = this.props;
    if (logging) {
      console.log(`%c ${text}`, `color: ${color || "#1890ff"}`);
    }
  };

  // 获取整张画布上已绘制图形数据
  getDataSource = () => this.dataSource;

  // 撤销
  undo = () => {
    const { onUndo } = this.props;
    const group = this.group || this.dataSource.pop();
    if (!group) return;
    if (onUndo) onUndo(group);
    this.remove(group);
    this.reset();
  };

  // 删除一个指定元素
  remove = (group: Group) => {
    this.zr.remove(group);
  };

  render() {
    const { width, height, background } = this.props;
    const defaultStyle = {
      width,
      height,
      background
    };
    return <div style={defaultStyle} ref={this.dom} />;
  }
}

export default PolyBrush2D;
