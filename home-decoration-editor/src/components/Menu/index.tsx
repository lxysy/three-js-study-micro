import { HomeOutlined, UngroupOutlined } from "@ant-design/icons";
import { useState, useEffect, useRef } from "react";
import { Card, Image, Popconfirm, Segmented } from "antd";
import { Meta } from "antd/es/list/Item";
import data1 from "../../store/house1";
import data2 from "../../store/house2";
import { useHouseStore } from "../../store/index";
import { useDrag } from "react-dnd";
import { getAllFurnitureConfigs, type FurnitureConfig } from "../../store/furnitureConfig";

interface MenuItemProps {
  imgSrc: string;
  title: string;
  furnitureType: string;
}

function MenuItem(props: MenuItemProps) {
  const ref = useRef(null);

  const [, drag] = useDrag(() => ({
    type: "家具",
    item: { furnitureType: props.furnitureType },
  }));

  useEffect(() => {
    drag(ref);
  }, []); 

  return (
    <Card
      hoverable
      style={{ width: 200, margin: 20 }}
      cover={<img width={200} ref={ref} src={props.imgSrc} />}
    >
      <Meta title={props.title} description="" />
    </Card>
  );
}

function Menu() {
  const [left, setLeft] = useState(0);

  const { setData } = useHouseStore();

  const [key, setKey] = useState("户型");

  return (
    <div className="Menu" style={{ left: left }}>
      <Segmented
        value={key}
        onChange={setKey}
        block
        options={[
          {
            label: (
              <div>
                <HomeOutlined />
                <span style={{ padding: 10 }}>户型</span>
              </div>
            ),
            value: "户型",
          },
          {
            label: (
              <div>
                <UngroupOutlined />
                <span style={{ padding: 10 }}>家具</span>
              </div>
            ),
            value: "家具",
          },
        ]}
      />
      {key === "户型" ? (
        <div>
          <Popconfirm
            title="提醒"
            description="切换户型将清空数据，是否继续？"
            onConfirm={() => setData(data1)}
            okText="是"
            cancelText="否"
          >
            <Card
              hoverable
              style={{ width: 200, margin: 20 }}
              cover={<Image width={200} src="./house1.png" />}
            >
              <Meta title="1室1厅0厨0卫" description="" />
            </Card>
          </Popconfirm>

          <Popconfirm
            title="提醒"
            description="切换户型将清空数据，是否继续？"
            onConfirm={() => setData(data2)}
            okText="是"
            cancelText="否"
          >
            <Card
              hoverable
              style={{ width: 200, margin: 20 }}
              cover={<Image width={200} src="./house2.png" />}
            >
              <Meta title="1室2厅0厨0卫" description="" />
            </Card>
          </Popconfirm>
        </div>
      ) : null}

      {key === "家具" ? (
        <div>
          {getAllFurnitureConfigs().map((config: FurnitureConfig) => (
            <MenuItem
              key={config.type}
              imgSrc={config.icon}
              title={config.name}
              furnitureType={config.type}
            />
          ))}
        </div>
      ) : null}
      <div
        className="drawer-bar"
        onClick={() => {
          setLeft(left === 0 ? -300 : 0);
        }}
      ></div>
    </div>
  );
}

export default Menu;
