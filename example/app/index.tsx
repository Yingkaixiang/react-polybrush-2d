import React from "react";
import ReactDOM from "react-dom";

import Demo from "../../src/index";

const App: React.SFC<any> = () => {
  return (
    <div>
      <Demo width={500} height={300} />
    </div>
  );
};

const root = document.getElementById("root");
ReactDOM.render(<App />, root);
