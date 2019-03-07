# Landmark

基于 `Zrender` 的标记工具

## 如何使用

绘制多边形，右键自动闭合

![成功](https://media.giphy.com/media/9V92OvariLGnYxXdWJ/giphy.gif)

线段交叉则不能自动闭合

![失败](https://media.giphy.com/media/5nrWWH3HrWf19J6Esw/giphy.gif)

## Props

| 参数       | 类型                            | 说明                                               | 默认值  |
| ---------- | ------------------------------- | -------------------------------------------------- | ------- |
| background | string                          | 绘制区域背景色                                     | #000000 |
| beforeDraw | (event: MouseEvent) => boolean; | 生命周期，开始绘制前，true 开始绘制 false 停止绘制 | -       |
| color      | string                          | 线段颜色，仅支持 hex 格式                          | #1890ff |
| height     | string \| number                | 绘制区域高度                                       | -       |
| onComplete | (group: Group) => void          | 生命周期，绘制完成                                 | -       |
| onMove     | (event: MouseEvent) => void     | 生命周期，绘制中                                   | -       |
| onUndo     | (group: Group) => void          | 生命周期，撤销                                     | -       |
| type       | string                          | 绘制的形状 polygon 多边形 line 线段                | polygon |
| width      | string \| number                | 绘制区域宽度                                       | -       |

## Events

| 参数          | 说明                                   | 返回值  |
| ------------- | -------------------------------------- | ------- |
| undo          | 撤销前一个绘制图形                     | void    |
| getDataSource | 获取全部绘制的图形数据，查看控制台输出 | Group[] |
