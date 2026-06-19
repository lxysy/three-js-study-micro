import "./App.css";
import { useEffect, useRef, useState } from "react";
import { init } from "./3d-init.js";

function App() {
  // useRef 变更不会触发重渲染，只是单纯存一个可变引用，供事件处理函数在未来的某个时刻调用
  const jumpRef = useRef(() => {});

  const [str, setStr] = useState("");

  // useEffect 也就是 dom 渲染完之后 init 一下 three.js。
  useEffect(() => {
    const dom = document.getElementById("content");
    const { jump } = init(dom, setStr);
    // jump 变量只在 useEffect 的闭包内部可访问，无法直接在 JSX 中使用
    jump("red");
    // useEffect 闭包 → 把 jump 赋值给 jumpRef.current → JSX 中通过 jumpRef.current() 调用
    jumpRef.current = jump;

    return () => {
      dom.innerHTML = "";
    };
  }, []);

  return (
    <div>
      <div id="header">React 和 Three.js</div>
      <div id="main">
        <div id="content"></div>
        <div id="operate">
          <button
            onClick={() => {
              jumpRef.current("red");
            }}
          >
            红色
          </button>
          <button
            onClick={() => {
              jumpRef.current("green");
            }}
          >
            绿色
          </button>
          <button
            onClick={() => {
              jumpRef.current("blue");
            }}
          >
            蓝色
          </button>
          <div>{str}</div>
        </div>
      </div>
    </div>
  );
}

export default App;
