# react-polybrush-2d

![version](https://img.shields.io/badge/version-1.1.0-blue.svg)

基于 `Zrender` 的标记工具，可以用于图片的区域绘制，并获得相应的绘制点坐标。

## 如何使用

```bash
yarn add react-polybrush-2d
```

```js
import React from "react";
import ReactDOM from "react-dom";
import PolyBrush2D from "react-polybrush-2d";

const App = () => {
  return (
    <PolyBrush2D
      width={500}
      height={300}
      background={"#666"}
      errorColor={"#ff4d4f"}
      type={type}
      color={color}
      logging={true}
      onComplete={handleComplete}
      onBeforeDraw={handleOnBeforeDraw}
      onUndo={handleUndo}
    />
  );
};

const root = document.getElementById("root");
ReactDOM.render(<App />, root);
```

绘制多边形，右键自动闭合

![成功](https://media.giphy.com/media/9V92OvariLGnYxXdWJ/giphy.gif)

线段交叉则不能自动闭合

![失败](https://media.giphy.com/media/5nrWWH3HrWf19J6Esw/giphy.gif)

绘制线段

![绘制线段](https://media.giphy.com/media/1vZ6SLjJZA6TLsvsR4/giphy.gif)

## Props

| 参数       | 类型                            | 说明                                               | 默认值  | 必填 |
| ---------- | ------------------------------- | -------------------------------------------------- | ------- | ---- |
| background | string                          | 绘制区域背景色                                     | #000000 | /    |
| beforeDraw | (event: MouseEvent) => boolean; | 生命周期，开始绘制前，true 开始绘制 false 停止绘制 | -       | /    |
| color      | string                          | 当前线段颜色，可以动态修改，仅支持 hex 格式        | #1890ff | /    |
| errorColor | string                          | 两条线段相交时的提示颜色                           | #f5222d | /    |
| height     | string \| number                | 绘制区域高度                                       | -       | /    |
| logging    | boolean                         | 是否显示绘制日志                                   | false   | /    |
| onComplete | (group: Group) => void          | 生命周期，绘制完成                                 | -       | /    |
| onMove     | (event: MouseEvent) => void     | 生命周期，绘制中                                   | -       | /    |
| onUndo     | (group: Group) => void          | 生命周期，撤销                                     | -       | /    |
| type       | string                          | 绘制的形状 polygon 多边形 line 线段                | polygon | /    |
| width      | string \| number                | 绘制区域宽度                                       | -       | /    |

## Events

| 参数          | 说明                                   | 返回值  |
| ------------- | -------------------------------------- | ------- |
| undo          | 撤销前一个绘制的图形                   | void    |
| getDataSource | 获取全部绘制的图形数据，查看控制台输出 | Group[] |

## 更新日志

### 1.1.0

- 🐞 修复组件销毁后未解除已绑定的事件
- 🐞 修改 zrender 定义文件
- 🐞 修复绘制过程中可以动态修改绘图类型的问题
- 🐞 修复已绘线段无法撤销的问题
- 🌟 添加详细的 demo 演示
- 🌟 添加控制台绘制日志功能
- 🌟 添加自定义交叉线提示颜色
- 🌟 修改 api `beforeDraw` 为 `onBeforeDraw`
- 🌟 优化文档
