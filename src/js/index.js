import '../styles/index.scss'
import * as THREE from 'three'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'
import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'

const OBJLoaderExample = function ( elementToBindTo ) {
  this.renderer = null;
  this.canvas = elementToBindTo;
  this.aspectRatio = 1;
  this.recalcAspectRatio();

  this.scene = null;
  this.cameraDefaults = {
    posCamera: new THREE.Vector3( 0.0, 175.0, 500.0 ),
    posCameraTarget: new THREE.Vector3( 0, 0, 0 ),
    near: 0.1,
    far: 10000,
    fov: 45
  };

  this.camera = null;
  this.cameraTarget = this.cameraDefaults.posCameraTarget;

  this.controls = null;

  this.mouse = new THREE.Vector2();
  this.INTERSECTED = null;
  this.raycaster = null;
};

OBJLoaderExample.prototype = {

  constructor: OBJLoaderExample,

  initGL: function () {
    this.renderer = new THREE.WebGLRenderer( {
      canvas: this.canvas,
      antialias: true,
      autoClear: true
    } );
    this.renderer.setClearColor( 0x000000 );

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera( this.cameraDefaults.fov, this.aspectRatio, this.cameraDefaults.near, this.cameraDefaults.far );
    this.resetCamera();
    this.controls = new TrackballControls( this.camera, this.renderer.domElement );

    this.raycaster = new THREE.Raycaster();

    let ambientLight = new THREE.AmbientLight( new THREE.Color('rgb(115, 153, 253)') );
    this.scene.add( ambientLight );

  },

  initContent: function () {
    let scope = this;
    let manager = new THREE.LoadingManager();
    manager.addHandler( /\.dds$/i, new DDSLoader() );
    let objLoader = new OBJLoader(manager)
    new MTLLoader(manager).setPath('../static/obj/').load('sy3.mtl', (materials) => {
      materials.preload()
      for (const key in materials.materials) {
        if (materials.materials[key] && materials.materials[key].transparent) {
          // materials.materials[key].transparent = false
        }
      }
      objLoader.setMaterials(materials)
      objLoader.load('../static/obj/sy3.obj', (object) => {
        console.log(object)
        scope.scene.add(object);
      }, scope._reportProgress, function () {} );
    });
  },

  _reportProgress: function (xhr) {
    if (xhr.lengthComputable) {
      const percentComplete = xhr.loaded / xhr.total * 100;
      console.log( Math.round( percentComplete, 2 ) + '% downloaded' );
    }
  },

  resizeDisplayGL: function () {
    this.controls.handleResize();

    this.recalcAspectRatio();
    this.renderer.setSize( this.canvas.offsetWidth, this.canvas.offsetHeight, false );

    this.updateCamera();
  },

  handleMouseMove: function (event) {
    this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  },

  recalcAspectRatio: function () {
    this.aspectRatio = (this.canvas.offsetHeight === 0) ? 1 : this.canvas.offsetWidth / this.canvas.offsetHeight;
  },

  resetCamera: function () {
    this.camera.position.copy( this.cameraDefaults.posCamera );
    this.cameraTarget.copy( this.cameraDefaults.posCameraTarget );

    this.updateCamera();
  },

  updateCamera: function () {
    this.camera.aspect = this.aspectRatio;
    this.camera.lookAt( this.cameraTarget );
    this.camera.updateProjectionMatrix();
  },

  render: function () {
    if ( !this.renderer.autoClear ) this.renderer.clear();
    this.raycaster.setFromCamera( this.mouse, this.camera );
    let intersects = this.raycaster.intersectObjects( this.scene.children );
    if ( intersects.length > 0 ) {
      console.log(intersects)
    }
    this.controls.update();
    this.renderer.render( this.scene, this.camera );
  }
};

let app = new OBJLoaderExample( document.getElementById( 'example' ) );

let resizeWindow = function () {
  app.resizeDisplayGL();
};

let onDocumentMouseMove = function (event) {
  event.preventDefault();
  app.handleMouseMove(event)
}

let render = function () {
  requestAnimationFrame( render );
  app.render();
};

window.addEventListener( 'resize', resizeWindow, false );
document.addEventListener( 'mousemove', onDocumentMouseMove, false );

console.log( 'Starting initialisation phase...' );
app.initGL();
app.resizeDisplayGL();
app.initContent();

render();