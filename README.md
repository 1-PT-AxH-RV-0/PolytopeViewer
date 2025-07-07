# PolytopeViewer - 多胞形预览器

PolytopeViewer 是一个基于 Three.js 的交互式三维和四维多胞形预览工具。它支持多种自定义参数调整和投影方式切换，为用户提供直观的多胞形可视化体验。

## 功能特性

1. **多胞形参数调整**：支持调整缩放比例、面不透明度、边（使用球体显示）和顶点（使用圆柱体显示）的尺寸。
2. **投影设置**：支持施莱格尔投影（四维）和透视投影（三维）的切换。施莱格尔投影公式为 `p' = (p.x * s, p.y * s, p.z *s)`，其中 `s = d / (d - p.w)`，d 为投影距离。
3. **旋转**：支持对多胞形进行旋转操作（基于欧拉角）。
4. **显示控制**：可独立切换顶点、边、面、坐标轴（包括第 4 个 w 轴）的显示状态。
5. **信息展示**：在 canvas 左上角实时显示当前多面体的顶点、边、面和胞（四维情况下）的数量。
6. **文件支持**：支持用户上传 OFF 格式文件（仅支持文件头为 OFF 的普通三维 OFF 文件和 4OFF 的四维 OFF 文件）。
7. **可导出视频**：支持通过 JSON 配置文件导出视频，配置文件格式请见 [ConfigFormat.md](ConfigFormat.md)。

## 文件结构

- `src/`：项目源代码目录。
  - `index.js`: 入口 js.
  - `offProcessor.js`：解析 OFF 的工具。
  - `offProcessor4D.js`：解析 4OFF 的工具。
  - `processMeshData.worker.js`：用 WebWorker 处理网格数据。
  - `axesCreater.js`：创建坐标轴。
  - `helperFunc.js`：一些辅助函数。
  - `GLSLs.js`：在 GLSL 中的辅助函数。
  - `shaderCompCallback.js`：为 Three.js 的内置材质注入四维或其他功能。
  - `type.js`：类型定义。
  - `viewer.js`：主要功能。
  - `style.css`：样式。
  - `index.html`：主页。
- `assets/`：静态资源目录。
  - `fonts/`: 字体目录。
    - `Sarasa_Mono_SC_Bold.typeface.json`：等距更纱黑体，用于绘制坐标轴标签，故仅有 X、Y、Z、W 四个字符的字形。
  - `models/`：模型目录。
    - `Small_stellated_dodecahedron.off`：默认小星形十二面体的 OFF 文件。
- `dist/`：编译结果目录。
  - `index.html`：主页。
  - `js/`：js 代码目录。
  - `assets/`：静态资源目录。


## 使用说明

1. 打开主页时默认加载一个小星形十二面体（Small Stellated Dodecahedron）。
2. 通过界面控件调整各项参数，观察多胞形变化。
3. 可上传 OFF 格式文件进行预览（仅支持三维和四维 OFF 文件）。

## 注意事项

1. 目前仅支持三维和四维 OFF 文件，二维、五维及更高维度文件不受支持，未来也不会考虑支持。
2. 项目暂无其他内置立体模型，后续版本会添加更多预设模型。
3. 导出视频（录制）为测试功能，后续会完善。
