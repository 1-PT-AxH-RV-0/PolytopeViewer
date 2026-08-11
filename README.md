# PolytopeViewer - 多胞形预览器

PolytopeViewer 是一个基于 Three.js 的交互式三维和四维多胞形预览工具。它支持多种自定义参数调整和投影方式切换，为用户提供直观的多胞形可视化体验。

## 功能特性

1. **多胞形参数调整**：支持调整缩放比例、面不透明度、边（使用球体显示）和顶点（使用圆柱体显示）的尺寸。
2. **投影设置**：支持施莱格尔投影（四维）和透视投影（三维）的切换。施莱格尔投影公式为 `p' = (p.x * s, p.y * s, p.z *s)`，其中 `s = d / (d - p.w)`，d 为投影距离。
3. **旋转**：支持对多胞形进行旋转操作（基于欧拉角）。
4. **显示控制**：可独立切换顶点、边、面、坐标轴（包括第 4 个 w 轴）的显示状态。
5. **信息展示**：在 canvas 左上角实时显示当前多面体的顶点、边、面和胞（四维情况下）的数量。
6. **文件支持**：支持用户上传 OFF 格式文件（仅支持文件头为 OFF 的普通三维 OFF 文件和 4OFF 的四维 OFF 文件）。
7. **可高亮胞**：支持从 [高亮配置文件](HighlightConfigFormat.md) 高亮特定的胞。
8. **可导出视频**：支持通过 YAML 配置文件导出视频，配置文件格式请见 [ConfigFormat.md](ConfigFormat.md)。

## 文件结构

- `src/`：项目源代码目录。
  - `index.html`：主页。
  - `viewer.js`：主类，核心功能。
  - `axesCreater.js`：创建坐标轴。
  - `offCatalog.js`：预设多胞体数据目录。
  - `type.js`：类型定义。
  - `styles/`: 样式
    - `style.scss`：全局样式。
    - `neededBootstrap.scss`：Bootstrap 按需引入。
  - `math/`：数学计算模块。
    - `geo3D.js`：3D 几何计算（法向量、点旋转、共面判断等）。
    - `geo4D.js`：4D 几何计算（4D 旋转矩阵、点变换、Gram-Schmidt 正交化等）。
    - `interp.js`：插值与缓动函数生成器。
  - `utils/`：通用工具模块。
    - `decompPolygon.js`：自相交多边形分解。
    - `general.js`：通用工具函数（range、边对提取、排序、颜色转换等）。
    - `threeHelpers.js`：Three.js 辅助函数（材质修改、资源释放、几何体转换）。
    - `validation.js`：配置校验。
    - `yamlParser.js`：YAML 文件解析。
  - `methods/`：挂载到主类原型上的方法。
    - `error.js`：错误处理。
    - `events.js`：事件处理。
    - `geometry.js`：几何相关方法。
    - `highlight.js`：高亮相关方法。
    - `init.js`：初始化方法。
    - `load.js`：加载方法。
    - `record.js`：录制方法。
    - `render.js`：渲染方法。
    - `update.js`：更新方法。
  - `offProcessors/`：OFF 文件处理模块。
    - `offProcessor.js`：解析 OFF 格式。
    - `offProcessor4D.js`：解析 4OFF 格式。
    - `processMeshData.worker.js`：WebWorker 网格数据处理。
  - `shader/`：着色器模块。
    - `GLSLs.js`：GLSL 辅助函数。
    - `shaderCompCallback.js`：为 Three.js 内置材质注入四维等功能。
  - `infFamilies/`：无限家族模块。
    - `infFamilies.js`：无限家族网格数据生成。
    - `alternation.js`：多胞体的交替操作（用于生成双反角柱）。
- `assets/`：静态资源目录。
  - `fonts/`: 字体目录。
    - `Sarasa_Mono_SC_Bold.typeface.json`：等距更纱黑体，用于绘制坐标轴标签，故仅有 X、Y、Z、W 四个字符的字形。
  - `models/`：OFF 立体模型目录。

## 使用说明

1. 打开主页时默认加载一个小星形十二面体（Small Stellated Dodecahedron）。
2. 通过界面控件调整各项参数，观察多胞形变化。
3. 可上传 OFF 格式文件进行预览（仅支持三维和四维 OFF 文件）。

## 内置多胞形

本工具内置以下多胞形：
- 多面体
  - 柏拉图多面体
  - 开普勒–普安索多面体
  - 阿基米德多面体
  - 卡塔兰多面体
  - 约翰逊多面体
  - 无限家族
    - 均匀角柱
    - 均匀反角柱
    - 偏方面体
    - 冠状多面体
  - 特殊多面体
    - 西洛希多面体
    - 恰萨尔多面体
- 多胞体
  - 凸正多胞体
  - 施莱夫利–赫斯多胞体
  - 以及上面两类经过以下操作的结果：
    - 截角
    - 截半
    - 二截角
    - 小斜方
    - 大斜方
    - 小角柱二截角
    - 小角柱截角
    - 大角柱二截角
  - 无限家族
    - 均匀双角柱（不支持复合双角柱）
    - 双反角柱（不支持原双角柱为复合双角柱的双反角柱）
    - 均匀对偶双罩体（不支持复合双罩体）

之后会添加更多。

## 注意事项

1. 目前仅支持三维和四维 OFF 文件，二维、五维及更高维度文件不受支持，未来也不会考虑支持。因为 GLSL 实现任意维向量困难。
2. 导出视频（录制）为测试功能，后续会完善。
3. 所有配置文件均为 YAML 格式。

## 构建方法

`pnpm format` 格式化代码；
`pnpm server` 启动服务器；
`webpack` 构建项目；

