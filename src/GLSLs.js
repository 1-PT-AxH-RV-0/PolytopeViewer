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
vec3 schlegelProjection(vec4 point4D) {
  return 3.0 * point4D.xyz / (3.0 - point4D.w);
}
`

export default { schlegelProjection, transformCylinderPoint};