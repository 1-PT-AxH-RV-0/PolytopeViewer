# 录制配置文件说明

## 初始配置参数

| 参数名                  | 类型              | 说明                       | 约束条件                                                             |
|-------------------------|-------------------|----------------------------|----------------------------------------------------------------------|
| initialRot              | number[]          | 初始旋转角度               | 必须为包含 6 个实数的数组，索引 2、4、5 上的值在非 4D 模式下必须为 0 |
| initialOfs              | number[]          | 初始偏移量（4D）           | 必须为包含 4 个实数的数组，只在 4D 模式下可用                        |
| initialOfs3             | number[]          | 初始偏移量（3D）           | 必须为包含 3 个实数的数组                                            |
| initialVerticesEdgesDim | number            | 边和顶点的初始尺寸         | 必须为正实数                                                         |
| initialProjDist         | number            | 初始投影距离（4D）         | 必须为正实数，只在 4D 模式下可用                                     |
| initialFaceOpacity      | number            | 初始面透明度               | 必须为 0~1 之间的实数                                                |
| initialVisibilities     | object            | 初始可见性设置             | 键必须是 'faces'/'wireframe'/'vertices'/'axes'，值为布尔值           |
| initialCameraProjMethod | string            | 初始相机投影方法           | 必须是 'persp' 或 'ortho'                                            |
| initialSchleProjEnable  | boolean           | 是否启用施菜格尔投影（4D） | 必须为布尔值，只在 4D 模式下可用                                     |
| initialHighlightConfig  | object \| string  | 初始胞高亮配置             | 必须符合 [高亮配置文件](HighlightConfigFormat.md) 格式               |

## 动作配置(actions)

### 通用字段
| 字段      | 类型    | 说明                             | 约束条件                |
|-----------|---------|----------------------------------|-------------------------|
| type      | string  | 动作类型                         | 必须是支持的类型之一    |
| start/end | number  | 动作开始 / 结束帧（部分类型适用）| ≥0 的整数，且 end≥start |
| at        | number  | 执行动作的帧（部分类型适用）     | ≥0 的整数               |

### 动作类型说明

| 类型(type)          | 特有字段        | 类型             | 说明                                                   | 约束条件                                               |
|---------------------|-----------------|------------------|--------------------------------------------------------|--------------------------------------------------------|
| rot                 | angle           | number           | 旋转角度，角度制                                       | 必须为实数                                             |
|                     | plane           | number           | 旋转平面，0~5 的值分别代表 xy、xz、xw、yz、yw、zw 平面 | 0~5 的整数，2、4、5（xw、yw 和 zw）仅在 4D 模式可用    |
| trans4              | ofs             | number[]         | 4D 偏移量                                              | 必须为 4 个实数的数组（仅 4D 模式可用）                |
| trans3              | ofs             | number[]         | 3D 偏移量                                              | 必须为 3 个实数的数组                                  |
| setVerticesEdgesDim | dimOfs          | number           | 顶点和边的尺寸偏移量                                   | 必须为实数                                             |
| setProjDist         | projDistOfs     | number           | 投影距离偏移量（4D）                                   | 必须为实数（仅4D模式可用）                             |
| setFaceOpacity      | faceOpacityOfs  | number           | 面透明度偏移量                                         | 必须为实数                                             |
| setVisibility       | target          | string           | 目标对象                                               | 必须是 'faces'/'wireframe'/'vertices'/'axes' 之一      |
|                     | visibility      | boolean          | 可见性                                                 | 必须为布尔值                                           |
| setCameraProjMethod | projMethod      | string           | 投影方法                                               | 必须是 'persp' 或 'ortho'                              |
| setSchleProjEnable  | enable          | boolean          | 是否启用施莱格尔投影（4D）                             | 必须为布尔值（仅4D模式可用）                           |
| highlightCells      | highlightConfig | object \| string | 胞高亮配置                                             | 必须符合 [高亮配置文件](HighlightConfigFormat.md) 格式 |

## 注意事项

1. 每个动作必须包含:
  - 要么同时有 `start` 和 `end` 字段；
  - 要么只有 `at` 字段。

2. 字段适用性:
  - `start/end` 适用于: rot、trans4、trans3、setVerticesEdgesDim、setProjDist 和 setFaceOpacity；
  - `at` 适用于: setVisibility、setCameraProjMethod、highlightCells 和 setSchleProjEnable。

3. 4D专用功能:
  - initialOfs、initialProjDist、initialSchleProjEnable；
  - trans4、setProjDist、setSchleProjEnable 动作；
  - rot 动作的 plane 字段值 2, 4, 5。

4. 额外提醒：
  - 在 4D 模式下，trans4 是平移物体的 4D 坐标，而 trans3 是平移物体的 3D 投影的坐标，这两者的效果是不一样的！！
  - 3D 和 4D 的旋转是分顺序的，即先绕 xz 平面旋转再绕 yw 平面旋转和先绕 yw 平面旋转再绕 xz 平面旋转相同的角度，效果是不一样的。此代码中的旋转顺序由书写顺序决定。
  - 若某初始配置参数未传入，则按 UI 控件状态设置。
  - 为了过度效果，边和顶点尺寸、投影距离和面透明效果使用偏移量设置。
