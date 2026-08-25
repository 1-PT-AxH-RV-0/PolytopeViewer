/**
 * 验证单个 highlightConfig 配置对象。
 * @param {object | string} config - 要验证的单个 highlightConfig 对象。
 * @param {string} prefix - 错误提示的前缀。
 * @throws {Error} - 当配置无效时抛出错误。
 */
export function validateCellsSelectorConfig(config, prefix = '') {
  if (config === 'all') return;
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error(`${prefix} 必须是非数组的对象类型或为字符串 "all"。`);
  }

  const validKeys = ['indices', 'ranges', 'nHedra'];
  const hasValidConfig = validKeys.some(
    key =>
      config[key] !== undefined &&
      (Array.isArray(config[key]) ||
        (typeof config[key] === 'object' && !Array.isArray(config[key])))
  );

  if (!hasValidConfig && !config.exclude) {
    throw new Error(
      `${prefix} 必须包含至少一个有效配置项（indices/ranges/nHedra）或 exclude 配置。`
    );
  }

  const validateInclusion = (conf, prefix = '') => {
    if (conf.indices !== undefined) {
      if (!Array.isArray(conf.indices)) {
        throw new Error(`${prefix}indices 必须是数组类型。`);
      }
      conf.indices.forEach((num, i) => {
        if (!Number.isInteger(num) || num < 0) {
          throw new Error(
            `${prefix}indices[${i}] 必须是非负整数，当前值为 ${num}。`
          );
        }
      });
    }

    if (conf.ranges !== undefined) {
      if (!Array.isArray(conf.ranges)) {
        throw new Error(`${prefix}ranges 必须是二维数组类型。`);
      }
      conf.ranges.forEach((range, i) => {
        if (!Array.isArray(range) || range.length !== 2) {
          throw new Error(
            `${prefix}ranges[${i}] 必须是 [start, end] 格式的数组。`
          );
        }
        const [start, end] = range;
        if (!Number.isInteger(start) || start < 0) {
          throw new Error(
            `${prefix}ranges[${i}][0]（start）必须是非负整数，当前值为 ${start}。`
          );
        }
        if (!Number.isInteger(end) || end < 0) {
          throw new Error(
            `${prefix}ranges[${i}][1]（end）必须是非负整数，当前值为 ${end}。`
          );
        }
        if (start > end) {
          throw new Error(
            `${prefix}ranges[${i}] 的 start 值 ${start} 不能大于 end 值 ${end}。`
          );
        }
      });
    }

    if (conf.nHedra !== undefined) {
      if (!Array.isArray(conf.nHedra)) {
        throw new Error(`${prefix}nHedra 必须是数组类型。`);
      }
      conf.nHedra.forEach((item, i) => {
        if (typeof item === 'number') {
          if (!Number.isInteger(item) || item <= 0) {
            throw new Error(
              `${prefix}nHedra[${i}] 作为数字时必须为正整数，当前值为 ${item}。`
            );
          }
        } else if (typeof item === 'object' && item !== null) {
          if (!Number.isInteger(item.nFaces) || item.nFaces <= 0) {
            throw new Error(
              `${prefix}nHedra[${i}].nFaces 必须为正整数，当前值为 ${item.nFaces}。`
            );
          }
          if (!item.ranges) {
            throw new Error(`${prefix}nHedra[${i}].ranges 是必填项。`);
          }
          if (!Array.isArray(item.ranges)) {
            throw new Error(
              `${prefix}nHedra[${i}].ranges 必须是二维数组类型。`
            );
          }
          validateInclusion({ ranges: item.ranges }, `${prefix}nHedra[${i}].`);
        } else {
          throw new Error(`${prefix}nHedra[${i}] 必须是数字或配置对象。`);
        }
      });
    }
  };

  validateInclusion(config, prefix);

  if (config.exclude) {
    if (typeof config.exclude !== 'object' || Array.isArray(config.exclude)) {
      throw new Error('exclude 配置必须是对象类型。');
    }
    validateInclusion(config.exclude, prefix + 'exclude.');
  }
}

/**
 * 校验录制配置对象中的有效性。
 * @param {object} config - 要验证的配置对象。
 * @param {boolean} is4D - 是否为 4D 模式。
 * @param {Map} interpFuncMap - 插值函数映射表。
 * @throws {Error} 当任何字段验证失败时抛出错误，包含具体的错误信息。
 */
export function validateRecordConfig(config, is4D, interpFuncMap) {
  if (
    Object.hasOwnProperty.call(config, 'framerate') &&
    (!Number.isInteger(config.framerate) || !config.framerate > 0)
  ) {
    throw new Error('framerate 字段必须是正整数。');
  }
  if (
    Object.hasOwnProperty.call(config, 'ssaaUsed') &&
    (!Number.isInteger(config.ssaaUsed) || !config.ssaaUsed > 0)
  ) {
    throw new Error('ssaaUsed 字段必须是正整数。');
  }
  if (
    Object.hasOwnProperty.call(config, 'bloomUsed') &&
    typeof config.bloomUsed !== 'boolean'
  ) {
    throw new Error('bloomUsed 字段必须是布尔值。');
  }

  if (config.initialRot !== undefined) {
    if (
      !Array.isArray(config.initialRot) ||
      config.initialRot.length !== 6 ||
      config.initialRot.some(v => typeof v !== 'number')
    ) {
      throw new Error('initialRot 字段必须是包含 6 个实数的数组。');
    }
    if (
      (config.initialRot[2] !== 0 ||
        config.initialRot[4] !== 0 ||
        config.initialRot[5] !== 0) &&
      !is4D
    )
      throw new Error(
        'initialRot 字段的索引 2、4、5 上的值在非 4D 模式下必须为 0。'
      );
  }

  if (config.initialOfs !== undefined) {
    if (!is4D) throw new Error('initialOfs 字段的只在 4D 模式下可用。');
    if (
      !Array.isArray(config.initialOfs) ||
      config.initialOfs.length !== 4 ||
      config.initialOfs.some(v => typeof v !== 'number')
    ) {
      throw new Error('initialOfs 字段必须是包含 4 个实数的数组。');
    }
  }

  if (config.initialOfs3 !== undefined) {
    if (
      !Array.isArray(config.initialOfs3) ||
      config.initialOfs3.length !== 3 ||
      config.initialOfs3.some(v => typeof v !== 'number')
    ) {
      throw new Error('initialOfs3 字段必须是包含 3 个实数的数组。');
    }
  }

  if (config.initialVerticesEdgesDim !== undefined) {
    if (
      typeof config.initialVerticesEdgesDim !== 'number' ||
      config.initialVerticesEdgesDim <= 0
    ) {
      throw new Error('initialVerticesEdgesDim 字段必须是正实数。');
    }
  }

  if (config.initialProjDist !== undefined) {
    if (!is4D) throw new Error('initialProjDist 字段的只在 4D 模式下可用。');
    if (
      typeof config.initialProjDist !== 'number' ||
      config.initialProjDist <= 0
    ) {
      throw new Error('initialProjDist 字段必须是正实数。');
    }
  }

  if (config.initialSeparationDist !== undefined) {
    if (is4D)
      throw new Error('initialSeparationDist 字段的只在 3D 模式下可用。');
    if (typeof config.initialSeparationDist !== 'number') {
      throw new Error('initialSeparationDist 字段必须是实数。');
    }
  }

  if (config.initialFaceScale !== undefined) {
    if (is4D) throw new Error('initialFaceScale 字段的只在 3D 模式下可用。');
    if (typeof config.initialFaceScale !== 'number') {
      throw new Error('initialFaceScale 字段必须是实数。');
    }
  }

  if (config.initialEdgeScale !== undefined) {
    if (is4D) throw new Error('initialEdgeScale 字段的只在 3D 模式下可用。');
    if (typeof config.initialEdgeScale !== 'number') {
      throw new Error('initialEdgeScale 字段必须是实数。');
    }
  }

  if (config.initialFaceOpacity !== undefined) {
    if (
      typeof config.initialFaceOpacity !== 'number' ||
      config.initialFaceOpacity < 0 ||
      config.initialFaceOpacity > 1
    ) {
      throw new Error('initialFaceOpacity 字段必须是 0~1 之间的实数。');
    }
  }

  if (config.initialVisibilities !== undefined) {
    const validTargets = ['faces', 'wireframe', 'vertices', 'axes'];
    for (const [target, value] of Object.entries(config.initialVisibilities)) {
      if (!validTargets.includes(target)) {
        throw new Error(
          `initialVisibilities 字段包含无效的目标类型: ${target}。`
        );
      }
      if (typeof value !== 'boolean') {
        throw new Error(`initialVisibilities.${target} 字段必须为布尔值。`);
      }
    }
  }

  if (
    config.initialCameraProjMethod !== undefined &&
    !['persp', 'ortho'].includes(config.initialCameraProjMethod)
  ) {
    throw new Error('initialCameraProjMethod 字段必须为 "persp" 或 "ortho"。');
  }

  if (config.initialSchleProjEnable !== undefined) {
    if (!is4D)
      throw new Error('initialSchleProjEnable 字段的只在 4D 模式下可用。');
    if (typeof config.initialSchleProjEnable !== 'boolean')
      throw new Error('initialSchleProjEnable 字段必须为布尔值。');
  }

  if (config.initialHighlightConfig !== undefined) {
    if (!is4D)
      throw new Error('initialHighlightConfig 字段的只在 4D 模式下可用。');
    for (const [color, cellsSelectorConfig] of Object.entries(
      config.initialHighlightConfig
    )) {
      if (!/^(0x)?[0-9a-fA-F]{8}$/.test(color))
        throw new Error(
          `initialHighlightConfig 的十六进制 RGBA 色码 ${color} 无效。`
        );
      validateCellsSelectorConfig(
        cellsSelectorConfig,
        `initialHighlightConfig.${color}.`
      );
    }
  }

  if (config.initialHighlightFacesConfig !== undefined) {
    if (is4D)
      throw new Error('initialHighlightFacesConfig 字段的只在 3D 模式下可用。');
    for (const [color] of Object.entries(config.initialHighlightFacesConfig)) {
      if (!/^(0x)?[0-9a-fA-F]{8}$/.test(color))
        throw new Error(
          `initialHighlightFacesConfig 的十六进制 RGBA 色码 ${color} 无效。`
        );
    }
  }

  if (config.initialScaleFactor !== undefined) {
    if (
      typeof config.initialScaleFactor !== 'number' ||
      config.initialScaleFactor <= 0
    ) {
      throw new Error('initialScaleFactor 字段必须是正实数。');
    }
  }

  if (config.initialCameraLookAt !== undefined) {
    if (
      !Array.isArray(config.initialCameraLookAt) ||
      config.initialCameraLookAt.length !== 3 ||
      config.initialCameraLookAt.some(v => typeof v !== 'number')
    ) {
      throw new Error('initialCameraLookAt 字段必须是包含 3 个实数的数组。');
    }
  }

  if (config.initialCameraDistance !== undefined) {
    if (
      typeof config.initialCameraDistance !== 'number' ||
      config.initialCameraDistance <= 0
    ) {
      throw new Error('initialCameraDistance 字段必须是正实数。');
    }
  }

  if (config.initialCameraRotation !== undefined) {
    if (
      !Array.isArray(config.initialCameraRotation) ||
      config.initialCameraRotation.length !== 3 ||
      config.initialCameraRotation.some(v => typeof v !== 'number')
    ) {
      throw new Error('initialCameraRotation 字段必须是包含 3 个实数的数组。');
    }
  }

  if (
    !Array.isArray(config.actions) ||
    config.actions.some(i => !(i instanceof Object))
  ) {
    throw new Error('action 字段必须为对象列表。');
  }

  config.actions.forEach((action, index) => {
    switch (action.type) {
      case 'rot':
        if (typeof action.angle !== 'number')
          throw new Error(`actions[${index}] 操作的 angle 字段必须为实数。`);
        if (!(
          Number.isInteger(action.plane) &&
          0 <= action.plane &&
          action.plane <= 5
        ))
          throw new Error(
            `actions[${index}] 操作的 plane 字段必须为大于等于零小于六的整数。`
          );
        if (!is4D && [2, 4, 5].includes(action.plane))
          throw new Error(
            `actions[${index}] 操作的 plane 字段值 ${action.plane} 只在四维模式可用。`
          );
        break;
      case 'trans4':
        if (!is4D) throw new Error(`actions[${index}] 操作只在四维模式可用。`);
        if (
          action.ofs.length !== 4 ||
          action.ofs.some(v => typeof v !== 'number')
        )
          throw new Error(
            `actions[${index}] 操作的 ofs 字段必须为四个实数的数组。`
          );
        break;
      case 'trans3':
        if (
          action.ofs.length !== 3 ||
          action.ofs.some(v => typeof v !== 'number')
        )
          throw new Error(
            `actions[${index}] 操作的 ofs 字段必须为三个实数的数组。`
          );
        break;
      case 'setVerticesEdgesDim':
        if (typeof action.dimOfs !== 'number')
          throw new Error(`actions[${index}] 操作的 dimOfs 字段必须为实数。`);
        break;
      case 'setProjDist':
        if (!is4D) throw new Error(`actions[${index}] 操作只在四维模式可用。`);
        if (typeof action.projDistOfs !== 'number')
          throw new Error(
            `actions[${index}] 操作的 projDistOfs 字段必须为实数。`
          );
        break;
      case 'setSeparationDist':
        if (is4D) throw new Error(`actions[${index}] 操作只在三维模式可用。`);
        if (typeof action.sepDistOfs !== 'number')
          throw new Error(
            `actions[${index}] 操作的 sepDistOfs 字段必须为实数。`
          );
        break;
      case 'setFaceScale':
        if (is4D) throw new Error(`actions[${index}] 操作只在三维模式可用。`);
        if (typeof action.faceScaleOfs !== 'number')
          throw new Error(
            `actions[${index}] 操作的 faceScaleOfs 字段必须为实数。`
          );
        break;
      case 'setEdgeScale':
        if (is4D) throw new Error(`actions[${index}] 操作只在三维模式可用。`);
        if (typeof action.edgeScaleOfs !== 'number')
          throw new Error(
            `actions[${index}] 操作的 edgeScaleOfs 字段必须为实数。`
          );
        break;
      case 'setFaceOpacity':
        if (typeof action.faceOpacityOfs !== 'number')
          throw new Error(
            `actions[${index}] 操作的 faceOpacityOfs 字段必须为实数。`
          );
        break;
      case 'setVisibility':
        if (!['faces', 'wireframe', 'vertices', 'axes'].includes(action.target))
          throw new Error(
            `actions[${index}] 操作的 target 字段值必须为 faces、wireframe、vertices 或 axes 中的一者。`
          );
        if (typeof action.visibility !== 'boolean')
          throw new Error(
            `actions[${index}] 操作的 visibility 字段值必须为 boolean 类型。`
          );
        break;
      case 'setCameraProjMethod':
        if (action.projMethod !== 'persp' && action.projMethod !== 'ortho')
          throw new Error(
            `actions[${index}] 操作的 projMethod 字段值必须为 persp 或 ortho 中的一者。`
          );
        break;
      case 'setSchleProjEnable':
        if (!is4D) throw new Error(`actions[${index}] 操作只在四维模式可用。`);
        if (typeof action.enable !== 'boolean')
          throw new Error(
            `actions[${index}] 操作的 enable 字段值必须为 boolean 类型。`
          );
        break;
      case 'highlightCells':
        if (!is4D) throw new Error(`actions[${index}] 操作只在四维模式可用。`);

        for (const [color, cellsSelectorConfig] of Object.entries(
          action.highlightConfig
        )) {
          if (!/^(0x)?[0-9a-fA-F]{8}$/.test(color))
            throw new Error(
              `actions[${index}].highlightConfig 的十六进制 RGBA 色码 ${color} 无效。`
            );
          validateCellsSelectorConfig(
            cellsSelectorConfig,
            `actions[${index}].highlightConfig.${color}.`
          );
        }
        break;
      case 'highlightFaces':
        if (is4D) throw new Error(`actions[${index}] 操作只在三维模式可用。`);

        for (const [color] of Object.entries(action.highlightConfig)) {
          if (!/^(0x)?[0-9a-fA-F]{8}$/.test(color))
            throw new Error(
              `actions[${index}].highlightConfig 的十六进制 RGBA 色码 ${color} 无效。`
            );
        }
        break;
      case 'setScaleFactor':
        if (typeof action.scaleFactorOfs !== 'number')
          throw new Error(
            `actions[${index}] 操作的 scaleFactorOfs 字段必须为实数。`
          );
        break;
      case 'setCameraLookAt':
        if (
          action.lookAtOfs.length !== 3 ||
          action.lookAtOfs.some(v => typeof v !== 'number')
        )
          throw new Error(
            `actions[${index}] 操作的 lookAtOfs 字段必须为三个实数的数组。`
          );
        break;
      case 'setCameraDistance':
        if (typeof action.distanceOfs !== 'number')
          throw new Error(
            `actions[${index}] 操作的 distanceOfs 字段必须为实数。`
          );
        break;
      case 'setCameraRotation':
        if (typeof action.angle !== 'number')
          throw new Error(`actions[${index}] 操作的 angle 字段必须为实数。`);
        if (!(
          Number.isInteger(action.axis) &&
          0 <= action.axis &&
          action.axis <= 2
        ))
          throw new Error(
            `actions[${index}] 操作的 axis 字段必须为大于等于零小于三的整数（0表示x轴，1表示y轴，2表示z轴）。`
          );
        break;
      default:
        throw new Error(`actions[${index}] 操作的类型 ${action.type} 无效。`);
    }

    if (
      Object.hasOwnProperty.call(action, 'priority') &&
      (typeof action.priority !== 'number' ||
        !Number.isInteger(action.priority))
    ) {
      throw new Error(`actions[${index}] 的 priority 不是整数。`);
    }

    if (
      Object.hasOwnProperty.call(action, 'start') &&
      Object.hasOwnProperty.call(action, 'end') &&
      Object.hasOwnProperty.call(action, 'at')
    ) {
      throw new Error(
        `actions[${index}] 要么同时拥有 start 和 end 字段，要么只拥有 at 字段。`
      );
    } else if (
      Object.hasOwnProperty.call(action, 'start') &&
      Object.hasOwnProperty.call(action, 'end')
    ) {
      if (
        [
          'setVisibility',
          'setCameraProjMethod',
          'setSchleProjEnable',
          'highlightCells',
          'highlightFaces'
        ].includes(action.type)
      ) {
        throw new Error(
          `actions[${index}] 的 start 和 end 字段值只适用于以下类型的操作：rot、trans4、trans3、setVerticesEdgesDim、setProjDist、setSeparationDist、setFaceScale, setEdgeScale、setFaceOpacity、setScaleFactor、setCameraLookAt、setCameraDistance、setCameraRotation。`
        );
      }
      if (
        !Number.isInteger(action.start) ||
        !Number.isInteger(action.end) ||
        action.end < action.start ||
        action.start < 0 ||
        action.end < 0
      ) {
        throw new Error(
          `actions[${index}] 的 start 和 end 字段必须均为大于等于 0 的整数，且 end 大于等于 start。`
        );
      }
      if (
        Object.hasOwnProperty.call(action, 'interp') &&
        !interpFuncMap.has(action.interp)
      ) {
        throw new Error(
          `actions[${index}] 的 interp 字段必须为以下之一：${[...interpFuncMap.keys()].join('、')}。`
        );
      }
    } else if (Object.hasOwnProperty.call(action, 'at')) {
      if (
        ![
          'setVisibility',
          'setCameraProjMethod',
          'setSchleProjEnable',
          'highlightCells',
          'highlightFaces'
        ].includes(action.type)
      ) {
        throw new Error(
          `actions[${index}] 的 at 字段值只适用于以下类型的操作：setVisibility、setCameraProjMethod、setSchleProjEnable、highlightCells, highlightFaces。`
        );
      }
      if (!Number.isInteger(action.at) || action.at < 0)
        throw new Error(
          `actions[${index}] 的 at 字段必须为大于等于 0 的整数。`
        );
      if (Object.hasOwnProperty.call(action, 'interp'))
        throw new Error(`actions[${index}] 为瞬时操，不能用interp字段。`);
    } else {
      throw new Error(
        `actions[${index}] 要么同时拥有 start 和 end 字段，要么只拥有 at 字段。`
      );
    }
  });
}
