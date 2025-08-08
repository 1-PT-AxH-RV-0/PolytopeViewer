# highlightConfig 配置格式说明

## 高亮配置参数

`highlightConfig` 用于配置需要高亮显示的胞。它是一个 `object` 类型，格式如下：

| 参数名 | 类型   | 说明         | 约束条件                                          |
|--------|--------|--------------|---------------------------------------------------|
| 键     | number | 高亮的颜色   | 满足正则 `^[0-9a-fA-F]{8}$`，即 16 进制 RGBA 色码 |
| 值     | object | 胞选择器配置 | 见 [胞选择器配置格式](#胞选择器配置格式)          |

### 胞选择器配置格式

#### 特殊情况

可以直接为字符串 `"all"`，表示高亮所有胞。

#### 包含配置

| 参数名  | 类型                 | 说明                                                           | 约束条件                                                           |
|---------|----------------------|----------------------------------------------------------------|--------------------------------------------------------------------|
| indices | number[]             | 直接指定要选择的胞索引数组                                     | 数组元素必须为非负整数                                             |
| ranges  | [number, number][]   | 指定要选择的胞范围数组，每个范围是 [start, end) 的左闭右开区间 | start 和 end 必须为非负整数且 start ≤ end                          |
| nHedra  | (number \| object)[] | 根据面数选择胞，可以是数字或对象                               | 数字必须为正整数；对象必须符合 [nHedra 对象配置](#nHedra 对象配置) |

#### nHedra 对象配置

| 参数名 | 类型               | 说明               | 约束条件                 |
|--------|--------------------|--------------------|--------------------------|
| nFaces | number             | 胞的面数           | 必须为正整数             |
| ranges | [number, number][] | 要选择的胞范围数组 | 必须符合 ranges 约束条件 |

#### 排除配置 (exclude)

与 [包含配置](#包含配置) 相同，只是会排除已选中的胞。

### 胞选择器配置示例

#### 示例1：基本选择
```yaml
indices: [0, 2, 4]
ranges: [[10, 15]]
```
- 选择索引为 0、2、4 的胞
- 选择索引 `[10, 15)` 的胞（共 5 个）

#### 示例2：按面数选择
```yaml
nHedra:
  - 4
  - nFaces: 6
    ranges: [[0, 3]]
```
- 选择所有四面体胞
- 选择前 3 个六面体胞（索引 `[0, 2)`）

#### 示例3：组合选择并排除
```yaml
indices: [0, 5, 10]
ranges: [[20, 30]]
nHedra: [4, 6]
exclude:
  indices: [5, 25]
  ranges: [[22, 25]]
```
- 选择索引 0、5、10 的胞
- 选择索引 `[20, 30)` 的胞
- 选择所有四面体和六面体胞
- 排除索引 5 和 25 的胞
- 排除索引 `[22, 25)` 的胞

#### 示例4：复杂nHedra配置
```yaml
nHedra:
  - nFaces: 4
    ranges:
      - [0, 5]
      - [10, 15]
  - nFaces: 6
    ranges: [[3, 6]]
exclude:
  nHedra: [4]
```
- 选择第 `[0, 5)` 和第 `[10, 15)` 个四面体胞
- 选择第 `[3, 6)` 个六面体胞
- 排除所有四面体胞（注意这会覆盖前面的包含规则）

#### 示例5：全部
```yaml
all
```
- 直接选择全部胞

### 总配置示例
```yaml
FF0000FF:
  indices: [0, 2, 4]
  ranges: [[10, 15]]
00FF00FF:
  nHedra:
    - 4
    - nFaces: 6
      ranges: [[0, 3]]
0000FF77:
  indices: [0, 5, 10]
  ranges: [[20, 30]]
  nHedra: [4, 6]
  exclude:
    indices: [5, 25]
    ranges: [[22, 25]]
```
- [示例1](#示例1：基本选择) 中的胞为红色
- [示例2](#示例2：按面数选择) 中的胞为绿色
- [示例3](#示例3：组合选择并排除) 中的胞为半透明蓝色

## JSON Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "胞高亮配置。",
  "description": "配置需要高亮显示的胞。",
  "$defs": {
    "rangeItem": {
      "type": "array",
      "minItems": 2,
      "maxItems": 2,
      "items": [
        {
          "type": "integer",
          "minimum": 0,
          "description": "范围起始索引（包含）。"
        },
        {
          "type": "integer",
          "minimum": 0,
          "description": "范围结束索引（不包含）。"
        }
      ],
      "additionalItems": false,
      "validRange": true,
      "description": "范围 [start, end)。",
    },
    "nHedraItem": {
      "oneOf": [
        {
          "type": "integer",
          "minimum": 4,
          "description": "按面数选择胞。"
        },
        {
          "type": "object",
          "properties": {
            "nFaces": {
              "type": "integer",
              "minimum": 4,
              "description": "胞的面数。"
            },
            "ranges": {
              "type": "array",
              "items": { "$ref": "#/$defs/rangeItem" },
              "validRange": true,
              "description": "选取范围。"
            }
          },
          "required": ["nFaces", "ranges"],
          "additionalProperties": false,
          "description": "按面数和范围选择胞。"
        }
      ]
    },
    "excludeConfig": {
      "type": "object",
      "properties": {
        "indices": {
          "type": "array",
          "items": {
            "type": "integer",
            "minimum": 0
          }
        },
        "ranges": {
          "type": "array",
          "items": { "$ref": "#/$defs/rangeItem" }
        },
        "nHedra": {
          "type": "array",
          "items": { "$ref": "#/$defs/nHedraItem" }
        }
      },
      "additionalProperties": false,
      "description": "排除配置。"
    },
    "cellsSelectorConfig": {
      "oneOf": [
        {
          "type": "string",
          "const": "all",
          "description": "选择所有胞。"
        },
        {
          "type": "object",
          "properties": {
            "indices": {
              "type": "array",
              "items": {
                "type": "integer",
                "minimum": 0,
                "description": "胞索引。"
              },
              "description": "直接指定要选择的胞索引数组。"
            },
            "ranges": {
              "type": "array",
              "items": { "$ref": "#/$defs/rangeItem" },
              "description": "指定要选择的胞范围数组。"
            },
            "nHedra": {
              "type": "array",
              "items": { "$ref": "#/$defs/nHedraItem" },
              "description": "根据面数选择胞。"
            },
            "exclude": { "$ref": "#/$defs/excludeConfig" }
          },
          "additionalProperties": false,
          "description": "胞选择器配置对象。"
        }
      ]
    }
  },
  "type": "object",
  "patternProperties": {
    "^[0-9a-fA-F]{8}$": {
      "$ref": "#/$defs/cellsSelectorConfig"
    }
  },
  "additionalProperties": false,
  "description": "胞高亮配置对象。"
}
```