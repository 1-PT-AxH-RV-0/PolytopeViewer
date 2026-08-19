/**
 * 计算丸塔的中间圈顶点位置。
 * @param {number} d - 多边形步长
 * @param {number} n - 多边形边数
 * @param {number} rb - 底面半径
 * @param {number} rt - 顶面半径
 * @param {number} h - 高度
 * @returns {number[]} - 中间圈顶点位置
 */
export function equalPoint(d, n, rb, rt, h) {
  const x0 = (Math.PI * d) / n;
  const x1 = (5 * x0) / 2;
  const x2 = Math.sin(x1);
  const x3 = (9 * x0) / 2;
  const x4 = Math.cos(x3);
  const x5 = x2 * x4;
  const x6 = Math.sin(x3);
  const x7 = Math.cos(x1);
  const x8 = x6 * x7;
  const x9 = 2 * n;
  const x10 = x0 * ((1 % x9) + 0.5);
  const x11 = Math.cos(x10);
  const x12 = x11 * x6;
  const x13 = x0 * ((3 % x9) + 0.5);
  const x14 = Math.sin(x13);
  const x15 = x14 * x7;
  const x16 = Math.cos(x13);
  const x17 = x16 * x2;
  const x18 = Math.sin(x10);
  const x19 = x18 * x4;
  const x20 = x16 * x18;
  const x21 = x11 * x14;
  const x22 = 1 / (x12 + x15 - x17 - x19 + x20 - x21 + x5 - x8);
  const x23 = rb * x16;
  const x24 = x23 * x8;
  const x25 = rb * x7;
  const x26 = x19 * x25;
  const x27 = rb * x11;
  const x28 = x27 * x5;
  const x29 = rb * x4;
  const x30 = x15 * x29;
  const x31 = x17 * x27;
  const x32 = x21 * x29;
  const x33 = x12 * x23;
  const x34 = x20 * x25;
  const x35 = rb * x11 - x25;
  const x36 = rb * x6;
  const x37 = 4 * x0;
  const x38 = Math.sin(x37);
  const x39 = rt * x38;
  const x40 = -x39;
  const x41 = Math.cos(x37);
  const x42 = rt * x41;
  const x43 = -x42;
  const x44 = rb * x14;
  const x45 = -(x23 + x43) * (x36 + x40) + (x29 + x43) * (x40 + x44);
  const x46 = rb * x16 - x29;
  const x47 = rb * x2;
  const x48 = 2 * x0;
  const x49 = Math.sin(x48);
  const x50 = rt * x49;
  const x51 = -x50;
  const x52 = Math.cos(x48);
  const x53 = rt * x52;
  const x54 = -x53;
  const x55 = rb * x18;
  const x56 = (x25 + x54) * (x51 + x55) - (x27 + x54) * (x47 + x51);
  const x57 = rb ** 2;
  const x58 = x7 ** 2;
  const x59 = x57 * x58;
  const x60 = x14 * x4;
  const x61 = x59 * x60;
  const x62 = x2 ** 2;
  const x63 = x57 * x62;
  const x64 = x60 * x63;
  const x65 = x16 * x6;
  const x66 = x59 * x65;
  const x67 = x63 * x65;
  const x68 = x36 * x42;
  const x69 = x29 * x58;
  const x70 = x23 * x39;
  const x71 = x53 * x62;
  const x72 = x57 * x7;
  const x73 = x11 * x72;
  const x74 = x5 * x73;
  const x75 = x12 * x16 * x72;
  const x76 = x2 * x57;
  const x77 = x18 * x76;
  const x78 = x15 * x77;
  const x79 = x20 * x6 * x76;
  const x80 = rt ** 2;
  const x81 = x52 * x80;
  const x82 = x41 * x81;
  const x83 = x7 * x81;
  const x84 = x4 * x83;
  const x85 = x16 * x83;
  const x86 = x11 * x81;
  const x87 = x4 * x86;
  const x88 = x16 * x86;
  const x89 = x49 * x81;
  const x90 = x2 * x6;
  const x91 = x14 * x18;
  const x92 = x14 * x2;
  const x93 = x49 * x80;
  const x94 = x41 * x93;
  const x95 = x18 * x6;
  const x96 = x38 * x93;
  const x97 = x42 * x44;
  const x98 = x23 * x50;
  const x99 = x29 * x39;
  const x100 = x11 * x15 * x4 * x57;
  const x101 = x17 * x73;
  const x102 = x77 * x8;
  const x103 = x5 * x57 * x91;
  const x104 = x25 * x53;
  const x105 = x24 * x53;
  const x106 = x32 * x53;
  const x107 = x31 * x53;
  const x108 = x53 * x55;
  const x109 = x42 * x55;
  const x110 = x11 * x7;
  const x111 = x47 * x50;
  const x112 = x55 * x8;
  const x113 = x112 * x50;
  const x114 = x19 * x44;
  const x115 = x114 * x50;
  const x116 = x17 * x36;
  const x117 = x116 * x50;
  const x118 = x30 * x53;
  const x119 = x28 * x53;
  const x120 = x33 * x53;
  const x121 = x15 * x55;
  const x122 = x121 * x50;
  const x123 = x44 * x5;
  const x124 = x123 * x50;
  const x125 = x20 * x36;
  const x126 = x125 * x50;
  const x127 = h ** 2;
  const x128 = x52 ** 2 * x80;
  const x129 = x49 ** 2 * x80;
  const x130 = 2 * x53;
  const x131 = x12 * x47;
  const x132 = 2 * x50;
  const x133 = x21 * x47;
  const x134 =
    x12 * x127 +
    x12 * x129 +
    x12 * x63 +
    x127 * x15 -
    x127 * x17 -
    x127 * x19 +
    x127 * x20 -
    x127 * x21 +
    x127 * x5 -
    x127 * x8 -
    x128 * x17 -
    x128 * x19 +
    x128 * x20 +
    x128 * x5 +
    x129 * x15 -
    x129 * x21 -
    x129 * x8 +
    x130 * x26 -
    x130 * x34 -
    x131 * x132 +
    x132 * x133 -
    x19 * x59 +
    x20 * x59 -
    x21 * x63;
  const x135 = x57 * x7 ** 3;
  const x136 = x2 ** 3 * x57;
  const x137 =
    (-2 * x100 -
      2 * x101 -
      2 * x102 -
      2 * x103 +
      2 * x105 +
      2 * x106 +
      2 * x107 +
      2 * x113 +
      2 * x115 +
      2 * x117 -
      2 * x118 -
      2 * x119 +
      x12 * x128 -
      x12 * x59 -
      2 * x120 -
      2 * x122 -
      2 * x124 -
      2 * x126 +
      x128 * x15 -
      x128 * x21 -
      x128 * x8 -
      x129 * x17 -
      x129 * x19 +
      x129 * x20 +
      x129 * x5 +
      x134 -
      x135 * x14 +
      x135 * x6 +
      x136 * x16 -
      x136 * x4 -
      x15 * x63 +
      x17 * x59 +
      x19 * x63 -
      x20 * x63 +
      x21 * x59 -
      x5 * x59 +
      2 * x61 +
      x63 * x8 +
      2 * x64 -
      2 * x66 -
      2 * x67 +
      2 * x74 +
      2 * x75 +
      2 * x78 +
      2 * x79) /
    (2 *
      x57 *
      (-x100 -
        x101 -
        x102 -
        x103 +
        x104 * x17 -
        x104 * x5 +
        x105 +
        x106 +
        x107 +
        x108 * x90 -
        x108 * x92 -
        x109 * x90 +
        x109 * x92 -
        x110 * x29 * x50 -
        x110 * x70 +
        x110 * x98 +
        x110 * x99 -
        x111 * x15 +
        x111 * x8 +
        x113 +
        x115 +
        x117 -
        x118 -
        x119 -
        x12 * x25 * x42 +
        x12 * x82 -
        x120 -
        x122 -
        x124 -
        x126 +
        x134 +
        x15 * x27 * x42 +
        x15 * x82 -
        x17 * x96 -
        x19 * x96 -
        x20 * x39 * x47 +
        x20 * x96 -
        x21 * x82 -
        x36 * x71 +
        x38 * x84 -
        x38 * x85 -
        x38 * x87 +
        x38 * x88 +
        x39 * x5 * x55 -
        x39 * x69 +
        x44 * x71 -
        x49 * x84 +
        x49 * x85 +
        x49 * x87 -
        x49 * x88 +
        x5 * x96 +
        x50 * x69 +
        x58 * x68 +
        x58 * x70 -
        x58 * x97 -
        x58 * x98 +
        x61 +
        x62 * x68 +
        x62 * x70 -
        x62 * x97 -
        x62 * x99 +
        x64 -
        x66 -
        x67 +
        x74 +
        x75 +
        x78 +
        x79 -
        x8 * x82 +
        x89 * x90 +
        x89 * x91 -
        x89 * x92 -
        x89 * x95 -
        x90 * x94 -
        x91 * x94 +
        x92 * x94 +
        x94 * x95));
  const x138 = rb * x18 - x47;
  const x139 = rb * x14 - x36;

  // 计算结果矩阵
  const result0 =
    x22 *
    (x137 * (-x35 * x45 + x46 * x56) +
      x24 +
      x26 -
      x28 -
      x30 +
      x31 +
      x32 -
      x33 -
      x34);
  const result1 = h * x137 * x22 * (x138 * x46 - x139 * x35);
  const result2 =
    x22 *
    (x112 +
      x114 +
      x116 -
      x121 -
      x123 -
      x125 -
      x131 +
      x133 +
      x137 * (-x138 * x45 + x139 * x56));

  return [result0, result1, result2];
}
