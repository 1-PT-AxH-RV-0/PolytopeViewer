const transformCylinderPoint = `
vec3 transformCylinderPoint(vec3 point, vec3 v1, vec3 v2) {
    // Compute the direction vector and its length
    vec3 d = v2 - v1;
    float d_length = length(d);
    
    // Handle the case where v1 and v2 are the same (invalid for a cylinder)
    if (d_length < 1e-6) {
        return v1; // or handle differently if needed
    }
    vec3 d_normalized = d / d_length;

    // Step 1: Scale along the y-axis (height) by d_length
    vec3 scaled_point = point * vec3(1.0, d_length, 1.0);

    // Step 2: Rotate the y-axis to align with d_normalized
    vec3 y_axis = vec3(0.0, 1.0, 0.0);
    
    // Compute the rotation axis (cross(d_normalized, y_axis) to ensure correct rotation direction)
    vec3 rotation_axis = cross(d_normalized, y_axis);
    
    // If y_axis and d_normalized are parallel, no rotation is needed
    if (length(rotation_axis) < 1e-6) {
        // Check if they are in the same or opposite direction
        if (dot(y_axis, d_normalized) < 0.0) {
            // Opposite direction: rotate by 180 degrees around any perpendicular axis
            rotation_axis = vec3(1.0, 0.0, 0.0); // Choose x-axis for simplicity
        } else {
            // Same direction: no rotation needed
            rotation_axis = vec3(0.0, 0.0, 0.0);
        }
    } else {
        rotation_axis = normalize(rotation_axis);
    }
    
    // Compute the rotation angle (always positive)
    float rotation_angle = acos(dot(y_axis, d_normalized));
    
    // Construct the rotation matrix using Rodrigues' rotation formula
    float cos_angle = cos(rotation_angle);
    float sin_angle = sin(rotation_angle);
    
    mat3 K = mat3(
        0.0, -rotation_axis.z, rotation_axis.y,
        rotation_axis.z, 0.0, -rotation_axis.x,
        -rotation_axis.y, rotation_axis.x, 0.0
    );
    
    mat3 I = mat3(1.0);
    mat3 R = I + sin_angle * K + (1.0 - cos_angle) * (K * K);
    
    // Apply rotation to the scaled point
    vec3 rotated_point = R * scaled_point;

    // Step 3: Translate to v1
    vec3 transformed_point = rotated_point + v1;

    return transformed_point;
}
`

const schlegelProjection = `
uniform float projectionDistance;
vec3 schlegelProjection(vec4 point4D) {
  return projectionDistance * point4D.xyz / (projectionDistance - point4D.w);
}
`

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
`

const rotationArrUni = 'uniform float rotation4D[6];'

export default { schlegelProjection, create4DRotationMat, transformCylinderPoint, rotationArrUni };