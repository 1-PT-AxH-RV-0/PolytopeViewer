const getCylinderTransform = `
mat4 getCylinderTransform(vec3 v1, vec3 v2, float radius) {
    vec3 d = v2 - v1;
    float d_length = length(d);
    
    // 如果两端点重合，返回将任意点映射到 v1 的矩阵（线性部分为零）
    if (d_length < 1e-6) {
        return mat4(vec4(0.0), vec4(0.0), vec4(0.0), vec4(v1, 1.0));
    }
    
    // 检查 d 是否几乎平行于 y 轴（水平分量为零）
    vec3 d_horiz = d;
    d_horiz.y = 0.0;
    if (length(d_horiz) < 1e-6) {
        // 平行情况：先移至原点，再缩放，最后平移
        mat4 S = mat4(1.0);
        S[1][1] = d_length;
        S[0][0] = radius;
        S[2][2] = radius;
        
        // 若v2在下，则绕z轴转180度
        mat4 R = mat4(1.0);
        R[0][0] = (v2.y > v1.y) ? 1.0 : -1.0;
        R[1][1] = (v2.y > v1.y) ? 1.0 : -1.0;
        
        // 平移到v1
        mat4 T = mat4(1.0);
        T[3] = vec4(v1, 1.0);

        // 移至原点
        mat4 T2 = mat4(1.0);
        T2[3] = vec4(0.0, 0.5, 0.0, 1.0);
        
        return T * R * S * T2;
    }
    
    // 一般情况：计算从 y 轴到 d 方向的旋转
    vec3 d_norm = normalize(d);
    vec3 y_axis = vec3(0.0, 1.0, 0.0);
    float dot_prod = dot(y_axis, d_norm);
    
    mat4 R; // 旋转矩阵（4x4）
    
    // 处理接近平行的情况，避免数值不稳定
    if (abs(dot_prod) > 0.99999) {
        if (dot_prod < 0.0) {
            // 方向相反：绕 x 轴旋转 180°
            R = mat4(1.0);
            R[1][1] = -1.0;
            R[2][2] = -1.0;
        } else {
            // 方向相同：单位矩阵
            R = mat4(1.0);
        }
    } else {
        // 使用罗德里格斯旋转公式构造 3x3 旋转矩阵
        vec3 axis = normalize(cross(d_norm, y_axis));
        float angle = acos(clamp(dot_prod, -1.0, 1.0));
        float c = cos(angle);
        float s = sin(angle);
        
        mat3 K = mat3(
            0.0, -axis.z, axis.y,
            axis.z, 0.0, -axis.x,
            -axis.y, axis.x, 0.0
        );
        mat3 R3 = mat3(1.0) + s * K + (1.0 - c) * (K * K);
        
        // 扩展为 4x4 矩阵
        R = mat4(vec4(R3[0], 0.0),
                 vec4(R3[1], 0.0),
                 vec4(R3[2], 0.0),
                 vec4(0.0, 0.0, 0.0, 1.0));
    }
    
    // 缩放矩阵（沿 y 轴缩放 d_length，xz轴缩放radius）
    mat4 S = mat4(1.0);
    S[1][1] = d_length;
    S[0][0] = radius;
    S[2][2] = radius;
    
    // 平移矩阵（一般情况平移至 v1）
    mat4 T = mat4(1.0);
    T[3] = vec4(v1, 1.0);
    
    // 平移矩阵2（平移中心至原点）
    mat4 T2 = mat4(1.0);
    T2[3] = vec4(0.0, 0.5, 0.0, 1.0);
    
    // 组合变换：先移至原点，再缩放，再旋转，最后平移
    return T * R * S * T2;
}
`;

const schlegelProjection = `
vec3 schlegelProjection(vec4 point4D) {
  if (isOrtho) return point4D.xyz;
  return projectionDistance * point4D.xyz / (projectionDistance - point4D.w);
}
`;

export default {
  schlegelProjection,
  getCylinderTransform
};
