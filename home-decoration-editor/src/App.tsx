import "./App.scss";
import Header from "./components/Header";
import Menu from "./components/Menu";
import Main, { getGLTFLoader } from "./components/Main";
import Properties from "./components/Properties";
import { useEffect, useState } from "react";
import { modelMap } from "./modelMap.ts";
import { Progress } from "antd";

const gltfLoader = getGLTFLoader();
function App() {
  const [modelLoaded, setModelLoaded] = useState(false);

  const [percent, setPercent] = useState(0);

  // 组件挂载后，重新为每个模型绑定加载进度回调
  useEffect(() => {
    // 分别记录 4 个模型的加载进度（0~1），初始为 0
    const percentArr = [0, 0, 0, 0];

    Object.keys(modelMap).forEach((modelUrl, index) => {
      // 覆盖 modelMap 中的 Promise，加上 onProgress 回调来追踪单个模型的加载进度
      modelMap[modelUrl] = gltfLoader.loadAsync(modelUrl, (event) => {
        // 当前模型已加载的比例
        const per = event.loaded / event.total;
        percentArr[index] = per;

        // 把 4 个模型的进度累加起来，算出总百分比
        let total = 0;
        percentArr.forEach((item) => {
          total += item;
        });
        // 把所有模型的进度加起来求平均，得到总百分比
        setPercent(Math.floor((total / 4) * 100));
      });
    });
  }, []);

  useEffect(() => {
    Promise.all(Object.values(modelMap)).then(() => {
      setModelLoaded(true);
    });
  }, []);

  return modelLoaded ? (
    <div className="wrap">
      <Header />
      <div className="editor">
        <Menu />
        <Main />
        <Properties />
      </div>
    </div>
  ) : (
    <div id="loading">
      <p>loading...</p>
      <Progress
        percent={percent}
        style={{ width: 500 }}
        percentPosition={{ align: "start", type: "inner" }}
        size={[500, 30]}
        strokeColor="#B7EB8F"
      />
    </div>
  );
}

export default App;
