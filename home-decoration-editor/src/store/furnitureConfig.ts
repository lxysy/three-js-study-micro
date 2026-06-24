// 家具类型配置映射表
// 维护家具类型标识 → GLB 模型文件、缩放比例、显示名称的映射
// 新增家具类型只需在此添加一项

export interface FurnitureConfig {
  type: string;
  name: string;
  modelUrl: string;
  scale: { x: number; y: number; z: number };
  icon: string;
}

const furnitureConfigs: FurnitureConfig[] = [
  {
    type: "bed2",
    name: "床",
    modelUrl: "./bed2.glb",
    scale: { x: 20, y: 20, z: 20 },
    icon: "./bed.jpg",
  },
  {
    type: "dining-table",
    name: "餐桌",
    modelUrl: "./dining-table.glb",
    scale: { x: 1000, y: 1000, z: 1000 },
    icon: "./table.jpg",
  },
];

/**
 * 根据家具类型标识获取完整配置
 * @param type 家具类型标识，如 "bed2"、"dining-table"
 * @returns 匹配的家具配置，未找到时回退到默认配置（dining-table）
 */
export function getFurnitureConfig(type: string): FurnitureConfig {
  const config = furnitureConfigs.find((c) => c.type === type);
  if (!config) {
    console.warn(
      `[furnitureConfig] 未知家具类型 "${type}"，回退到默认配置 "dining-table"`,
    );
    return furnitureConfigs.find((c) => c.type === "dining-table")!;
  }
  return config;
}

/**
 * 获取所有家具配置（用于菜单渲染）
 */
export function getAllFurnitureConfigs(): FurnitureConfig[] {
  return furnitureConfigs;
}
