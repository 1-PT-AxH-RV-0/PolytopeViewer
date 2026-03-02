import YAML from 'js-yaml';
import * as helperFunc from '../helperFunc.js';
import infFamilies from '../infFamilies.js';

export function setupEventListeners() {
  this.faceVisibleSwitcher.addEventListener('change', () =>
    helperFunc.changeMaterialProperty(
      this.facesGroup,
      'visible',
      this.faceVisibleSwitcher.checked
    )
  );
  this.wireframeVisibleSwitcher.addEventListener('change', () =>
    helperFunc.changeMaterialProperty(
      this.wireframeGroup,
      'visible',
      this.wireframeVisibleSwitcher.checked
    )
  );
  this.verticesVisibleSwitcher.addEventListener('change', () =>
    helperFunc.changeMaterialProperty(
      this.verticesGroup,
      'visible',
      this.verticesVisibleSwitcher.checked
    )
  );
  this.axisVisibleSwitcher.addEventListener('change', () =>
    helperFunc.changeMaterialProperty(
      this.axesGroup,
      'visible',
      this.axisVisibleSwitcher.checked
    )
  );
  this.scaleFactorSlider.noUiSlider.on('update', () =>
    this.updateScaleFactor(this.scaleFactorSlider.noUiSlider.get(true), false)
  );
  this.faceOpacitySlider.noUiSlider.on('update', () => {
    helperFunc.changeMaterialProperty(
      this.facesGroup,
      'opacity',
      +this.faceOpacitySlider.noUiSlider.get(true)
    );
    helperFunc.changeMaterialProperty(
      this.facesGroup,
      'transparent',
      +this.faceOpacitySlider.noUiSlider.get(true) !== 1
    );
  });
  this.wireframeAndVerticesDimSlider.noUiSlider.on('update', () => {
    this.cylinderRadiusUni.value =
      this.wireframeAndVerticesDimSlider.noUiSlider.get(true) /
      this.scaleFactor;
    this.sphereRadiusUni.value =
      (this.wireframeAndVerticesDimSlider.noUiSlider.get(true) /
        this.scaleFactor) *
      2;
  });

  this.projectionDistanceSlider.noUiSlider.on(
    'update',
    this.updateProjectionDistance.bind(this)
  );

  this.rotationSliders.forEach((slider, i) => {
    slider.noUiSlider.on('update', () => {
      this.rotAngles[i] = slider.noUiSlider.get(true);
      this.rotUni.value = helperFunc.create4DRotationMat(...this.rotAngles);
    });
  });

  this.perspSwitcher.addEventListener('change', () =>
    this.toggleCamera(this.perspSwitcher.checked)
  );
  this.schleSwitcher.addEventListener(
    'change',
    () => (this.isOrthoUni.value = !this.schleSwitcher.checked)
  );

  this.uploadOffBtn.addEventListener('click', () => this.fileInput.click());
  this.fileInput.addEventListener(
    'change',
    this.handleFileInputChange.bind(this)
  );

  this.highlightCellsBtn.addEventListener('click', () => {
    try {
      const highlightConfig = YAML.load(this.editor.state.doc.toString());
      this.faceVisibleSwitcher.checked = false;
      this.updateProperties();
      this.highlightCells(highlightConfig);
    } catch (e) {
      this.triggerErrorDialog(e.message);
      console.error(e);
    }
  });
  this.highlightFacesBtn.addEventListener('click', () => {
    try {
      const highlightConfig = YAML.load(this.editor.state.doc.toString());
      this.faceVisibleSwitcher.checked = false;
      this.updateProperties();
      this.highlightFaces(highlightConfig);
    } catch (e) {
      this.triggerErrorDialog(e.message);
      console.error(e);
    }
  });

  this.startRecordBtn.addEventListener('click', this.startRecord.bind(this));
  this.stopRecordBtn.addEventListener(
    'click',
    () => (this.stopRecordFlag = true)
  );

  this.polyhedraSeleEle.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', async () => {
      await this.loadMeshFromUrl(
        await this.importOff(`polyhedra/${a.dataset.path}`),
        this.initialMaterial
      );
    });
  });

  this.polychoraSeleEle.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', async () => {
      await this.loadMeshFromUrl(
        await this.importOff(`polychora/${a.dataset.path}`),
        this.initialMaterial,
        true
      );
    });
  });

  this.setupSolidInfFamiliesEventListeners();
}

export function setupSolidInfFamiliesEventListeners() {
  const sGeNErrorHtml =
    '<math><mi>s</mi></math> 不能大于等于 <math><mi>n</mi></math>。';
  const sGeNErrorText = 's 不能大于等于 n。';
  this.genPrismBtn.addEventListener('click', async () => {
    const [n, s] = this.prismNInput.value.split('/').map(i => +i);

    if (s >= n) {
      this.triggerErrorDialog(sGeNErrorHtml);
      console.error(sGeNErrorText);
      return;
    }

    await this.loadMeshFromData(
      infFamilies.prism(n, s),
      this.initialMaterial
    );
  });

  this.genAntiprismBtn.addEventListener('click', async () => {
    const [n, s] = this.antiprismNInput.value.split('/').map(i => +i);

    if (s >= n) {
      this.triggerErrorDialog(sGeNErrorHtml);
      console.error(sGeNErrorText);
      return;
    }

    const res = infFamilies.antiprism(n, s);
    if (res.neverRegular) {
      this.triggerErrorDialog(
        '当 <math><mi>s</mi> <mo>&ge;</mo> <mfrac><mrow><mn>2</mn><mi>n</mi></mrow><mn>3</mn></mfrac></math> 时，将无法得到正反角柱，将使用 1 作为高度。'
      );
    }

    await this.loadMeshFromData(res.data, this.initialMaterial);
  });

  this.genTrapezohedronBtn.addEventListener('click', async () => {
    const [n, s] = this.trapezohedronNInput.value.split('/').map(i => +i);

    if (s >= n) {
      this.triggerErrorDialog(sGeNErrorHtml);
      console.error(sGeNErrorText);
      return;
    }

    await this.loadMeshFromData(
      infFamilies.trapezohedron(n, s),
      this.initialMaterial
    );
  });

  this.genStephanoidBtn.addEventListener('click', async () => {
    const n = +this.stephanoidNInput.value;
    const a = +this.stephanoidAInput.value;
    const b = +this.stephanoidBInput.value;

    if (a === b || a + b >= n) {
      this.triggerErrorDialog(
        '<math><mi>a</mi> <mo>&equals;</mo> <mi>b</mn></math> 或 <math><mi>a</mi> <mo>&plus;</mo> <mi>b</mi> <mo>&ge;</mo> <mi>n</mi></math> 会生成退化的冠体。'
      );
      console.error('a = b 或 a + b ≥ n 会生成退化的冠体。');
      return;
    }

    try {
      await this.loadMeshFromData(
        infFamilies.stephanoid(n, a, b),
        this.initialMaterial
      );
    } catch (e) {
      this.triggerErrorDialog(e.message);
      console.error(e);
    }
  });

  this.genDuoprismBtn.addEventListener('click', async () => {
    const [m, s1] = this.duoprismMInput.value.split('/').map(i => +i);
    const [n, s2] = this.duoprismNInput.value.split('/').map(i => +i);

    if (s1 >= m) {
      this.triggerErrorDialog(
        '<math><msub><mi>s</mi><mn>1</mn></msub></math> 不能大于等于 <math><mi>m</mi></math>。'
      );
      console.error('s1 不能大于等于 m。');
      return;
    }

    if (s2 >= n) {
      this.triggerErrorDialog(
        '<math><msub><mi>s</mi><mn>2</mn></msub></math> 不能大于等于 <math><mi>n</mi></math>。'
      );
      console.error('s2 不能大于等于 n。');
      return;
    }

    try {
      await this.loadMeshFrom4Data(
        infFamilies.duoprism(m, n, s1, s2),
        this.initialMaterial
      );
    } catch (e) {
      this.triggerErrorDialog(e.message);
      console.error(e);
    }
  });
}

export function handleFileInputChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    this.triggerErrorDialog('文件大小不能超过 5 MiB。');
    return;
  }

  const reader = new FileReader();
  reader.onload = async event => {
    const data = event.target.result;

    this.is4D =
      data
        .split('\n')
        .filter(line => line.trim() !== '' && !line.startsWith('#'))[0]
        .trim() === '4OFF';

    try {
      if (this.is4D) {
        await this.loadMeshFrom4Data(data, this.initialMaterial);
      } else {
        await this.loadMeshFromData(data, this.initialMaterial);
      }
    } catch (e) {
      this.triggerErrorDialog(e.message);
      console.error(e);
    } finally {
      e.target.value = '';
    }
  };
  reader.readAsText(file);
}
