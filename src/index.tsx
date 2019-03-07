import React from "react";
import PropTypes from "prop-types";
import zrender, { ZRender, Circle, Line, Group, Element } from "zrender";

import { checkIntersect } from "./util";

const DEFAULT_COLOR = "#1890ff";
const ERROR_COLOR = "#ff4444";

interface CanvasProps {
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

class Canvas extends React.Component<CanvasProps, any> {
  static defaultProps = {
    color: DEFAULT_COLOR,
    type: "polygon"
  };

  static propTypes = {
    color: PropTypes.string,
    beforeDraw: PropTypes.func,
    onMove: PropTypes.func,
    onUndo: PropTypes.func
  };

  private dom: React.RefObject<HTMLDivElement> = React.createRef();
  private zr: ZRender;
  private group: Group | null;
  private color: string = this.props.color || DEFAULT_COLOR;
  private isStart: boolean = false;
  private isIntersect: boolean = false;
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

  componentWillReceiveProps({ color }: CanvasProps) {
    this.color = color || DEFAULT_COLOR;
  }

  handleMouseDown = (event: MouseEvent) => {
    if (this.isIntersect) return;

    const { beforeDraw, type } = this.props;
    if (beforeDraw) {
      if (!beforeDraw(event)) return;
    }

    switch (type) {
      case "line":
        this.drawLine(event);
        break;
      default:
        this.drawPolygon(event);
        break;
    }
  };

  handleMouseMove = (event: MouseEvent) => {
    if (!this.isStart) return;

    const { onMove, type } = this.props;
    if (onMove) {
      onMove(event);
    }

    const { offsetX, offsetY } = event;
    const groupLine = this.childOfType("line");
    const current = groupLine.pop();

    if (!current) return;

    if (type === "line" && this.lineCount > 1) return;

    current.setShape({ x2: offsetX, y2: offsetY });

    if (type === "polygon") {
      // 判断相交
      // 相邻两套线段必定相交，因为连接点相同
      // 所以去除这条线段
      groupLine.pop();
      this.isIntersect = this.checkIsIntersect(current, groupLine);
      current.setStyle({
        stroke: this.isIntersect ? ERROR_COLOR : this.color
      });
    }
  };

  // 绘制多边形
  drawPolygon = (event: MouseEvent) => {
    if (event.which === 1) {
      this.draw(event);
    } else if (event.which === 3) {
      this.close(event);
    }
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

        if (this.lineCount === 2) {
          const onComplete = this.props.onComplete;
          if (onComplete) {
            onComplete(this.group);
          }
          this.reset();
        }
      }
    }
  };

  draw = (event: MouseEvent) => {
    const { offsetX, offsetY } = event;

    // 第一次绘制
    if (!this.isStart) {
      this.isStart = true;
      this.group = new zrender.Group();
      this.zr.add(this.group);
    }

    if (this.checkIsSamePosition(offsetX, offsetY)) return;
    if (!this.group) return;

    const junction = this.junction(offsetX, offsetY, 5, this.color);
    this.group.add(junction);
    const line = this.line(offsetX, offsetY, offsetX, offsetY, this.color);
    this.group.add(line);
  };

  // 右键自动闭合
  close = (event: MouseEvent) => {
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
    }
  };

  childOfType = (type: string, group?: Group) => {
    const current = group || this.group;
    if (!current) return [];
    return current.children().filter((item: Element) => item.type === type);
  };

  // 获取已绘制数据
  getDataSource = () => this.dataSource;

  // 撤销
  undo = () => {
    const onUndo = this.props.onUndo;
    const group = this.group || this.dataSource.pop();
    if (!group) return;
    if (onUndo) onUndo(group);
    this.zr.remove(group);
    this.reset();
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

  // 判断两次点击的位置是否相同
  // 相同则不尽兴绘制
  checkIsSamePosition = (x: number, y: number): boolean => {
    const groupJunction = this.childOfType("circle");
    if (groupJunction.length) {
      const junction = groupJunction[groupJunction.length - 1];
      const { cx, cy } = junction.shape;
      return x === cx && y === cy;
    }
    return false;
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

  // 删除一个指定元素
  remove = (group: Group) => {
    this.zr.remove(group);
  };

  render() {
    const { background } = this.props;
    const style = {
      width: this.props.width,
      height: this.props.height,
      background: background || "#000000"
    };
    return <div style={style} ref={this.dom} />;
  }
}

export default Canvas;
