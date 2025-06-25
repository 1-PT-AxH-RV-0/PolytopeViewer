const transformCylinderPoint = `
vec3 transformCylinderPoint(vec3 point, vec3 v1, vec3 v2) {
    // Compute direction and length
    vec3 d = v2 - v1;
    float d_length = length(d);
    
    // If v1 and v2 are too close, return v1 (or discard)
    if (d_length < 1e-6) {
        return v1; // Or handle as error
    }
    vec3 d_normalized = d / d_length;

    // Step 1: Scale along y-axis
    vec3 scaled_point = point * vec3(1.0, d_length, 1.0);

    // Step 2: Rotate y-axis to d_normalized
    vec3 y_axis = vec3(0.0, 1.0, 0.0);
    float dot_product = dot(y_axis, d_normalized);
    
    // Handle parallel cases (dot_product ≈ ±1)
    if (abs(dot_product) > 0.99999) {
        if (dot_product < 0.0) {
            // Opposite direction: rotate 180° around x-axis
            scaled_point.y = -scaled_point.y; // Equivalent to 180° rotation
        }
        // Else: same direction, no rotation needed
    } else {
        // General case: compute rotation axis and angle
        vec3 rotation_axis = normalize(cross(d_normalized, y_axis));
        float rotation_angle = acos(clamp(dot_product, -1.0, 1.0));
        
        // Rodrigues' rotation formula
        float cos_angle = cos(rotation_angle);
        float sin_angle = sin(rotation_angle);
        
        mat3 K = mat3(
            0.0, -rotation_axis.z, rotation_axis.y,
            rotation_axis.z, 0.0, -rotation_axis.x,
            -rotation_axis.y, rotation_axis.x, 0.0
        );
        mat3 R = mat3(1.0) + sin_angle * K + (1.0 - cos_angle) * (K * K);
        scaled_point = R * scaled_point;
    }

    // Step 3: Translate to v1
    return scaled_point + v1;
}
`;

const schlegelProjection = `
uniform float projectionDistance;
vec3 schlegelProjection(vec4 point4D) {
  return projectionDistance * point4D.xyz / (projectionDistance - point4D.w);
}
`;

const create4DRotationMat = `
mat4 create4DRotationMat(float xy_deg, float xz_deg, float xw_deg, 
                         float yz_deg, float yw_deg, float zw_deg) {
    // 将角度转换为弧度
    float xy = radians(xy_deg);
    float xz = radians(xz_deg);
    float xw = radians(xw_deg);
    float yz = radians(yz_deg);
    float yw = radians(yw_deg);
    float zw = radians(zw_deg);
    
    // 计算各旋转角度的正弦和余弦
    float cxy = cos(xy), sxy = sin(xy);
    float cxz = cos(xz), sxz = sin(xz);
    float cxw = cos(xw), sxw = sin(xw);
    float cyz = cos(yz), syz = sin(yz);
    float cyw = cos(yw), syw = sin(yw);
    float czw = cos(zw), szw = sin(zw);
    
    // 初始化六个基本旋转矩阵
    mat4 Rxy = mat4(
        cxy, -sxy, 0.0, 0.0,
        sxy,  cxy, 0.0, 0.0,
        0.0,  0.0, 1.0, 0.0,
        0.0,  0.0, 0.0, 1.0
    );
    
    mat4 Rxz = mat4(
        cxz, 0.0, -sxz, 0.0,
        0.0, 1.0,  0.0, 0.0,
        sxz, 0.0,  cxz, 0.0,
        0.0, 0.0,  0.0, 1.0
    );
    
    mat4 Rxw = mat4(
        cxw, 0.0, 0.0, -sxw,
        0.0, 1.0, 0.0,  0.0,
        0.0, 0.0, 1.0,  0.0,
        sxw, 0.0, 0.0,  cxw
    );
    
    mat4 Ryz = mat4(
        1.0,  0.0, 0.0, 0.0,
        0.0,  cyz, -syz, 0.0,
        0.0,  syz,  cyz, 0.0,
        0.0,  0.0, 0.0, 1.0
    );
    
    mat4 Ryw = mat4(
        1.0, 0.0,  0.0, 0.0,
        0.0, cyw,  0.0, -syw,
        0.0, 0.0,  1.0, 0.0,
        0.0, syw,  0.0, cyw
    );
    
    mat4 Rzw = mat4(
        1.0, 0.0, 0.0,  0.0,
        0.0, 1.0, 0.0,  0.0,
        0.0, 0.0, czw, -szw,
        0.0, 0.0, szw,  czw
    );
    
    // 组合所有旋转（顺序会影响最终结果）
    return Rzw * Ryw * Ryz * Rxw * Rxz * Rxy;
}

mat4 create4DRotationMat(float rotation4D[6]) {
    return create4DRotationMat(rotation4D[0], rotation4D[1], rotation4D[2], 
                               rotation4D[3], rotation4D[4], rotation4D[5]);
}
`;

const rotationArrUni = 'uniform float rotation4D[6];';

export default {
  schlegelProjection,
  create4DRotationMat,
  transformCylinderPoint,
  rotationArrUni
};
