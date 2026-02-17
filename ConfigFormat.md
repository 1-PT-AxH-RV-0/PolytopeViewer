# 录制配置文件说明

## 初始配置参数

| 参数名                      | 类型              | 说明                        | 约束条件                                                                              |
|-----------------------------|-------------------|-----------------------------|---------------------------------------------------------------------------------------|
| initialRot                  | number[]          | 初始旋转角度                | 必须为包含 6 个实数的数组，索引 2、4、5 上的值在非 4D 模式下必须为 0                  |
| initialOfs                  | number[]          | 初始偏移量（4D）            | 必须为包含 4 个实数的数组，只在 4D 模式下可用                                         |
| initialOfs3                 | number[]          | 初始偏移量（3D）            | 必须为包含 3 个实数的数组                                                             |
| initialVerticesEdgesDim     | number            | 边和顶点的初始尺寸          | 必须为正实数                                                                          |
| initialProjDist             | number            | 初始投影距离（4D）          | 必须为正实数，只在 4D 模式下可用                                                      |
| initialFaceOpacity          | number            | 初始面透明度                | 必须为 0~1 之间的实数                                                                 |
| initialVisibilities         | object            | 初始可见性设置              | 键必须是 'faces'/'wireframe'/'vertices'/'axes'，值为布尔值                            |
| initialCameraProjMethod     | string            | 初始相机投影方法            | 必须是 'persp' 或 'ortho'                                                             |
| initialSchleProjEnable      | boolean           | 是否启用施菜格尔投影（4D）  | 必须为布尔值，只在 4D 模式下可用                                                      |
| initialHighlightConfig      | object            | 初始胞高亮配置              | 必须符合 [高亮配置文件](HighlightConfigFormat.md) 格式，只在 4D 模式下可用            |
| initialHighlightFacesConfig | object            | 初始面高亮配置              | 必须符合 [高亮配置文件](HighlightConfigFormat.md#面高亮配置) 格式，只在 3D 模式下可用 |
| endExtraFrames              | number            | 末尾的额外帧数，默认 30(1s) | 必须为自然数                                                                          |

## 动作配置(actions)

### 通用字段
| 字段      | 类型    | 说明                             | 约束条件                |
|-----------|---------|----------------------------------|-------------------------|
| type      | string  | 动作类型                         | 必须是支持的类型之一    |
| start/end | number  | 动作开始 / 结束帧（部分类型适用）| ≥0 的整数，且 end≥start |
| at        | number  | 执行动作的帧（部分类型适用）     | ≥0 的整数               |

### 动作类型说明

| 类型(type)          | 特有字段        | 类型     | 说明                                                   | 约束条件                                                                 |
|---------------------|-----------------|----------|--------------------------------------------------------|--------------------------------------------------------------------------|
| rot                 | angle           | number   | 旋转角度，角度制                                       | 必须为实数                                                               |
|                     | plane           | number   | 旋转平面，0~5 的值分别代表 xy、xz、xw、yz、yw、zw 平面 | 0~5 的整数，2、4、5（xw、yw 和 zw）仅在 4D 模式可用                      |
| trans4              | ofs             | number[] | 4D 偏移量                                              | 必须为 4 个实数的数组（仅 4D 模式可用）                                  |
| trans3              | ofs             | number[] | 3D 偏移量                                              | 必须为 3 个实数的数组                                                    |
| setVerticesEdgesDim | dimOfs          | number   | 顶点和边的尺寸偏移量                                   | 必须为实数                                                               |
| setProjDist         | projDistOfs     | number   | 投影距离偏移量（4D）                                   | 必须为实数（仅4D模式可用）                                               |
| setFaceOpacity      | faceOpacityOfs  | number   | 面透明度偏移量                                         | 必须为实数                                                               |
| setVisibility       | target          | string   | 目标对象                                               | 必须是 'faces'/'wireframe'/'vertices'/'axes' 之一                        |
|                     | visibility      | boolean  | 可见性                                                 | 必须为布尔值                                                             |
| setCameraProjMethod | projMethod      | string   | 投影方法                                               | 必须是 'persp' 或 'ortho'                                                |
| setSchleProjEnable  | enable          | boolean  | 是否启用施莱格尔投影（4D）                             | 必须为布尔值（仅 4D 模式可用）                                           |
| highlightCells      | highlightConfig | object   | 胞高亮配置                                             | 必须符合 [高亮配置文件格式](HighlightConfigFormat.md) （仅 4D 模式可用） |
|                     | hideFaces(可选) | boolean  | 是否自动隐藏面，默认 true                              | 必须为布尔值                                                             |
| highlightFaces      | highlightConfig | object   | 面高亮配置                                             | 必须符合 [高亮配置文件格式](HighlightConfigFormat.md) （仅 4D 模式可用） |
|                     | hideFaces(可选) | boolean  | 是否自动隐藏面，默认 true                              | 必须为布尔值                                                             |

## 注意事项

1. 每个动作必须包含:
  - 要么同时有 `start` 和 `end` 字段；
  - 要么只有 `at` 字段。

2. 字段适用性:
  - `start/end` 适用于: rot、trans4、trans3、setVerticesEdgesDim、setProjDist 和 setFaceOpacity；
  - `at` 适用于: setVisibility、setCameraProjMethod、highlightCells 和 setSchleProjEnable。

3. 4D专用功能:
  - initialOfs、initialProjDist、initialSchleProjEnable, initialHighlightConfig；
  - trans4、setProjDist、setSchleProjEnable, highlightCells 动作；
  - rot 动作的 plane 字段值 2, 4, 5。

4. 额外提醒：
  - 在 4D 模式下，trans4 是平移物体的 4D 坐标，而 trans3 是平移物体的 3D 投影的坐标，这两者的效果是不一样的！！
  - 3D 和 4D 的旋转是分顺序的，即先绕 xz 平面旋转再绕 yw 平面旋转和先绕 yw 平面旋转再绕 xz 平面旋转相同的角度，效果（可能）是不一样的。此代码中的旋转顺序由书写顺序决定。
  - `endExtraFrames` 的效果是在视频最后继续录制，但是没有任何动作。（用于最后一个动作为瞬时动作时，避免因视频结束而没有看到效果）
  - 若某初始配置参数未传入，则按 UI 控件状态设置。
  - 为了过渡效果，边和顶点尺寸、投影距离和面透明效果使用偏移量设置。
  - 多个动作的执行时间可以有重叠。

## 示例

以下是五个从简单到复杂的录制配置文件示例，包含详细注释：

### 示例1：基础3D旋转
```yaml
initialRot: [0, 0, 0, 0, 0, 0]   # 初始无旋转
initialVerticesEdgesDim: 0.7     # 边和顶点初始尺寸更大（UI 默认值为 0.5）
initialFaceOpacity: 0.8          # 初始面透明度
endExtraFrames: 30               # 末尾保留 30 帧（1 秒）

actions:
  - type: rot                    # 旋转动作
    start: 0                     # 从第 0 帧开始
    end: 60                      # 到第 60 帧结束（2 秒）
    angle: 360                   # 旋转 360 度
    plane: 0                     # 绕 xy 平面旋转（3D 模式下就是 z 轴）
```

### 示例2：3D复合动画
```yaml
initialRot: [30, 0, 0, 0, 0, 0]  # 初始 z 轴旋转 30 度
initialOfs3: [0, 0, -5]          # 初始 z 轴偏移 -5（拉远镜头）
initialVerticesEdgesDim: 0.5    
initialFaceOpacity: 1.0          
initialVisibilities:             # 初始可见性设置
  wireframe: false               # 关闭线框显示
  vertices: false                # 关闭顶点显示

actions:
  - type: rot                    # 第一个旋转（y 轴）
    start: 0
    end: 90
    angle: 180
    plane: 1                     # xz平面（即 y 轴）
  
  - type: trans3                 # 平移动画
    start: 60                    # 从第 60 帧开始
    end: 120                     # 到第 120 帧结束
    ofs: [2, 1, 0]               # x+2, y+1
  
  - type: setVisibility          # 瞬时动作（显示线框）
    at: 90
    target: wireframe
    visibility: true
  
  - type: setVisibility          # 瞬时动作（显示顶点）
    at: 90
    target: vertices
    visibility: true
```

### 示例3：4D基础动画
```yaml
initialRot: [0, 0, 0, 0, 0, 0]  
initialOfs: [0, 0, 0, 5]         # 4D 偏移（w轴+5）
initialProjDist: 3               # 投影距离
initialSchleProjEnable: true     # 启用施莱格尔投影
initialVisibilities:
  faces: false                   # 不显示面
endExtraFrames: 60               # 结尾保留2秒

actions:
  - type: rot                    # 4D 旋转（xw 平面）
    start: 0
    end: 120
    angle: 90
    plane: 2                     # xw 平面（仅 4D 可用）
  
  - type: highlightCells        # 高亮特定胞
    at: 60
    highlightConfig:
      FF0000FF:                 # 红色
        indices: [0, 1, 2]      # 高亮前三个胞
    hideFaces: false            # 不自动隐藏面（注：这会导致高亮出的面与多胞体的面重叠，需要在之前隐藏面）
```

### 示例4：4D高级动画（复杂效果）
```yaml
initialRot: [45, 0, 0, 0, 0, 0]  
initialOfs: [0, 0, 0, 4]        
initialProjDist: 2.5            
initialFaceOpacity: 0.6          
initialVisibilities:
  faces: false                   # 不显示面（防止初始高亮出的面与多胞体的面重叠）
initialHighlightConfig:          # 初始高亮配置
  FF00FF77:                      # 半透明品红
    nHedra: [4]                  # 所有四面体胞

actions:
  - type: rot                    # 复合旋转
    start: 0
    end: 90
    angle: 180
    plane: 3                     # yz 平面
  
  - type: trans4                 # 4D 平移
    start: 30
    end: 120
    ofs: [0, 0, 0, -2]           # w 轴移动
  
  - type: setProjDist            # 动态调整投影距离
    start: 60
    end: 150
    projDistOfs: 1.5             # 从 2.5 增加到 4.0
  
  - type: highlightCells        # 复杂高亮
    at: 90
    highlightConfig:
      00FF00FF:                 # 绿色
        nHedra:
          - nFaces: 6
            ranges: [[0, 5]]     # 前 5 个六面体胞
      FF000077:                 # 半透明红
        indices: [10, 11, 12]
        exclude: { indices: [11] } # 排除第 11 个胞
```

### 示例5：复杂4D动画
```yaml
initialRot: [0, 30, 0, 15, 0, 0]  # 复合初始旋转
initialOfs: [1, 0, -1, 3]        
initialProjDist: 3               
initialSchleProjEnable: false     # 正交投影（4D）
initialCameraProjMethod: ortho    # 正交投影
initialVisibilities:
  faces: false                    # 不显示面，原因同上
initialHighlightConfig:
  0000FFFF: all                   # 全部蓝色高亮
endExtraFrames: 90                # 3秒缓冲

actions:
  # 第一阶段：三平面旋转
  - type: rot
    start: 0
    end: 60
    angle: 120
    plane: 0                     # xy
  
  - type: rot
    start: 20
    end: 80
    angle: 180
    plane: 3                     # yz
  
  - type: rot
    start: 40
    end: 100
    angle: 90
    plane: 5                     # zw（4D 特有）
  
  # 第二阶段：效果变换
  - type: setSchleProjEnable     # 切换 4D 投影模式到施莱格尔投影
    at: 80
    enable: true
  
  - type: setCameraProjMethod    # 切换 3D 投影模式到透视投影
    at: 80
    projMethod: persp
  
  # 第三阶段：高亮
  - type: highlightCells
    at: 120
    highlightConfig:
      FF0000FF:
        nHedra: [4, 6]
        exclude: { ranges: [[10, 20]] }
      00FF00AA:
        indices: [30, 35, 40]
```

## JSON Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "4D/3D几何体录制配置文件",
  "description": "控制几何体动画录制过程的配置文件",
  "$defs": {
    "rangeItem": {
      "type": "array",
      "minItems": 2,
      "maxItems": 2,
      "items": [
        { "type": "integer", "minimum": 0 },
        { "type": "integer", "minimum": 0 }
      ],
      "additionalItems": false,
      "validRange": true
    },
    "nHedraItem": {
      "oneOf": [
        { "type": "integer", "minimum": 4 },
        {
          "type": "object",
          "properties": {
            "nFaces": { "type": "integer", "minimum": 4 },
            "ranges": { "type": "array", "items": { "$ref": "#/$defs/rangeItem" } }
          },
          "required": ["nFaces", "ranges"],
          "additionalProperties": false
        }
      ]
    },
    "highlightConfig": {
      "type": "object",
      "patternProperties": {
        "^[0-9a-fA-F]{8}$": {
          "oneOf": [
            { "type": "string", "const": "all" },
            {
              "type": "object",
              "properties": {
                "indices": { "type": "array", "items": { "type": "integer", "minimum": 0 } },
                "ranges": { "type": "array", "items": { "$ref": "#/$defs/rangeItem" } },
                "nHedra": { "type": "array", "items": { "$ref": "#/$defs/nHedraItem" } },
                "exclude": { "$ref": "#/$defs/excludeConfig" }
              },
              "additionalProperties": false
            }
          ]
        }
      },
      "additionalProperties": false
    },
    "excludeConfig": {
      "type": "object",
      "properties": {
        "indices": { "type": "array", "items": { "type": "integer", "minimum": 0 } },
        "ranges": { "type": "array", "items": { "$ref": "#/$defs/rangeItem" } },
        "nHedra": { "type": "array", "items": { "$ref": "#/$defs/nHedraItem" } }
      },
      "additionalProperties": false
    },
    "actionSchema": {
      "type": "object",
      "properties": {
        "type": { 
          "type": "string",
          "enum": [
            "rot", "trans4", "trans3", "setVerticesEdgesDim",
            "setProjDist", "setFaceOpacity", "setVisibility",
            "setCameraProjMethod", "setSchleProjEnable", "highlightCells"
          ]
        },
        "start": { "type": "integer", "minimum": 0 },
        "end": { "type": "integer", "minimum": 0 },
        "at": { "type": "integer", "minimum": 0 },
        "angle": { "type": "number" },
        "plane": { "type": "integer", "minimum": 0, "maximum": 5 },
        "ofs": { 
          "oneOf": [
            { "type": "array", "items": { "type": "number" }, "minItems": 3, "maxItems": 3 },
            { "type": "array", "items": { "type": "number" }, "minItems": 4, "maxItems": 4 }
          ]
        },
        "dimOfs": { "type": "number" },
        "projDistOfs": { "type": "number" },
        "faceOpacityOfs": { "type": "number", "minimum": 0, "maximum": 1 },
        "target": { "type": "string", "enum": ["faces", "wireframe", "vertices", "axes"] },
        "visibility": { "type": "boolean" },
        "projMethod": { "type": "string", "enum": ["persp", "ortho"] },
        "enable": { "type": "boolean" },
        "highlightConfig": { "$ref": "#/$defs/highlightConfig" },
        "hideFaces": { "type": "boolean" },
        "validFieldRange": true
      },
      "required": ["type"],
      "oneOf": [
        {
          "properties": {
            "type": { 
              "enum": [
                "rot", "trans4", "trans3", 
                "setVerticesEdgesDim", "setProjDist", "setFaceOpacity"
              ]
            },
            "required": ["start", "end"],
            "not": { "required": ["at"] }
          }
        },
        {
          "properties": {
            "type": { 
              "enum": [
                "setVisibility", "setCameraProjMethod",
                "setSchleProjEnable", "highlightCells"
              ]
            },
            "required": ["at"],
            "not": { "required": ["start", "end"] }
          }
        }
      ],
      "dependencies": {
        "plane": {
          "properties": {
            "type": { "const": "rot" }
          }
        },
        "ofs": {
          "properties": {
            "type": { "enum": ["trans4", "trans3"] }
          }
        },
        "dimOfs": {
          "properties": {
            "type": { "const": "setVerticesEdgesDim" }
          }
        },
        "projDistOfs": {
          "properties": {
            "type": { "const": "setProjDist" }
          }
        },
        "faceOpacityOfs": {
          "properties": {
            "type": { "const": "setFaceOpacity" }
          }
        },
        "target": {
          "properties": {
            "type": { "const": "setVisibility" }
          }
        },
        "visibility": {
          "properties": {
            "type": { "const": "setVisibility" }
          }
        },
        "projMethod": {
          "properties": {
            "type": { "const": "setCameraProjMethod" }
          }
        },
        "enable": {
          "properties": {
            "type": { "const": "setSchleProjEnable" }
          }
        },
        "highlightConfig": {
          "properties": {
            "type": { "const": "highlightCells" }
          }
        }
      }
    }
  },
  "type": "object",
  "properties": {
    "initialRot": {
      "type": "array",
      "items": { "type": "number" },
      "minItems": 6,
      "maxItems": 6,
      "description": "初始旋转角度(6个数字)"
    },
    "initialOfs": {
      "type": "array",
      "items": { "type": "number" },
      "minItems": 4,
      "maxItems": 4,
      "description": "4D初始偏移量"
    },
    "initialOfs3": {
      "type": "array",
      "items": { "type": "number" },
      "minItems": 3,
      "maxItems": 3,
      "description": "3D初始偏移量"
    },
    "initialVerticesEdgesDim": {
      "type": "number",
      "minimum": 0,
      "exclusiveMinimum": true,
      "description": "边和顶点初始尺寸"
    },
    "initialProjDist": {
      "type": "number",
      "minimum": 0,
      "exclusiveMinimum": true,
      "description": "4D投影距离"
    },
    "initialFaceOpacity": {
      "type": "number",
      "minimum": 0,
      "maximum": 1,
      "description": "初始面透明度"
    },
    "initialVisibilities": {
      "type": "object",
      "properties": {
        "faces": { "type": "boolean" },
        "wireframe": { "type": "boolean" },
        "vertices": { "type": "boolean" },
        "axes": { "type": "boolean" }
      },
      "additionalProperties": false,
      "description": "初始可见性设置"
    },
    "initialCameraProjMethod": {
      "type": "string",
      "enum": ["persp", "ortho"],
      "description": "初始相机投影方法"
    },
    "initialSchleProjEnable": {
      "type": "boolean",
      "description": "是否启用施莱格尔投影"
    },
    "initialHighlightConfig": {
      "$ref": "#/$defs/highlightConfig",
      "description": "初始胞高亮配置"
    },
    "endExtraFrames": {
      "type": "integer",
      "minimum": 0,
      "description": "末尾额外帧数"
    },
    "actions": {
      "type": "array",
      "items": { "$ref": "#/$defs/actionSchema" },
      "description": "动作序列"
    }
  },
  "additionalProperties": false,
  "if": {
    "is4D": true
  },
  "then": {
    "properties": {
      "initialOfs": false,
      "initialProjDist": false,
      "initialSchleProjEnable": false,
      "initialHighlightConfig": false,
      "actions": {
        "items": {
          "properties": {
            "type": {
              "not": { 
                "enum": ["trans4", "setProjDist", "setSchleProjEnable", "highlightCells"] 
              }
            },
            "plane": {
              "not": { "enum": [2, 4, 5] }
            }
          }
        }
      }
    }
  },
  "else": true
}
```