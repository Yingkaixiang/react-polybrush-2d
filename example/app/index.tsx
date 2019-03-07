import React from "react";
import ReactDOM from "react-dom";

import Demo from "../../src/index";

const App: React.FC<any> = () => {
  return <Demo width={500} height={300} />;
};

const root = document.getElementById("root");
ReactDOM.render(<App />, root);
