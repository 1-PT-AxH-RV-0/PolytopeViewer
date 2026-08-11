export const offCatalog = {
  polyhedra: [
    {
      id: 'platonic',
      label: '柏拉图多面体',
      items: [
        { name: '正四面体', path: 'Platonic/Tetrahedron.off' },
        { name: '立方体', path: 'Platonic/Cube.off' },
        { name: '正八面体', path: 'Platonic/Octahedron.off' },
        { name: '正十二面体', path: 'Platonic/Dodecahedron.off' },
        { name: '正二十面体', path: 'Platonic/Icosahedron.off' }
      ]
    },
    {
      id: 'keplerPoinsot',
      label: '开普勒–普安索多面体',
      items: [
        { name: '大十二面体', path: 'KeplerPoinsot/Great_dodecahedron.off' },
        { name: '大二十面体', path: 'KeplerPoinsot/Great_icosahedron.off' },
        {
          name: '大星形十二面体',
          path: 'KeplerPoinsot/Great_stellated_dodecahedron.off'
        },
        {
          name: '小星形十二面体',
          path: 'KeplerPoinsot/Small_stellated_dodecahedron.off'
        }
      ]
    },
    {
      id: 'archimedean',
      label: '阿基米德多面体',
      items: [
        { name: '截角四面体', path: 'Archimedean/Truncated_tetrahedron.off' },
        { name: '截角立方体', path: 'Archimedean/Truncated_cube.off' },
        { name: '截半立方体', path: 'Archimedean/Cuboctahedron.off' },
        { name: '截角八面体', path: 'Archimedean/Truncated_octahedron.off' },
        {
          name: '小斜方截半立方体',
          path: 'Archimedean/Small_rhombicuboctahedron.off'
        },
        {
          name: '大斜方截半立方体',
          path: 'Archimedean/Great_rhombicuboctahedron.off'
        },
        { name: '扭棱立方体', path: 'Archimedean/Snub_cube.off' },
        {
          name: '截角十二面体',
          path: 'Archimedean/Truncated_dodecahedron.off'
        },
        { name: '截半十二面体', path: 'Archimedean/Icosidodecahedron.off' },
        { name: '截角二十面体', path: 'Archimedean/Truncated_icosahedron.off' },
        {
          name: '小斜方截半十二面体',
          path: 'Archimedean/Small_rhombicosidodecahedron.off'
        },
        {
          name: '大斜方截半十二面体',
          path: 'Archimedean/Great_rhombicosidodecahedron.off'
        },
        { name: '扭棱十二面体', path: 'Archimedean/Snub_dodecahedron.off' }
      ]
    },
    {
      id: 'catalan',
      label: '卡塔兰多面体',
      items: [
        { name: '三角化四面体', path: 'Catalan/Triakis_tetrahedron.off' },
        { name: '菱形十二面体', path: 'Catalan/Rhombic_dodecahedron.off' },
        { name: '三角化八面体', path: 'Catalan/Triakis_octahedron.off' },
        { name: '四角化立方体', path: 'Catalan/Tetrakis_cube.off' },
        {
          name: '筝形二十四面体',
          path: 'Catalan/Deltoidal_icositetrahedron.off'
        },
        {
          name: '五角二十四面体',
          path: 'Catalan/Pentagonal_icositetrahedron.off'
        },
        {
          name: '四角化菱形十二面体',
          path: 'Catalan/Disdyakis_dodecahedron.off'
        },
        { name: '菱形三十面体', path: 'Catalan/Rhombic_triacontahedron.off' },
        { name: '三角化二十面体', path: 'Catalan/Triakis_icosahedron.off' },
        { name: '五角化十二面体', path: 'Catalan/Pentakis_dodecahedron.off' },
        { name: '筝形六十面体', path: 'Catalan/Deltoidal_hexecontahedron.off' },
        {
          name: '五角六十面体',
          path: 'Catalan/Pentagonal_hexecontahedron.off'
        },
        {
          name: '四角化菱形三十面体',
          path: 'Catalan/Disdyakis_triacontahedron.off'
        }
      ]
    },
    {
      id: 'johnson',
      label: '约翰逊多面体',
      items: [
        { name: '正四角锥', path: 'Johnson/Square_pyramid.off' },
        { name: '正五角锥', path: 'Johnson/Pentagonal_pyramid.off' },
        { name: '正三角台塔', path: 'Johnson/Triangular_cupola.off' },
        { name: '正四角台塔', path: 'Johnson/Square_cupola.off' },
        { name: '正五角台塔', path: 'Johnson/Pentagonal_cupola.off' },
        { name: '正五角丸塔', path: 'Johnson/Pentagonal_rotunda.off' },
        {
          name: '正三角锥柱',
          path: 'Johnson/Elongated_triangular_pyramid.off'
        },
        { name: '正四角锥柱', path: 'Johnson/Elongated_square_pyramid.off' },
        {
          name: '正五角锥柱',
          path: 'Johnson/Elongated_pentagonal_pyramid.off'
        },
        {
          name: '四角锥反角柱',
          path: 'Johnson/Gyroelongated_square_pyramid.off'
        },
        {
          name: '五角锥反角柱',
          path: 'Johnson/Gyroelongated_pentagonal_pyramid.off'
        },
        { name: '双三角锥', path: 'Johnson/Triangular_bipyramid.off' },
        { name: '双五角锥', path: 'Johnson/Pentagonal_bipyramid.off' },
        {
          name: '双三角锥柱',
          path: 'Johnson/Elongated_triangular_bipyramid.off'
        },
        { name: '双四角锥柱', path: 'Johnson/Elongated_square_bipyramid.off' },
        {
          name: '双五角锥柱',
          path: 'Johnson/Elongated_pentagonal_bipyramid.off'
        },
        {
          name: '双四角锥反角柱',
          path: 'Johnson/Gyroelongated_square_bipyramid.off'
        },
        { name: '三角台塔柱', path: 'Johnson/Elongated_triangular_cupola.off' },
        { name: '四角台塔柱', path: 'Johnson/Elongated_square_cupola.off' },
        { name: '五角台塔柱', path: 'Johnson/Elongated_pentagonal_cupola.off' },
        {
          name: '正五角丸塔柱',
          path: 'Johnson/Elongated_pentagonal_rotunda.off'
        },
        {
          name: '正三角台塔反角柱',
          path: 'Johnson/Gyroelongated_triangular_cupola.off'
        },
        {
          name: '正四角台塔反角柱',
          path: 'Johnson/Gyroelongated_square_cupola.off'
        },
        {
          name: '正五角台塔反角柱',
          path: 'Johnson/Gyroelongated_pentagonal_cupola.off'
        },
        {
          name: '正五角丸塔反角柱',
          path: 'Johnson/Gyroelongated_pentagonal_rotunda.off'
        },
        { name: '异相双三角柱', path: 'Johnson/Gyrobifastigium.off' },
        {
          name: '同相双三角台塔',
          path: 'Johnson/Triangular_orthobicupola.off'
        },
        { name: '同相双四角台塔', path: 'Johnson/Square_orthobicupola.off' },
        { name: '异相双四角台塔', path: 'Johnson/Square_gyrobicupola.off' },
        {
          name: '同相双五角台塔',
          path: 'Johnson/Pentagonal_orthobicupola.off'
        },
        { name: '异相双五角台塔', path: 'Johnson/Pentagonal_gyrobicupola.off' },
        {
          name: '同相五角台塔丸塔',
          path: 'Johnson/Pentagonal_orthocupolarotunda.off'
        },
        {
          name: '异相五角台塔丸塔',
          path: 'Johnson/Pentagonal_gyrocupolarotunda.off'
        },
        {
          name: '同相双五角丸塔',
          path: 'Johnson/Pentagonal_orthobirotunda.off'
        },
        {
          name: '同相双三角台塔柱',
          path: 'Johnson/Elongated_triangular_orthobicupola.off'
        },
        {
          name: '异相双三角台塔柱',
          path: 'Johnson/Elongated_triangular_gyrobicupola.off'
        },
        {
          name: '异相双四角台塔柱',
          path: 'Johnson/Elongated_square_gyrobicupola.off'
        },
        {
          name: '同相双五角台塔柱',
          path: 'Johnson/Elongated_pentagonal_orthobicupola.off'
        },
        {
          name: '异相双五角台塔柱',
          path: 'Johnson/Elongated_pentagonal_gyrobicupola.off'
        },
        {
          name: '同相五角台塔丸塔柱',
          path: 'Johnson/Elongated_pentagonal_orthocupolarotunda.off'
        },
        {
          name: '异相五角台塔丸塔柱',
          path: 'Johnson/Elongated_pentagonal_gyrocupolarotunda.off'
        },
        {
          name: '同相五角双丸塔柱',
          path: 'Johnson/Elongated_pentagonal_orthobirotunda.off'
        },
        {
          name: '异相五角双丸塔柱',
          path: 'Johnson/Elongated_pentagonal_gyrobirotunda.off'
        },
        {
          name: '双三角台塔反角柱',
          path: 'Johnson/Gyroelongated_triangular_bicupola.off'
        },
        {
          name: '双四角台塔反角柱',
          path: 'Johnson/Gyroelongated_square_bicupola.off'
        },
        {
          name: '双五角台塔反角柱',
          path: 'Johnson/Gyroelongated_pentagonal_bicupola.off'
        },
        {
          name: '五角台塔丸塔反角柱',
          path: 'Johnson/Gyroelongated_pentagonal_cupolarotunda.off'
        },
        {
          name: '双五角丸塔反角柱',
          path: 'Johnson/Gyroelongated_pentagonal_birotunda.off'
        },
        { name: '侧锥三角柱', path: 'Johnson/Augmented_triangular_prism.off' },
        {
          name: '二侧锥三角柱',
          path: 'Johnson/Biaugmented_triangular_prism.off'
        },
        {
          name: '三侧锥三角柱',
          path: 'Johnson/Triaugmented_triangular_prism.off'
        },
        { name: '侧锥五角柱', path: 'Johnson/Augmented_pentagonal_prism.off' },
        {
          name: '间二侧锥五角柱',
          path: 'Johnson/Biaugmented_pentagonal_prism.off'
        },
        { name: '侧锥六角柱', path: 'Johnson/Augmented_hexagonal_prism.off' },
        {
          name: '对二侧锥六角柱',
          path: 'Johnson/Parabiaugmented_hexagonal_prism.off'
        },
        {
          name: '间二侧锥六角柱',
          path: 'Johnson/Metabiaugmented_hexagonal_prism.off'
        },
        {
          name: '三侧锥六角柱',
          path: 'Johnson/Triaugmented_hexagonal_prism.off'
        },
        { name: '侧锥正十二面体', path: 'Johnson/Augmented_dodecahedron.off' },
        {
          name: '对二侧锥正十二面体',
          path: 'Johnson/Parabiaugmented_dodecahedron.off'
        },
        {
          name: '间二侧锥正十二面体',
          path: 'Johnson/Metabiaugmented_dodecahedron.off'
        },
        {
          name: '三侧锥正十二面体',
          path: 'Johnson/Triaugmented_dodecahedron.off'
        },
        {
          name: '正二十面体欠邻二侧锥',
          path: 'Johnson/Metabidiminished_icosahedron.off'
        },
        {
          name: '正二十面体欠三侧锥',
          path: 'Johnson/Tridiminished_icosahedron.off'
        },
        {
          name: '侧锥正二十面体欠三侧锥',
          path: 'Johnson/Augmented_tridiminished_icosahedron.off'
        },
        {
          name: '侧台塔截角四面体',
          path: 'Johnson/Augmented_truncated_tetrahedron.off'
        },
        {
          name: '侧台塔截角立方体',
          path: 'Johnson/Augmented_truncated_cube.off'
        },
        {
          name: '对二侧台塔截角立方体',
          path: 'Johnson/Biaugmented_truncated_cube.off'
        },
        {
          name: '侧台塔截角十二面体',
          path: 'Johnson/Augmented_truncated_dodecahedron.off'
        },
        {
          name: '对二侧台塔截角十二面体',
          path: 'Johnson/Parabiaugmented_truncated_dodecahedron.off'
        },
        {
          name: '间二侧台塔截角十二面体',
          path: 'Johnson/Metabiaugmented_truncated_dodecahedron.off'
        },
        {
          name: '三侧台塔截角十二面体',
          path: 'Johnson/Triaugmented_truncated_dodecahedron.off'
        },
        {
          name: '单旋侧台塔小斜方截半二十面体',
          path: 'Johnson/Gyrate_rhombicosidodecahedron.off'
        },
        {
          name: '对二旋侧台塔小斜方截半二十面体',
          path: 'Johnson/Parabigyrate_rhombicosidodecahedron.off'
        },
        {
          name: '邻二旋侧台塔小斜方截半二十面体',
          path: 'Johnson/Metabigyrate_rhombicosidodecahedron.off'
        },
        {
          name: '三旋侧台塔小斜方截半二十面体',
          path: 'Johnson/Trigyrate_rhombicosidodecahedron.off'
        },
        {
          name: '小斜方截半二十面体欠一侧台塔',
          path: 'Johnson/Diminished_rhombicosidodecahedron.off'
        },
        {
          name: '对单旋侧台塔小斜方截半二十面体欠一侧台塔',
          path: 'Johnson/Paragyrate_diminished_rhombicosidodecahedron.off'
        },
        {
          name: '邻单旋侧台塔小斜方截半二十面体欠一侧台塔',
          path: 'Johnson/Metagyrate_diminished_rhombicosidodecahedron.off'
        },
        {
          name: '二旋侧台塔小斜方截半二十面体欠一侧台塔',
          path: 'Johnson/Bigyrate_diminished_rhombicosidodecahedron.off'
        },
        {
          name: '小斜方截半二十面体欠对二侧台塔',
          path: 'Johnson/Parabidiminished_rhombicosidodecahedron.off'
        },
        {
          name: '小斜方截半二十面体欠邻二侧台塔',
          path: 'Johnson/Metabidiminished_rhombicosidodecahedron.off'
        },
        {
          name: '单旋侧台塔小斜方截半二十面体欠二侧台塔',
          path: 'Johnson/Gyrate_bidiminished_rhombicosidodecahedron.off'
        },
        {
          name: '小斜方截半二十面体欠三侧台塔',
          path: 'Johnson/Tridiminished_rhombicosidodecahedron.off'
        },
        { name: '扭棱锲形体', path: 'Johnson/Snub_disphenoid.off' },
        { name: '扭棱四角反角柱', path: 'Johnson/Snub_square_antiprism.off' },
        { name: '球状屋顶', path: 'Johnson/Sphenocorona.off' },
        { name: '侧锥球状屋顶', path: 'Johnson/Augmented_sphenocorona.off' },
        { name: '加长型球状屋顶', path: 'Johnson/Sphenomegacorona.off' },
        {
          name: '广底加长型球状屋顶',
          path: 'Johnson/Hebesphenomegacorona.off'
        },
        { name: '五角锥球状屋顶', path: 'Johnson/Disphenocingulum.off' },
        { name: '双新月双丸塔', path: 'Johnson/Bilunabirotunda.off' },
        {
          name: '三角广底球状丸塔',
          path: 'Johnson/Triangular_hebesphenorotunda.off'
        }
      ]
    },
    {
      id: 'special',
      label: '特殊多面体',
      items: [
        { name: '西洛希多面体', path: 'Special/Szilassi_Polyhedron.off' },
        { name: '恰萨尔多面体', path: 'Special/Császár_Polyhedron.off' },
        { name: 'm', path: 'Special/m.off' },
        { name: 'm*', path: 'Special/m*.off' }
      ]
    },
    {
      id: 'tiling',
      label: '正密铺',
      items: [
        { name: '三角形密铺', path: 'Tiling/Triangular_tiling.off' },
        { name: '正方形密铺', path: 'Tiling/Square_tiling.off' },
        { name: '六边形密铺', path: 'Tiling/Hexagonal_tiling.off' }
      ]
    },
    {
      id: 'petrialPlatonic',
      label: '皮特里柏拉图多面体',
      items: [
        {
          name: '皮特里四面体',
          path: 'Petrial/Platonic/Petrial_tetrahedron.off'
        },
        { name: '皮特里立方体', path: 'Petrial/Platonic/Petrial_cube.off' },
        {
          name: '皮特里八面体',
          path: 'Petrial/Platonic/Petrial_octahedron.off'
        },
        {
          name: '皮特里十二面体',
          path: 'Petrial/Platonic/Petrial_dodecahedron.off'
        },
        {
          name: '皮特里二十面体',
          path: 'Petrial/Platonic/Petrial_icosahedron.off'
        }
      ]
    },
    {
      id: 'petrialKeplerPoinsot',
      label: '皮特里开普勒——普安索多面体',
      items: [
        {
          name: '皮特里大二十面体',
          path: 'Petrial/KeplerPoinsot/Petrial_great_icosahedron.off'
        },
        {
          name: '皮特里大十二面体',
          path: 'Petrial/KeplerPoinsot/Petrial_great_dodecahedron.off'
        },
        {
          name: '皮特里大星形十二面体',
          path: 'Petrial/KeplerPoinsot/Petrial_great_stellated_dodecahedron.off'
        },
        {
          name: '皮特里小星形十二面体',
          path: 'Petrial/KeplerPoinsot/Petrial_small_stellated_dodecahedron.off'
        }
      ]
    },
    {
      id: 'petrialTiling',
      label: '皮特里正密铺',
      items: [
        {
          name: '皮特里三角形密铺',
          path: 'Petrial/Tiling/Petrial_triangular_tiling.off'
        },
        {
          name: '皮特里正方形密铺',
          path: 'Petrial/Tiling/Petrial_square_tiling.off'
        },
        {
          name: '皮特里六边形密铺',
          path: 'Petrial/Tiling/Petrial_hexgonal_tiling.off'
        }
      ]
    },
    {
      id: 'uniformCompounds',
      label: '均匀复合多面体',
      items: [
        { name: '二复合四面体/星形八面体', path: 'Comp/2Tet.off' },
        { name: '五复合四面体/手性二十面体', path: 'Comp/5Tet.off' },
        { name: '六复合四面体/扭棱体', path: 'Comp/6Tet.off' },
        { name: '十复合四面体/二十二十面体', path: 'Comp/10Tet.off' },
        { name: '十二复合四面体/双扭棱体', path: 'Comp/12Tet.off' },
        { name: '四复合八面体/扭棱八面体', path: 'Comp/4Oct.off' },
        { name: '五复合八面体/小二十二十面体', path: 'Comp/5Oct.off' },
        { name: '八复合八面体/旋转自由度双扭棱八面体', path: 'Comp/8Oct.off' },
        { name: '第一十复合八面体/扭棱二十面体', path: 'Comp/10Oct1st.off' },
        { name: '第二十复合八面体/大扭棱二十面体', path: 'Comp/10Oct2nd.off' },
        { name: '二十复合八面体/双扭棱二十面体', path: 'Comp/20Oct.off' },
        { name: '三复合立方体/斜方六面体', path: 'Comp/3Cube.off' },
        { name: '五复合立方体/斜方体', path: 'Comp/5Cube.off' },
        { name: '六复合立方体/斜方扭棱双六面体', path: 'Comp/6Cube.off' },
        {
          name: '五复合四面半六面体/半斜方手性二十面体',
          path: 'Comp/5Thah.off'
        },
        {
          name: '二十复合四面半六面体/扭棱准扭棱斜方二十面体',
          path: 'Comp/20Thah.off'
        },
        { name: '六复合五角反角柱/大扭棱十二面体', path: 'Comp/6Pap.off' },
        { name: '十二复合五角反角柱/大双扭棱十二面体', path: 'Comp/12Pap.off' },
        {
          name: '六复合五角星交错反角柱/大逆扭棱十二面体',
          path: 'Comp/6Starp.off'
        },
        {
          name: '十二复合五角星交错反角柱/大逆双扭棱十二面体',
          path: 'Comp/12Starp.off'
        }
      ]
    }
  ],

  polychora: [
    {
      id: 'regularConvex',
      label: '凸正多胞体',
      items: [
        { name: '正五胞体', path: 'RegularConvex/Pentachoron.off' },
        { name: '超立方体', path: 'RegularConvex/Tesseract.off' },
        { name: '正十六胞体', path: 'RegularConvex/Hexadecachoron.off' },
        { name: '正二十四胞体', path: 'RegularConvex/Icositetrachoron.off' },
        {
          name: '正一百二十胞体',
          path: 'RegularConvex/Hecatonicosachoron.off'
        },
        { name: '正六百胞体', path: 'RegularConvex/Hexacosichoron.off' }
      ]
    },
    {
      id: 'schlafliHess',
      label: '施莱夫利–赫斯多胞体',
      items: [
        { name: '大一百二十胞体', path: 'SchläfliHess/Gohi.off' },
        { name: '巨一百二十胞体', path: 'SchläfliHess/Gahi.off' },
        { name: '巨大一百二十胞体', path: 'SchläfliHess/Gaghi.off' },
        { name: '小星形一百二十胞体', path: 'SchläfliHess/Sishi.off' },
        { name: '大星形一百二十胞体', path: 'SchläfliHess/Gishi.off' },
        { name: '巨星形一百二十胞体', path: 'SchläfliHess/Gashi.off' },
        { name: '巨大星形一百二十胞体', path: 'SchläfliHess/Gogishi.off' },
        { name: '刻面六百胞体', path: 'SchläfliHess/Fix.off' },
        { name: '大刻面六百胞体', path: 'SchläfliHess/Gofix.off' },
        { name: '巨六百胞体', path: 'SchläfliHess/Gax.off' }
      ]
    },
    {
      id: 'special4D',
      label: '特殊多胞体',
      items: [
        { name: '大双反角柱（五边形—五角星交错双反角柱）', path: 'Special/Gudap.off' },
      ]
    },
    {
      id: 'truncatedRegularConvex',
      label: '截角凸正多胞体',
      items: [
        { name: '截角五胞体', path: 'TruncatedRegularConvex/Tip.off' },
        { name: '截角超立方体', path: 'TruncatedRegularConvex/Tat.off' },
        { name: '截角十六胞体', path: 'TruncatedRegularConvex/Thex.off' },
        { name: '截角二十四胞体', path: 'TruncatedRegularConvex/Tico.off' },
        { name: '截角一百二十胞体', path: 'TruncatedRegularConvex/Thi.off' },
        { name: '截角六百胞体', path: 'TruncatedRegularConvex/Tex.off' }
      ]
    },
    {
      id: 'truncatedSchläfliHess',
      label: '截角施莱夫利–赫斯多胞体',
      items: [
        { name: '截角大一百二十胞体', path: 'TruncatedSchläfliHess/Tighi.off' },
        { name: '截角巨一百二十胞体', path: 'TruncatedSchläfliHess/Taghi.off' },
        {
          name: '截角巨大一百二十胞体',
          path: 'TruncatedSchläfliHess/Tigaghi.off'
        },
        { name: '截角刻面六百胞体', path: 'TruncatedSchläfliHess/Tiffix.off' },
        {
          name: '截角大刻面六百胞体',
          path: 'TruncatedSchläfliHess/Tigfix.off'
        },
        { name: '截角巨六百胞体', path: 'TruncatedSchläfliHess/Taggix.off' }
      ]
    },
    {
      id: 'rectifiedRegularConvex',
      label: '截半凸正多胞体',
      items: [
        {
          name: '截半五胞体',
          path: 'RectifiedRegularConvex/Rectified_pentachoron.off'
        },
        {
          name: '截半超立方体',
          path: 'RectifiedRegularConvex/Rectified_tesseract.off'
        },
        {
          name: '截半二十四胞体',
          path: 'RectifiedRegularConvex/Rectified_icositetrachoron.off'
        },
        {
          name: '截半一百二十胞体',
          path: 'RectifiedRegularConvex/Rectified_hecatonicosachoron.off'
        },
        {
          name: '截半六百胞体',
          path: 'RectifiedRegularConvex/Rectified_hexacosichoron.off'
        }
      ]
    },
    {
      id: 'rectifiedSchläfliHess',
      label: '截半施莱夫利–赫斯多胞体',
      items: [
        { name: '截半大一百二十胞体', path: 'RectifiedSchläfliHess/Righi.off' },
        { name: '截半巨一百二十胞体', path: 'RectifiedSchläfliHess/Raghi.off' },
        {
          name: '截半巨大一百二十胞体',
          path: 'RectifiedSchläfliHess/Ragaghi.off'
        },
        {
          name: '截半小星形一百二十胞体',
          path: 'RectifiedSchläfliHess/Rasishi.off'
        },
        {
          name: '截半大星形一百二十胞体',
          path: 'RectifiedSchläfliHess/Ragishi.off'
        },
        {
          name: '截半巨星形一百二十胞体',
          path: 'RectifiedSchläfliHess/Ragashi.off'
        },
        {
          name: '截半巨大星形一百二十胞体',
          path: 'RectifiedSchläfliHess/Rigogishi.off'
        },
        { name: '截半刻面六百胞体', path: 'RectifiedSchläfliHess/Rofix.off' },
        {
          name: '截半大刻面六百胞体',
          path: 'RectifiedSchläfliHess/Rigfix.off'
        },
        { name: '截半巨六百胞体', path: 'RectifiedSchläfliHess/Raggix.off' }
      ]
    },
    {
      id: 'bitruncatedRegularConvex',
      label: '二截角凸正多胞体',
      items: [
        {
          name: '二截角五胞体',
          path: 'BitruncatedRegularConvex/Bitruncated_pentachoron.off'
        },
        {
          name: '二截角超立方体',
          path: 'BitruncatedRegularConvex/Bitruncated_tesseract.off'
        },
        {
          name: '二截角二十四胞体',
          path: 'BitruncatedRegularConvex/Bitruncated_icositetrachoron.off'
        },
        {
          name: '二截角一百二十胞体',
          path: 'BitruncatedRegularConvex/Bitruncated_hecatonicosachoron.off'
        }
      ]
    },
    {
      id: 'bitruncatedSchläfliHess',
      label: '二截角施莱夫利–赫斯多胞体',
      items: [
        {
          name: '二截角巨一百二十胞体',
          path: 'BitruncatedSchläfliHess/Dahi(btga120).off'
        },
        {
          name: '二截角巨大星形一百二十胞体',
          path: 'BitruncatedSchläfliHess/Gixhi(btgags120).off'
        },
        {
          name: '二截角刻面六百胞体',
          path: 'BitruncatedSchläfliHess/Shihi(btf600).off'
        }
      ]
    },
    {
      id: 'cantellatedRegularConvex',
      label: '小斜方凸正多胞体',
      items: [
        {
          name: '小斜方五胞体',
          path: 'CantellatedRegularConvex/Cantellated_pentachoron.off'
        },
        {
          name: '小斜方超立方体',
          path: 'CantellatedRegularConvex/Cantellated_tesseract.off'
        },
        {
          name: '小斜方二十四胞体',
          path: 'CantellatedRegularConvex/Cantellated_icositetrachoron.off'
        },
        {
          name: '小斜方一百二十胞体',
          path: 'CantellatedRegularConvex/Cantellated_hecatonicosachoron.off'
        },
        {
          name: '小斜方六百胞体',
          path: 'CantellatedRegularConvex/Cantellated_hexacosichoron.off'
        }
      ]
    },
    {
      id: 'cantellatedSchläfliHess',
      label: '小斜方施莱夫利–赫斯多胞体',
      items: [
        {
          name: '小斜方大一百二十胞体',
          path: 'CantellatedSchläfliHess/Sirghi.off'
        },
        {
          name: '小斜方巨一百二十胞体',
          path: 'CantellatedSchläfliHess/Sraghi.off'
        },
        {
          name: '小斜方巨大一百二十胞体',
          path: 'CantellatedSchläfliHess/Sirgaghi.off'
        },
        {
          name: '小斜方小星形一百二十胞体',
          path: 'CantellatedSchläfliHess/Sirsashi.off'
        },
        {
          name: '小斜方巨星形一百二十胞体',
          path: 'CantellatedSchläfliHess/Sirgashi.off'
        },
        {
          name: '小斜方刻面六百胞体',
          path: 'CantellatedSchläfliHess/Sirfix.off'
        },
        { name: '小斜方巨六百胞体', path: 'CantellatedSchläfliHess/Sirgax.off' }
      ]
    },
    {
      id: 'cantitruncatedRegularConvex',
      label: '大斜方凸正多胞体',
      items: [
        {
          name: '大斜方五胞体',
          path: 'CantitruncatedRegularConvex/Cantitruncated_pentachoron.off'
        },
        {
          name: '大斜方超立方体',
          path: 'CantitruncatedRegularConvex/Cantitruncated_tesseract.off'
        },
        {
          name: '大斜方二十四胞体',
          path: 'CantitruncatedRegularConvex/Cantitruncated_icositetrachoron.off'
        },
        {
          name: '大斜方一百二十胞体',
          path: 'CantitruncatedRegularConvex/Cantitruncated_hecatonicosachoron.off'
        },
        {
          name: '大斜方六百胞体',
          path: 'CantitruncatedRegularConvex/Cantitruncated_hexacosichoron.off'
        }
      ]
    },
    {
      id: 'cantitruncatedSchläfliHess',
      label: '大斜方施莱夫利–赫斯多胞体',
      items: [
        {
          name: '大斜方巨一百二十胞体',
          path: 'CantitruncatedSchläfliHess/Graghi.off'
        },
        {
          name: '大斜方刻面六百胞体',
          path: 'CantitruncatedSchläfliHess/Girfix.off'
        },
        {
          name: '大斜方巨六百胞体',
          path: 'CantitruncatedSchläfliHess/Graggix.off'
        }
      ]
    },
    {
      id: 'runcinatedRegularConvex',
      label: '小角柱二截角凸正多胞体',
      items: [
        {
          name: '小角柱二截角五胞体',
          path: 'RuncinatedRegularConvex/Runcinated_pentachoron.off'
        },
        {
          name: '小角柱二截角超立方体',
          path: 'RuncinatedRegularConvex/Runcinated_tesseract.off'
        },
        {
          name: '小角柱二截角二十四胞体',
          path: 'RuncinatedRegularConvex/Runcinated_icositetrachoron.off'
        },
        {
          name: '小角柱二截角一百二十胞体',
          path: 'RuncinatedRegularConvex/Runcinated_hecatonicosachoron.off'
        }
      ]
    },
    {
      id: 'runcinatedSchläfliHess',
      label: '小角柱二截角施莱夫利–赫斯多胞体',
      items: [
        {
          name: '小角柱二截角巨大星形一百二十胞体',
          path: 'RuncinatedSchläfliHess/Runcinated_great_grand_stellated_hecatonicosachoron.off'
        },
        {
          name: '小角柱二截角刻面六百胞体',
          path: 'RuncinatedSchläfliHess/Runcinated_facted_hexacosichoron.off'
        }
      ]
    },
    {
      id: 'runcitruncatedRegularConvex',
      label: '小角柱截角凸正多胞体',
      items: [
        {
          name: '小角柱截角五胞体',
          path: 'RuncitruncatedRegularConvex/Runcitruncated_pentachoron.off'
        },
        {
          name: '小角柱截角超立方体',
          path: 'RuncitruncatedRegularConvex/Runcitruncated_tesseract.off'
        },
        {
          name: '小角柱截角十六胞体',
          path: 'RuncitruncatedRegularConvex/Runcitruncated_hexadecachoron.off'
        },
        {
          name: '小角柱截角二十四胞体',
          path: 'RuncitruncatedRegularConvex/Runcitruncated_icositetrachoron.off'
        },
        {
          name: '小角柱截角一百二十胞体',
          path: 'RuncitruncatedRegularConvex/Runcitruncated_hecatonicosachoron.off'
        },
        {
          name: '小角柱截角六百胞体',
          path: 'RuncitruncatedRegularConvex/Runcitruncated_hexacosichoron.off'
        }
      ]
    },
    {
      id: 'omnitruncatedRegularConvex',
      label: '大角柱二截角凸正多胞体',
      items: [
        {
          name: '大角柱二截角五胞体',
          path: 'OmnitruncatedRegularConvex/Omnitruncated_pentachoron.off'
        },
        {
          name: '大角柱二截角超立方体',
          path: 'OmnitruncatedRegularConvex/Omnitruncated_tesseract.off'
        },
        {
          name: '大角柱二截角二十四胞体',
          path: 'OmnitruncatedRegularConvex/Omnitruncated_icositetrachoron.off'
        },
        {
          name: '大角柱二截角一百二十胞体',
          path: 'OmnitruncatedRegularConvex/Omnitruncated_hecatonicosachoron.off'
        }
      ]
    }
  ]
};
