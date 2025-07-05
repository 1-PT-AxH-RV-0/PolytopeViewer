const transformCylinderPoint = `
vec3 transformCylinderPoint(vec3 point, vec3 v1, vec3 v2) {
    // Compute direction and length
    vec3 d = v2 - v1;
    float d_length = length(d);
    
    vec3 d_ = d;
    d_.y = 0.0;
    if (length(d_) < 1e-6) {
      vec3 scaled_point = point * vec3(1.0, d_length, 1.0);
      if (v2.y > v1.y) return scaled_point + v1;
      if (v2.y < v1.y) return scaled_point + v2;
    }
    
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
vec3 schlegelProjection(vec4 point4D) {
  if (isOrtho) return point4D.xyz;
  return projectionDistance * point4D.xyz / (projectionDistance - point4D.w);
}
`;

export default {
  schlegelProjection,
  transformCylinderPoint
};
