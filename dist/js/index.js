/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 73:
/***/ ((__unused_webpack_module, __unused_webpack___webpack_exports__, __webpack_require__) => {


// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js
var injectStylesIntoStyleTag = __webpack_require__(72);
var injectStylesIntoStyleTag_default = /*#__PURE__*/__webpack_require__.n(injectStylesIntoStyleTag);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/styleDomAPI.js
var styleDomAPI = __webpack_require__(825);
var styleDomAPI_default = /*#__PURE__*/__webpack_require__.n(styleDomAPI);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/insertBySelector.js
var insertBySelector = __webpack_require__(659);
var insertBySelector_default = /*#__PURE__*/__webpack_require__.n(insertBySelector);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js
var setAttributesWithoutAttributes = __webpack_require__(56);
var setAttributesWithoutAttributes_default = /*#__PURE__*/__webpack_require__.n(setAttributesWithoutAttributes);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/insertStyleElement.js
var insertStyleElement = __webpack_require__(540);
var insertStyleElement_default = /*#__PURE__*/__webpack_require__.n(insertStyleElement);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/styleTagTransform.js
var styleTagTransform = __webpack_require__(113);
var styleTagTransform_default = /*#__PURE__*/__webpack_require__.n(styleTagTransform);
// EXTERNAL MODULE: ./node_modules/css-loader/dist/cjs.js!./src/style.css
var style = __webpack_require__(208);
;// ./src/style.css

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (styleTagTransform_default());
options.setAttributes = (setAttributesWithoutAttributes_default());
options.insert = insertBySelector_default().bind(null, "head");
options.domAPI = (styleDomAPI_default());
options.insertStyleElement = (insertStyleElement_default());

var update = injectStylesIntoStyleTag_default()(style/* default */.A, options);




       /* harmony default export */ const src_style = (style/* default */.A && style/* default */.A.locals ? style/* default */.A.locals : undefined);

// EXTERNAL MODULE: ./node_modules/three/build/three.module.js
var three_module = __webpack_require__(437);
// EXTERNAL MODULE: ./node_modules/three/build/three.core.js
var three_core = __webpack_require__(922);
// EXTERNAL MODULE: ./node_modules/three/examples/jsm/controls/TrackballControls.js
var TrackballControls = __webpack_require__(34);
// EXTERNAL MODULE: ./node_modules/three/examples/jsm/loaders/FontLoader.js
var FontLoader = __webpack_require__(264);
// EXTERNAL MODULE: ./node_modules/three/examples/jsm/geometries/TextGeometry.js
var TextGeometry = __webpack_require__(385);
// EXTERNAL MODULE: ./node_modules/poly2tri/src/poly2tri.js
var poly2tri = __webpack_require__(312);
// EXTERNAL MODULE: ./node_modules/polygon-clipping/dist/polygon-clipping.umd.js
var polygon_clipping_umd = __webpack_require__(4);
;// ./src/offProcessor.js
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }


function decomposeSelfIntersectingPolygon(originalPoints) {
  var coords = originalPoints.map(function (p) {
    return [+p.x.toFixed(6), +p.y.toFixed(6)];
  });
  if (coords.length > 0) {
    coords.push([coords[0][0], coords[0][1]]);
  }
  var result = polygon_clipping_umd.union([coords]);
  var decomposed = [];
  var _iterator = _createForOfIteratorHelper(result),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var polygon = _step.value;
      var _iterator2 = _createForOfIteratorHelper(polygon),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var ring = _step2.value;
          if (ring.length === 0) continue;
          var ringPoints = ring.slice(0, -1);
          var points = ringPoints.map(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2),
              x = _ref2[0],
              y = _ref2[1];
            return new poly2tri.Point(x, y);
          });
          decomposed.push(points);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  return decomposed;
}
function parseOFF(data) {
  var lines = data.split('\n').filter(function (line) {
    return line.trim() !== '' && !line.startsWith('#');
  });
  if (lines[0].trim() !== 'OFF') throw new Error('Invalid OFF file format');
  var _lines$1$trim$split$m = lines[1].trim().split(/\s+/).map(Number),
    _lines$1$trim$split$m2 = _slicedToArray(_lines$1$trim$split$m, 2),
    nVertices = _lines$1$trim$split$m2[0],
    nFaces = _lines$1$trim$split$m2[1];
  var vertices = [];
  for (var i = 0; i < nVertices; i++) {
    var _lines$trim$split$map = lines[i + 2].trim().split(/\s+/).map(parseFloat),
      _lines$trim$split$map2 = _slicedToArray(_lines$trim$split$map, 3),
      x = _lines$trim$split$map2[0],
      y = _lines$trim$split$map2[1],
      z = _lines$trim$split$map2[2];
    vertices.push({
      x: x,
      y: y,
      z: z
    });
  }
  var faces = [];
  for (var _i = 0; _i < nFaces; _i++) {
    var parts = lines[_i + 2 + nVertices].trim().split(/\s+/);
    var count = parseInt(parts[0]);
    faces.push(parts.slice(1, count + 1).map(Number));
  }
  return {
    vertices: vertices,
    faces: faces
  };
}
function computeNormal(points) {
  var v1 = {
    x: points[1].x - points[0].x,
    y: points[1].y - points[0].y,
    z: points[1].z - points[0].z
  };
  var v2 = {
    x: points[2].x - points[0].x,
    y: points[2].y - points[0].y,
    z: points[2].z - points[0].z
  };
  var nx = v1.y * v2.z - v1.z * v2.y;
  var ny = v1.z * v2.x - v1.x * v2.z;
  var nz = v1.x * v2.y - v1.y * v2.x;
  var length = Math.sqrt(nx ** 2 + ny ** 2 + nz ** 2);
  return {
    x: nx / length,
    y: ny / length,
    z: nz / length
  };
}
function rotatePoint(p, theta, phi) {
  var cosT = Math.cos(theta),
    sinT = Math.sin(theta);
  var cosP = Math.cos(phi),
    sinP = Math.sin(phi);
  var y1 = p.y * cosT - p.z * sinT;
  var z1 = p.y * sinT + p.z * cosT;
  var x2 = p.x * cosP + z1 * sinP;
  var z2 = -p.x * sinP + z1 * cosP;
  return {
    x: x2,
    y: y1,
    z: z2,
    orig: p
  };
}
function inverseRotatePoint(p, theta, phi) {
  var cosT = Math.cos(-theta),
    sinT = Math.sin(-theta);
  var cosP = Math.cos(-phi),
    sinP = Math.sin(-phi);
  var x1 = p.x * cosP + p.z * sinP;
  var z1 = -p.x * sinP + p.z * cosP;
  var y2 = p.y * cosT - z1 * sinT;
  var z2 = p.y * sinT + z1 * cosT;
  return {
    x: x1,
    y: y2,
    z: z2
  };
}
function rotateToXY(points) {
  var normal = computeNormal(points);
  var theta = Math.atan2(normal.y, normal.z);
  var phi = Math.atan2(-normal.x, Math.sqrt(normal.y ** 2 + normal.z ** 2));
  var rotated = points.map(function (p) {
    return rotatePoint(p, theta, phi);
  });
  return {
    rotated: rotated,
    theta: theta,
    phi: phi,
    z: rotated[0].z
  };
}
function arePointsClose(point1, point2) {
  var epsilon = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Number.EPSILON;
  var dx = Math.abs(point1.x - point2.x);
  var dy = Math.abs(point1.y - point2.y);
  var dz = Math.abs(point1.z - point2.z);
  return dx <= epsilon && dy <= epsilon && dz <= epsilon;
}
function getUniqueSortedPairs(arrays) {
  var pairs = arrays.flatMap(function (arr) {
    return arr.map(function (v, i) {
      return [Math.min(v, arr[(i + 1) % arr.length]), Math.max(v, arr[(i + 1) % arr.length])];
    });
  });
  return _toConsumableArray(new Set(pairs.map(JSON.stringify))).map(JSON.parse);
}
;
function processMeshData(_ref3) {
  var vertices = _ref3.vertices,
    faces = _ref3.faces;
  var processedVertices = _toConsumableArray(vertices);
  var processedFaces = [];
  var edges = getUniqueSortedPairs(faces).map(function (edge) {
    return edge.map(function (index) {
      return vertices[index];
    });
  });
  faces.forEach(function (face) {
    if (face.length === 3) {
      processedFaces.push(face);
      return;
    }
    var faceVertices = face.map(function (idx) {
      return vertices[idx];
    });
    function triangulateFace(vertices3D) {
      var _rotateToXY = rotateToXY(vertices3D),
        rotated = _rotateToXY.rotated,
        theta = _rotateToXY.theta,
        phi = _rotateToXY.phi,
        z = _rotateToXY.z;
      var contour = rotated.map(function (p) {
        return new poly2tri.Point(p.x, p.y);
      });
      var triangles = [];
      var decomposed = decomposeSelfIntersectingPolygon(contour);
      var _iterator3 = _createForOfIteratorHelper(decomposed),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var subPolygon = _step3.value;
          var swctx = new poly2tri.SweepContext(subPolygon);
          swctx.triangulate();
          var subTriangles = swctx.getTriangles().map(function (triangle) {
            return triangle.getPoints().map(function (pt) {
              pt.z = z;
              var origPoint = inverseRotatePoint(pt, theta, phi);
              var origIndex = processedVertices.findIndex(function (p) {
                return arePointsClose(p, origPoint);
              });
              if (origIndex > -1) return origIndex;
              processedVertices.push(origPoint);
              return processedVertices.length - 1;
            });
          });
          triangles.push.apply(triangles, _toConsumableArray(subTriangles));
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      return triangles;
    }
    var triangles = triangulateFace(faceVertices);
    triangles.forEach(function (t) {
      if (t.length === 3) processedFaces.push(t);
    });
  });
  return {
    vertices: processedVertices,
    faces: processedFaces,
    edges: edges
  };
}

;// ./assets/models/tri.off
const tri_namespaceObject = __webpack_require__.p + "assets/tri.off";
;// ./assets/fonts/Sarasa_Mono_SC_Bold.typeface.json
const Sarasa_Mono_SC_Bold_typeface_namespaceObject = __webpack_require__.p + "assets/Sarasa_Mono_SC_Bold.typeface.json";
;// ./src/viewer.js
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function viewer_createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = viewer_unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function viewer_slicedToArray(r, e) { return viewer_arrayWithHoles(r) || viewer_iterableToArrayLimit(r, e) || viewer_unsupportedIterableToArray(r, e) || viewer_nonIterableRest(); }
function viewer_nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function viewer_iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function viewer_arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _regeneratorRuntime() { "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */ _regeneratorRuntime = function _regeneratorRuntime() { return e; }; var t, e = {}, r = Object.prototype, n = r.hasOwnProperty, o = Object.defineProperty || function (t, e, r) { t[e] = r.value; }, i = "function" == typeof Symbol ? Symbol : {}, a = i.iterator || "@@iterator", c = i.asyncIterator || "@@asyncIterator", u = i.toStringTag || "@@toStringTag"; function define(t, e, r) { return Object.defineProperty(t, e, { value: r, enumerable: !0, configurable: !0, writable: !0 }), t[e]; } try { define({}, ""); } catch (t) { define = function define(t, e, r) { return t[e] = r; }; } function wrap(t, e, r, n) { var i = e && e.prototype instanceof Generator ? e : Generator, a = Object.create(i.prototype), c = new Context(n || []); return o(a, "_invoke", { value: makeInvokeMethod(t, r, c) }), a; } function tryCatch(t, e, r) { try { return { type: "normal", arg: t.call(e, r) }; } catch (t) { return { type: "throw", arg: t }; } } e.wrap = wrap; var h = "suspendedStart", l = "suspendedYield", f = "executing", s = "completed", y = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} var p = {}; define(p, a, function () { return this; }); var d = Object.getPrototypeOf, v = d && d(d(values([]))); v && v !== r && n.call(v, a) && (p = v); var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p); function defineIteratorMethods(t) { ["next", "throw", "return"].forEach(function (e) { define(t, e, function (t) { return this._invoke(e, t); }); }); } function AsyncIterator(t, e) { function invoke(r, o, i, a) { var c = tryCatch(t[r], t, o); if ("throw" !== c.type) { var u = c.arg, h = u.value; return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) { invoke("next", t, i, a); }, function (t) { invoke("throw", t, i, a); }) : e.resolve(h).then(function (t) { u.value = t, i(u); }, function (t) { return invoke("throw", t, i, a); }); } a(c.arg); } var r; o(this, "_invoke", { value: function value(t, n) { function callInvokeWithMethodAndArg() { return new e(function (e, r) { invoke(t, n, e, r); }); } return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg(); } }); } function makeInvokeMethod(e, r, n) { var o = h; return function (i, a) { if (o === f) throw Error("Generator is already running"); if (o === s) { if ("throw" === i) throw a; return { value: t, done: !0 }; } for (n.method = i, n.arg = a;;) { var c = n.delegate; if (c) { var u = maybeInvokeDelegate(c, n); if (u) { if (u === y) continue; return u; } } if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) { if (o === h) throw o = s, n.arg; n.dispatchException(n.arg); } else "return" === n.method && n.abrupt("return", n.arg); o = f; var p = tryCatch(e, r, n); if ("normal" === p.type) { if (o = n.done ? s : l, p.arg === y) continue; return { value: p.arg, done: n.done }; } "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg); } }; } function maybeInvokeDelegate(e, r) { var n = r.method, o = e.iterator[n]; if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y; var i = tryCatch(o, e.iterator, r.arg); if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y; var a = i.arg; return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y); } function pushTryEntry(t) { var e = { tryLoc: t[0] }; 1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e); } function resetTryEntry(t) { var e = t.completion || {}; e.type = "normal", delete e.arg, t.completion = e; } function Context(t) { this.tryEntries = [{ tryLoc: "root" }], t.forEach(pushTryEntry, this), this.reset(!0); } function values(e) { if (e || "" === e) { var r = e[a]; if (r) return r.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) { var o = -1, i = function next() { for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next; return next.value = t, next.done = !0, next; }; return i.next = i; } } throw new TypeError(_typeof(e) + " is not iterable"); } return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", { value: GeneratorFunctionPrototype, configurable: !0 }), o(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: !0 }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) { var e = "function" == typeof t && t.constructor; return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name)); }, e.mark = function (t) { return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t; }, e.awrap = function (t) { return { __await: t }; }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () { return this; }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) { void 0 === i && (i = Promise); var a = new AsyncIterator(wrap(t, r, n, o), i); return e.isGeneratorFunction(r) ? a : a.next().then(function (t) { return t.done ? t.value : a.next(); }); }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () { return this; }), define(g, "toString", function () { return "[object Generator]"; }), e.keys = function (t) { var e = Object(t), r = []; for (var n in e) r.push(n); return r.reverse(), function next() { for (; r.length;) { var t = r.pop(); if (t in e) return next.value = t, next.done = !1, next; } return next.done = !0, next; }; }, e.values = values, Context.prototype = { constructor: Context, reset: function reset(e) { if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t); }, stop: function stop() { this.done = !0; var t = this.tryEntries[0].completion; if ("throw" === t.type) throw t.arg; return this.rval; }, dispatchException: function dispatchException(e) { if (this.done) throw e; var r = this; function handle(n, o) { return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o; } for (var o = this.tryEntries.length - 1; o >= 0; --o) { var i = this.tryEntries[o], a = i.completion; if ("root" === i.tryLoc) return handle("end"); if (i.tryLoc <= this.prev) { var c = n.call(i, "catchLoc"), u = n.call(i, "finallyLoc"); if (c && u) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } else if (c) { if (this.prev < i.catchLoc) return handle(i.catchLoc, !0); } else { if (!u) throw Error("try statement without catch or finally"); if (this.prev < i.finallyLoc) return handle(i.finallyLoc); } } } }, abrupt: function abrupt(t, e) { for (var r = this.tryEntries.length - 1; r >= 0; --r) { var o = this.tryEntries[r]; if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) { var i = o; break; } } i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null); var a = i ? i.completion : {}; return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a); }, complete: function complete(t, e) { if ("throw" === t.type) throw t.arg; return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y; }, finish: function finish(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y; } }, "catch": function _catch(t) { for (var e = this.tryEntries.length - 1; e >= 0; --e) { var r = this.tryEntries[e]; if (r.tryLoc === t) { var n = r.completion; if ("throw" === n.type) { var o = n.arg; resetTryEntry(r); } return o; } } throw Error("illegal catch attempt"); }, delegateYield: function delegateYield(e, r, n) { return this.delegate = { iterator: values(e), resultName: r, nextLoc: n }, "next" === this.method && (this.arg = t), y; } }, e; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _construct(t, e, r) { if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf(p, r.prototype), p; }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function viewer_toConsumableArray(r) { return viewer_arrayWithoutHoles(r) || viewer_iterableToArray(r) || viewer_unsupportedIterableToArray(r) || viewer_nonIterableSpread(); }
function viewer_nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function viewer_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return viewer_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? viewer_arrayLikeToArray(r, a) : void 0; } }
function viewer_iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function viewer_arrayWithoutHoles(r) { if (Array.isArray(r)) return viewer_arrayLikeToArray(r); }
function viewer_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }








var faceVisibleSwitcher = document.getElementById('faceVisibleSwitcher');
var wireframeVisibleSwitcher = document.getElementById('wireframeVisibleSwitcher');
var verticesVisibleSwitcher = document.getElementById('verticesVisibleSwitcher');
var axisVisibleSwitcher = document.getElementById('axisVisibleSwitcher');
var facesOpacitySlider = document.getElementById('facesOpacitySlider');
var wireframeAndVerticesDimSlider = document.getElementById('wireframeAndVerticesDimSlider');
var fileInput = document.getElementById('fileInput');
var scaleFactor, axis, solidGroup, facesGroup, wireframeGroup, verticesGroup;

// 初始化渲染器
var dpr = window.devicePixelRatio || 1;
var canvas = document.getElementById('polyhedronRenderer');
var renderer = new three_module/* WebGLRenderer */.JeP({
  antialias: true,
  powerPreference: "high-performance",
  canvas: canvas
});
var maxSize = Math.min(Math.min(window.innerWidth, window.innerHeight) - 16, 720);
renderer.setSize(maxSize * dpr, maxSize * dpr, false);
canvas.style.width = "".concat(maxSize, "px");
canvas.style.height = "".concat(maxSize, "px");
canvas.style.display = 'block';
window.addEventListener('resize', function () {
  var newMaxSize = Math.min(Math.min(window.innerWidth, window.innerHeight) - 16, 720);
  renderer.setSize(newMaxSize * dpr, newMaxSize * dpr, false);
  canvas.style.width = "".concat(newMaxSize, "px");
  canvas.style.height = "".concat(newMaxSize, "px");
});

// 添加场景
var scene = new three_core/* Scene */.Z58();
scene.background = new three_core/* Color */.Q1f(0x111111);

// 配置摄像头
var camera = new three_core/* PerspectiveCamera */.ubm(60, 1.0, 0.01, 500);
camera.position.z = 120;
var isPersp = true;

// 配置控制器
var controls = new TrackballControls/* TrackballControls */.V(camera, renderer.domElement);
controls.dynamicDampingFactor = 0.8;
controls.rotateSpeed = 4.0;
controls.maxDistance = 150.0;
controls.minDistance = 0.1;
controls.noPan = true;

// 渲染循环
renderer.setAnimationLoop(render);
function render() {
  controls.update();
  renderer.render(scene, camera);
}

//添加坐标轴
var axisLength = 100;
var cylinderRadius = 0.5;
var coneRadius = 1;
var coneHeight = 3;
var textSize = 5;
var textOffset = 5;

// 加载字体
function loadFontAsync(url) {
  return new Promise(function (resolve, reject) {
    var loader = new FontLoader/* FontLoader */.J();
    loader.load(url, function (font) {
      return resolve(font);
    }, undefined, function (error) {
      return reject(error);
    });
  });
}

// 创建材质
function createMaterial(color) {
  return new three_core/* MeshPhongMaterial */.tXL({
    color: color,
    shininess: 40
  });
}

// 创建坐标轴圆柱
function createAxis(color, rotationAxis, rotationAngle) {
  var geometry = new three_core/* CylinderGeometry */.Ho_(cylinderRadius, cylinderRadius, axisLength, 32);
  if (rotationAxis && rotationAngle) {
    if (rotationAxis[0] === 1) geometry.rotateX(rotationAngle);else if (rotationAxis[1] === 1) geometry.rotateY(rotationAngle);else if (rotationAxis[2] === 1) geometry.rotateZ(rotationAngle);
  }
  return new three_core/* Mesh */.eaF(geometry, createMaterial(color));
}

// 创建箭头
function createArrow(color, position, rotation) {
  var _mesh$position;
  var geometry = new three_core/* ConeGeometry */.qFE(coneRadius, coneHeight, 32);
  var mesh = new three_core/* Mesh */.eaF(geometry, createMaterial(color));
  (_mesh$position = mesh.position).set.apply(_mesh$position, viewer_toConsumableArray(position));
  if (rotation) mesh.setRotationFromEuler(_construct(three_core/* Euler */.O9p, viewer_toConsumableArray(rotation)));
  return mesh;
}

// 创建坐标轴标签
function createAxisLabel(text, color, font, position, axisDirection) {
  var _mesh$position2;
  var geometry = new TextGeometry/* TextGeometry */._(text, {
    font: font,
    size: textSize,
    depth: cylinderRadius * 2,
    curveSegments: 12
  });
  geometry.computeBoundingBox();
  geometry.center();
  var mesh = new three_core/* Mesh */.eaF(geometry, createMaterial(color));
  (_mesh$position2 = mesh.position).set.apply(_mesh$position2, viewer_toConsumableArray(position));
  if (axisDirection === 'y') {
    mesh.rotation.y = Math.PI / 4;
  } else if (axisDirection === 'z') {
    mesh.rotation.y = Math.PI / 2;
  }
  return mesh;
}

// 创建完整坐标轴系统
function createAxes(_x) {
  return _createAxes.apply(this, arguments);
}
function _createAxes() {
  _createAxes = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee3(scene) {
    var font, container, xAxis, xArrow, xLabel, yAxis, yArrow, yLabel, zAxis, zArrow, zLabel;
    return _regeneratorRuntime().wrap(function _callee3$(_context3) {
      while (1) switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return loadFontAsync(Sarasa_Mono_SC_Bold_typeface_namespaceObject);
        case 2:
          font = _context3.sent;
          container = new three_core/* Group */.YJl(); // X轴（红色）
          xAxis = createAxis(0xff0000, [0, 0, 1], Math.PI / 2); // X轴箭头
          xArrow = createArrow(0xff0000, [axisLength / 2, 0, 0], [0, 0, -Math.PI / 2]); // X轴标签
          _context3.next = 8;
          return createAxisLabel('X', 0xff0000, font, [axisLength / 2 + textOffset, 0, 0], 'x');
        case 8:
          xLabel = _context3.sent;
          // Y轴（绿色）
          yAxis = createAxis(0x00ff00); // Y轴箭头
          yArrow = createArrow(0x00ff00, [0, axisLength / 2, 0]); // Y轴标签
          _context3.next = 13;
          return createAxisLabel('Y', 0x00ff00, font, [0, axisLength / 2 + textOffset, 0], 'y');
        case 13:
          yLabel = _context3.sent;
          // Z轴（蓝色）
          zAxis = createAxis(0x0000ff, [1, 0, 0], Math.PI / 2); // Z轴箭头
          zArrow = createArrow(0x0000ff, [0, 0, axisLength / 2], [Math.PI / 2, 0, 0]); // Z轴标签
          _context3.next = 18;
          return createAxisLabel('Z', 0x0000ff, font, [0, 0, axisLength / 2 + textOffset], 'z');
        case 18:
          zLabel = _context3.sent;
          container.add(xAxis, xArrow, xLabel);
          container.add(yAxis, yArrow, yLabel);
          container.add(zAxis, zArrow, zLabel);
          scene.add(container);
          return _context3.abrupt("return", container);
        case 24:
        case "end":
          return _context3.stop();
      }
    }, _callee3);
  }));
  return _createAxes.apply(this, arguments);
}
_asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
  return _regeneratorRuntime().wrap(function _callee$(_context) {
    while (1) switch (_context.prev = _context.next) {
      case 0:
        _context.next = 2;
        return createAxes(scene);
      case 2:
        axis = _context.sent;
      case 3:
      case "end":
        return _context.stop();
    }
  }, _callee);
}))();

// 添加光源
var directionalLight = new three_core/* DirectionalLight */.ZyN(0xffffff);
directionalLight.position.set(0.5, 0.6, 0.4).normalize();
directionalLight.intensity = 7;
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);
var ambientLight = new three_core/* AmbientLight */.$p8(0x222222);
ambientLight.intensity = 100;
scene.add(ambientLight);
var backLight = new three_core/* DirectionalLight */.ZyN(0xddddea, 0.9);
backLight.intensity = 8;
backLight.position.set(-0.5, -0.6, -0.4).normalize();
backLight.castShadow = true;
backLight.shadow.mapSize.width = 2048;
backLight.shadow.mapSize.height = 2048;
scene.add(backLight);

// 创建边和顶点
function createWireframeAndVertices(edges) {
  var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
    _ref2$cylinderRadius = _ref2.cylinderRadius,
    cylinderRadius = _ref2$cylinderRadius === void 0 ? 1 : _ref2$cylinderRadius,
    _ref2$sphereRadiusMul = _ref2.sphereRadiusMultiplier,
    sphereRadiusMultiplier = _ref2$sphereRadiusMul === void 0 ? 2 : _ref2$sphereRadiusMul,
    cylinderMaterial = _ref2.cylinderMaterial,
    sphereMaterial = _ref2.sphereMaterial,
    _ref2$cylinderColor = _ref2.cylinderColor,
    cylinderColor = _ref2$cylinderColor === void 0 ? 0xC0C0C0 : _ref2$cylinderColor,
    _ref2$sphereColor = _ref2.sphereColor,
    sphereColor = _ref2$sphereColor === void 0 ? 0xffd700 : _ref2$sphereColor;
  var defaultCylinderMaterial = cylinderMaterial || new three_core/* MeshStandardMaterial */._4j({
    color: cylinderColor,
    metalness: 1.0,
    roughness: 0.4
  });
  var defaultSphereMaterial = sphereMaterial || new three_core/* MeshStandardMaterial */._4j({
    color: sphereColor,
    metalness: 1.0,
    roughness: 0.5
  });
  var wireframeGroup = new three_core/* Group */.YJl();
  var verticesGroup = new three_core/* Group */.YJl();
  var uniquePoints = new Set();
  var sphereRadius = cylinderRadius * sphereRadiusMultiplier;
  edges.forEach(function (_ref3) {
    var _ref4 = viewer_slicedToArray(_ref3, 2),
      start = _ref4[0],
      end = _ref4[1];
    var startKey = "".concat(start.x, ",").concat(start.y, ",").concat(start.z);
    var endKey = "".concat(end.x, ",").concat(end.y, ",").concat(end.z);
    var startVec = new three_core/* Vector3 */.Pq0(start.x, start.y, start.z);
    var endVec = new three_core/* Vector3 */.Pq0(end.x, end.y, end.z);
    var direction = new three_core/* Vector3 */.Pq0().subVectors(endVec, startVec);
    var length = direction.length();
    var cylinder = new three_core/* Mesh */.eaF(new three_core/* CylinderGeometry */.Ho_(cylinderRadius, cylinderRadius, length, 8, 1, false), defaultCylinderMaterial);
    cylinder.quaternion.setFromUnitVectors(new three_core/* Vector3 */.Pq0(0, 1, 0), direction.clone().normalize());
    cylinder.position.copy(new three_core/* Vector3 */.Pq0().addVectors(startVec, endVec).multiplyScalar(0.5));
    wireframeGroup.add(cylinder);
    if (!uniquePoints.has(startKey)) {
      var sphere = new three_core/* Mesh */.eaF(new three_core/* SphereGeometry */.Gu$(sphereRadius, 16, 16), defaultSphereMaterial);
      sphere.position.copy(startVec);
      verticesGroup.add(sphere);
      uniquePoints.add(startKey);
    }
    if (!uniquePoints.has(endKey)) {
      var _sphere = new three_core/* Mesh */.eaF(new three_core/* SphereGeometry */.Gu$(sphereRadius, 16, 16), defaultSphereMaterial);
      _sphere.position.copy(endVec);
      verticesGroup.add(_sphere);
      uniquePoints.add(endKey);
    }
  });
  return {
    wireframeGroup: wireframeGroup,
    verticesGroup: verticesGroup
  };
}

// 修改材质属性
function changeMaterialProperty(group, propertyName, newValue) {
  group.traverse(function (child) {
    if (child.isMesh && child.material) {
      if (!Array.isArray(child.material)) {
        child.material[propertyName] = newValue;
        child.material.needsUpdate = true;
      } else {
        var _iterator = viewer_createForOfIteratorHelper(child.material),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var _material = _step.value;
            _material[propertyName] = newValue;
            _material.needsUpdate = true;
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
    }
  });
}

// 修改球体半径
function changeSpheresRadius(group, newRadius) {
  group.children.forEach(function (child) {
    if (child instanceof three_core/* Mesh */.eaF && child.geometry instanceof three_core/* SphereGeometry */.Gu$) {
      child.geometry.dispose();
      child.geometry = new three_core/* SphereGeometry */.Gu$(newRadius, child.geometry.parameters.widthSegments, child.geometry.parameters.heightSegments);
    }
  });
}

// 修改圆柱半径
function changeCylindersRadius(group, newRadius) {
  group.traverse(function (child) {
    if (child.isMesh && child.geometry instanceof three_core/* CylinderGeometry */.Ho_) {
      var oldGeo = child.geometry;
      child.geometry.dispose();
      child.geometry = new three_core/* CylinderGeometry */.Ho_(newRadius, newRadius, oldGeo.parameters.height, oldGeo.parameters.radialSegments, oldGeo.parameters.heightSegments, oldGeo.parameters.openEnded);
    }
  });
}

// 加载模型
function loadMesh(meshData, material) {
  var container = new three_core/* Object3D */.B69();
  var geometry = new three_core/* BufferGeometry */.LoY();
  var vertices = new Float32Array(meshData.vertices.length * 3);
  meshData.vertices.forEach(function (v, i) {
    vertices[i * 3] = v.x;
    vertices[i * 3 + 1] = v.y;
    vertices[i * 3 + 2] = v.z;
  });
  geometry.setAttribute('position', new three_core/* BufferAttribute */.THS(vertices, 3));
  var indices = [];
  meshData.faces.forEach(function (face) {
    if (face.length === 3) indices.push.apply(indices, viewer_toConsumableArray(face));
  });
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  var mesh = new three_core/* Mesh */.eaF(geometry, material);
  mesh.material.side = three_core/* DoubleSide */.$EB;
  geometry.computeBoundingBox();
  var aabb = geometry.boundingBox;
  var objSize = aabb.max.sub(aabb.min).length();
  var scaleFactor = 100 / objSize;
  var _createWireframeAndVe = createWireframeAndVertices(meshData.edges, {
      cylinderRadius: 0.5 / scaleFactor
    }),
    wireframeGroup = _createWireframeAndVe.wireframeGroup,
    verticesGroup = _createWireframeAndVe.verticesGroup;
  container.add(mesh);
  container.add(wireframeGroup);
  container.add(verticesGroup);
  container.scale.setScalar(scaleFactor);
  scene.add(container);
  render();
  return {
    scaleFactor: scaleFactor,
    solidGroup: container,
    facesGroup: mesh,
    wireframeGroup: wireframeGroup,
    verticesGroup: verticesGroup
  };
}

// 加载 OFF
function loadMeshFromOffData(data, material) {
  var mesh = parseOFF(data);
  var processedMesh = processMeshData(mesh);
  var _loadMesh = loadMesh(processedMesh, material);
  scaleFactor = _loadMesh.scaleFactor;
  solidGroup = _loadMesh.solidGroup;
  facesGroup = _loadMesh.facesGroup;
  wireframeGroup = _loadMesh.wireframeGroup;
  verticesGroup = _loadMesh.verticesGroup;
}
function loadMeshFromUrl(url, material) {
  return new Promise(function (resolve, reject) {
    fetch(url).then(function (response) {
      if (!response.ok) {
        throw new Error('网络响应不正常');
      }
      return response.text();
    }).then(function (data) {
      loadMeshFromOffData(data, material);
      resolve();
    });
  });
}

// 释放组
function disposeGroup(group) {
  group.traverse(function (child) {
    if (child.isMesh) {
      var _child$geometry, _child$material;
      (_child$geometry = child.geometry) === null || _child$geometry === void 0 || _child$geometry.dispose();
      (_child$material = child.material) === null || _child$material === void 0 || _child$material.dispose();
    }
  });
  group.clear();
}
var material = new three_core/* MeshPhongMaterial */.tXL({
  color: 0x555555,
  specular: 0x222222,
  shininess: 50,
  flatShading: true
});
loadMeshFromUrl(tri_namespaceObject, material);

// 事件监听
function updateProperties() {
  changeMaterialProperty(facesGroup, 'visible', faceVisibleSwitcher.checked);
  changeMaterialProperty(wireframeGroup, 'visible', wireframeVisibleSwitcher.checked);
  changeMaterialProperty(verticesGroup, 'visible', verticesVisibleSwitcher.checked);
  changeMaterialProperty(axis, 'visible', axisVisibleSwitcher.checked);
  changeMaterialProperty(facesGroup, 'transparent', true);
  changeMaterialProperty(facesGroup, 'opacity', +facesOpacitySlider.value);
  changeCylindersRadius(wireframeGroup, +wireframeAndVerticesDimSlider.value / scaleFactor);
  changeSpheresRadius(verticesGroup, +wireframeAndVerticesDimSlider.value / scaleFactor * 2);
}
faceVisibleSwitcher.addEventListener('change', updateProperties);
wireframeVisibleSwitcher.addEventListener('change', updateProperties);
verticesVisibleSwitcher.addEventListener('change', updateProperties);
axisVisibleSwitcher.addEventListener('change', updateProperties);
facesOpacitySlider.addEventListener('input', updateProperties);
wireframeAndVerticesDimSlider.addEventListener('input', updateProperties);
fileInput.addEventListener('change', function (e) {
  var file = e.target.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = /*#__PURE__*/function () {
    var _ref5 = _asyncToGenerator(/*#__PURE__*/_regeneratorRuntime().mark(function _callee2(e) {
      var data, material;
      return _regeneratorRuntime().wrap(function _callee2$(_context2) {
        while (1) switch (_context2.prev = _context2.next) {
          case 0:
            data = e.target.result;
            if (solidGroup) {
              disposeGroup(solidGroup);
              scene.remove(solidGroup);
            }
            material = new three_core/* MeshPhongMaterial */.tXL({
              color: 0x555555,
              specular: 0x222222,
              shininess: 50,
              flatShading: true
            });
            loadMeshFromOffData(data, material);
            updateProperties();
          case 5:
          case "end":
            return _context2.stop();
        }
      }, _callee2);
    }));
    return function (_x2) {
      return _ref5.apply(this, arguments);
    };
  }();
  reader.readAsText(file);
});
;// ./src/index.js



/***/ }),

/***/ 208:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(601);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(314);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `body {
    margin: 8px;
}

.button {
    background-color: #049DD9;
    border: none;
    color: white;
    padding: 8px 12px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 18px;
    border-radius: 6px;
    user-select: none;
    border: 1px solid black;
    font-family: Verdana, sans-serif;
    margin: 4px;
    width: 120px;
}
.button:hover {
    background-color: #0477BF;
}
.button:active {
    background-color: #0468BF;
    transform: translateY(1px);
}

.dropdown {
    position: relative;
    display: inline-block;
}
.dropdown:hover .dropdown-content {
    display: block;
}
.dropdown-content {
    display: none;
    bottom: 100%;
    position: absolute;
    margin: -4px 4px;
    border-radius: 8px;
    border: 1px solid black;
    text-align: center;
    background-color: #049DD9;
    min-width: 120px;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 1;
}
.dropdown-content div {
    padding: 4px 8px;
    color: white;
    font-size: 18px;
    font-family: Verdana, sans-serif;
    text-decoration: none;
    display: block;
    user-select: none;
}
.dropdown-content div:hover {
    background-color: #0477BF;
    border-radius: 8px;
}

#mapText {
    position: absolute;
    top: 16px;
    left: 16px;
    color: white;
    font-size: 20px;
    user-select: none;
}`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT')
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && (!scriptUrl || !/^http(s?):/.test(scriptUrl))) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/^blob:/, "").replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl + "../";
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			57: 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunk"] = self["webpackChunk"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, [96], () => (__webpack_require__(73)))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;