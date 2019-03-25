import React, { useState, useRef } from "react";
import ReactDOM from "react-dom";

import Demo, { PolyBrush2DType } from "../../src/index";

const App: React.FC<any> = () => {
  const [disabled, setDisabled] = useState(false);
  const useDisabled = () => {
    setDisabled(!disabled);
  };

  const [type, setType] = useState();
  const selectType = (type: PolyBrush2DType) => {
    setType(type);
  };

  const [color, setColor] = useState();
  const selectColor = (color: string) => {
    setColor(color);
  };

  const handleComplete = (data: any) => {
    console.dir(data);
  };

  const handleOnBeforeDraw = () => {
    return !disabled;
  };

  const dom = useRef(null);
  const undo = () => {
    if (dom) {
      dom.current.undo();
    }
  };
  const handleUndo = () => {
    console.log("撤销成功回调");
  };

  const getAll = () => {
    if (dom) {
      console.dir(dom.current.getDataSource());
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 10 }}>
        <p>
          <button onClick={useDisabled}>
            {disabled ? "恢复绘制" : "禁止绘制"}
          </button>
          <button onClick={undo}>撤销</button>
          <button onClick={getAll}>获取所有图形</button>
        </p>
        <p>
          <span>选择图形：</span>
          <button onClick={selectType.bind(null, "polygon")}>多边形</button>
          <button onClick={selectType.bind(null, "line")}>线段</button>
        </p>
        <p>
          <span>选择线段颜色：</span>
          <button onClick={selectColor.bind(null, "#52c41a")}>绿色</button>
          <button onClick={selectColor.bind(null, "#1890ff")}>蓝色</button>
        </p>
      </div>
      <Demo
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
        ref={dom}
      />
    </div>
  );
};

const root = document.getElementById("root");
ReactDOM.render(<App />, root);
