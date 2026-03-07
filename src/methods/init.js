import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import noUiSlider from 'nouislider';
import { EditorView, basicSetup } from 'codemirror';
import { yaml } from '@codemirror/lang-yaml';
import { linter } from '@codemirror/lint';
import YAML from 'js-yaml';
import createAxes from '../axesCreater.js';
import * as helperFunc from '../helperFunc.js';
import env from '../../assets/env.hdr';

export function _initializeDomElements() {
  /* eslint-disable */
  this.canvas = document.getElementById('polytopeRenderer');
  this.faceVisibleSwitcher = document.getElementById('faceVisibleSwitcher');
  this.wireframeVisibleSwitcher = document.getElementById('wireframeVisibleSwitcher');
  this.verticesVisibleSwitcher = document.getElementById('verticesVisibleSwitcher');
  this.axisVisibleSwitcher = document.getElementById('axisVisibleSwitcher');
  this.perspSwitcher = document.getElementById('perspSwitcher');
  this.schleSwitcher = document.getElementById('schleSwitcher');
  this.scaleFactorSlider = document.getElementById('scaleFactorSlider');
  this.faceOpacitySlider = document.getElementById('faceOpacitySlider');
  this.wireframeAndVerticesDimSlider = document.getElementById('wireframeAndVerticesDimSlider');
  this.projectionDistanceSlider = document.getElementById('projectionDistanceSlider');
  this.separationDistSlider = document.getElementById('separationDistSlider');
  this.faceScaleSlider = document.getElementById('faceScaleSlider');
  this.fileInput = document.getElementById('fileInput');
  this.uploadOffBtn = document.getElementById('uploadOff');
  this.infoDis = document.getElementById('info');
  this.progCon = document.getElementById('progContainer');
  this.progDis = document.getElementById('prog');
  this.startRecordBtn = document.getElementById('startRecord');
  this.stopRecordBtn = document.getElementById('stopRecord');
  this.configFileInput = document.getElementById('configFileInput');
  this.highlightCellsBtn = document.getElementById('highlightCells');
  this.highlightFacesBtn = document.getElementById('highlightFaces');
  
  this.errorModal = document.getElementById('errorModal');
  this.errorMsg = document.getElementById('errorMsg');

  this.offSeleEle = document.getElementById('offSele');
  this.polyhedraSeleEle = document.getElementById('polyhedra');
  this.polychoraSeleEle = document.getElementById('polychora');

  this.genPrismBtn = document.getElementById('genPrism');
  this.prismNInput = document.getElementById('prismN');

  this.genAntiprismBtn = document.getElementById('genAntiprism');
  this.antiprismNInput = document.getElementById('antiprismN');

  this.genTrapezohedronBtn = document.getElementById('genTrapezohedron');
  this.trapezohedronNInput = document.getElementById('trapezohedronN');
  
  this.genStephanoidBtn = document.getElementById('genStephanoid');
  this.stephanoidNInput = document.getElementById('stephanoidN');
  this.stephanoidAInput = document.getElementById('stephanoidA');
  this.stephanoidBInput = document.getElementById('stephanoidB');

  this.genDuoprismBtn = document.getElementById('genDuoprism');
  this.duoprismMInput = document.getElementById('duoprismM');
  this.duoprismNInput = document.getElementById('duoprismN');
  /* eslint-enable */

  this.rotationSliders = ['XY', 'XZ', 'XW', 'YZ', 'YW', 'ZW'].map(i =>
    document.getElementById(`rot${i}Slider`)
  );
}

export function _initializeSliders() {
  noUiSlider.create(this.scaleFactorSlider, {
    range: helperFunc.generateLogarithmicRange(0.1, 120, 10),
    start: 1,
    tooltips: true,
    connect: [true, false]
  });

  noUiSlider.create(this.faceOpacitySlider, {
    range: { min: 0.1, max: 1.0 },
    start: 1,
    tooltips: true,
    connect: [true, false]
  });

  noUiSlider.create(this.wireframeAndVerticesDimSlider, {
    range: helperFunc.generateLogarithmicRange(0.01, 3, 10),
    start: 0.5,
    tooltips: true,
    connect: [true, false]
  });

  noUiSlider.create(this.projectionDistanceSlider, {
    range: helperFunc.generateLogarithmicRange(0.01, 100, 10),
    start: 1,
    tooltips: true,
    connect: [true, false]
  });

  noUiSlider.create(this.separationDistSlider, {
    range: { min: -100, max: 100 },
    start: 0,
    tooltips: true,
    connect: [true, false]
  });

  noUiSlider.create(this.faceScaleSlider, {
    range: helperFunc.generateLogarithmicRange(-20, 20, 10),
    start: 1,
    tooltips: true,
    connect: [true, false]
  });

  this.rotationSliders.forEach(slider => {
    noUiSlider.create(slider, {
      range: { min: 0, max: 360 },
      start: 0,
      tooltips: {
        to: function (numericValue) {
          return numericValue.toFixed(2) + '°';
        }
      },
      connect: [true, false]
    });
  });
}

export function _initializeRenderer() {
  const dpr = window.devicePixelRatio || 1;

  this.renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
    canvas: this.canvas
  });

  const maxSize = Math.min(
    Math.min(window.innerWidth, window.innerHeight),
    720
  );
  this.renderer.setSize(maxSize * dpr, maxSize * dpr, false);
  this.canvas.style.width = `${maxSize}px`;
  this.canvas.style.height = `${maxSize}px`;
  this.progCon.style.left = `${maxSize / 2 + 8}px`;
  this.progCon.style.top = `${maxSize / 2 + 8}px`;
  if (this.nanobar) this.nanobar.style.width = `${maxSize * 0.7}px`;

  window.addEventListener('resize', () => {
    const newMaxSize = Math.min(
      Math.min(window.innerWidth, window.innerHeight),
      720
    );
    this.renderer.setSize(newMaxSize * dpr, newMaxSize * dpr, false);
    this.canvas.style.width = `${newMaxSize}px`;
    this.canvas.style.height = `${newMaxSize}px`;
    this.progCon.style.left = `${newMaxSize / 2 + 8}px`;
    this.progCon.style.top = `${newMaxSize / 2 + 8}px`;
    if (this.nanobar) this.nanobar.style.width = `${newMaxSize * 0.7}px`;
  });
}

export function _initializeScene() {
  this.scene = new THREE.Scene();
  this.scene.background = new THREE.Color(0x111111);
}

export function _initializeEnv() {
  const loader = new RGBELoader();
  loader.load(env, (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      this.scene.environment = texture;
  });
}

export function _initializeCameras() {
  this.camera = new THREE.PerspectiveCamera(60, 1.0, 0.01, 500);
  this.camera.position.set(0, 0, 120);
}

export function _initializeControls() {
  this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  this.controls.enableDamping = true;
  this.controls.dampingFactor = 0.8;
  this.controls.enablePan = false;
  this.controls.minDistance = 1.0;
  this.controls.maxDistance = 150.0;
  this.controls.minZoom = 0.7;
  this.controls.maxZoom = 175.0;
}

export function _initializeEditor() {
  this.editor = new EditorView({
    doc: '3F7DBDFF: all',
    extensions: [
      basicSetup,
      yaml(),
      linter(view => {
        try {
          YAML.load(view.state.doc.toString());
        } catch (e) {
          return [
            {
              from: e.mark.position - 1,
              message: e.reason,
              severity: 'error',
              to: e.mark.position - 1
            }
          ];
        }
        return [];
      })
    ],
    parent: document.querySelector('#editor')
  });
}
