import "./App.scss";
import { ConfigProvider, theme } from "antd";
import Menu from "./components/Menu";
import Main from "./components/Main";
import Properties from "./components/Properties";
import { MeshTypes, useThreeStore } from "./store";
import { useEffect } from "react";

function App() {
  const { data, addMesh } = useThreeStore();

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <div className="wrap">
        <Menu />
        <div className="editor">
          <Main />
          <Properties />
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;
