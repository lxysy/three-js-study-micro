import { useEffect, useRef, useState } from "react";
import { init } from "./3d-init";
import "./App.css";
import gsap from "gsap";

function App() {
  const cameraRef = useRef();

  // 初始化
  useEffect(() => {
    const dom = document.getElementById("content");
    const { scene, camera } = init(dom);
    cameraRef.current = camera;

    return () => {
      dom.innerHTML = "";
    };
  }, []);

  // 这里点击不生效
  // react 绑定事件是用事件冒泡的方式，统一在根元素处理。
  // 用 CSS3DObject 渲染的时候，会把desktop移到根元素外面
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const ele = document.querySelector(".app");
    const handler = () => {
      console.log("handler click");
      setOpen(true);
      console.log(cameraRef.current);
      // cameraRef.current.position.set(500, 100, 0);
      gsap.to(cameraRef.current.position, {
        x: 500,
        y: 100,
        z: 0,
        duration: 1,
      });
    };
    ele.addEventListener("click", handler);

    const handler2 = () => {
      console.log("handler2 click");

      setOpen(false);
      // cameraRef.current.position.set(1200, 500, 0);
      gsap.to(cameraRef.current.position, {
        x: 1200,
        y: 500,
        z: 0,
        duration: 1,
      });
    };
    document.addEventListener("click", handler2);

    // 清理函数 在组件卸载或重新渲染前执行
    return () => {
      ele.removeEventListener("click", handler);
      document.removeEventListener("click", handler2);
    };
  }, []);

  return (
    <div>
      <div id="main">
        <div id="content"></div>
        {/* 因为 CSS3DRenderer在渲染元素的时候会把它设置为 display:block */}
        <div id="desktop" style={{ display: "none" }}>
          <img className="bg" src="./bg.png" />
          <div className="app" onDoubleClick={() => setOpen(true)}>
            <div className="logo"></div>
            <div className="name">浏览器</div>
          </div>
          <iframe
            className="browser"
            style={{ display: open ? "block" : "none" }}
            src="https://sogou.com/"
          />
        </div>
      </div>
    </div>
  );
}

export default App;
