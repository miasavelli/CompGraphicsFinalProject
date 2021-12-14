"use strict";
import {GLTFLoader} from 'https://unpkg.com/three@0.120.0/examples/jsm/loaders/GLTFLoader.js';


let container;      	        // keeping here for easy access
let scene, camera, renderer;    // Three.js rendering basics.
let gun;                        // The gun, which can be "aimed" by the mouse.
let gunbase;                    // The cylinder at the base of the gun; the gun is a child of this cylinder.
let ray;                        // A yellow "ray" from the barrel of the gun.
let rayVector;                  // The gun and the ray point from (0,0,0) towards this vector
                                //        (in the local coordinate system of the gunbase).
let gunRotateY = 0;             // Amount by which gun is rotated around the y-axis
                                //    (carrying the camera with it).
let raycaster = new THREE.Raycaster();

let objects = [];
let denimMap;
let bullet;
let score;
let storyCounter = 0; // dialogue purposeds

var loader = new GLTFLoader();
let testModels = [];
let testModels1 = [];
let testModels2 = [];

let testDressModel = [];

// constants
let testBodyModel = [];
let testHairModel = [];

let inputMaterial;


var story = ["Time to get ready for school. I can't be seen in public in my pajamas!",
    "You! Can you help me? I have literally NOTHING to wear.",
    " *Dress me!* ",
    " ",
    "I look awesome! What material should I wear?",
    " Denim - left arrow or plaid - right arrow?",
    " " ,
    "Thanks for your help!"];


/**
 *  Creates a scene that looks like a bedroom.
 */
function createWorld() {


    loader.load(
        // resource URL
        'models/modelDraft.gltf',
        // called when the resource is loaded
        function ( gltf ) {
            testBodyModel.push(gltf.scene.children[0]);
            testBodyModel[0].position.set(0,-8,25);
            testBodyModel[0].scale.set(6,6,6);
            testBodyModel[0].name = "body";
            testBodyModel[0].material = new THREE.MeshPhongMaterial( { color: 'tan', side: THREE.DoubleSide } );
            //testModels[0].rotateY( 70 * Math.PI / 180 );
            testBodyModel[0].castShadow = true;
            scene.add(testBodyModel[0]);
        }
    );
    loader.load(
        // resource URL
        'models/hair.gltf',
        // called when the resource is loaded
        function ( gltf ) {
            testHairModel.push(gltf.scene.children[0]);
            testHairModel[0].position.set(0,-8,25);
            testHairModel[0].scale.set(6,6,6);
            testHairModel[0].name = "hair";
            testHairModel[0].material = new THREE.MeshPhongMaterial( { color: '#bc8b37', side: THREE.DoubleSide } );
            testHairModel[0].castShadow = true;
            scene.add(testHairModel[0]);
        }
    );

    renderer.setClearColor(0xffffff, 1);  // white background
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);

    /* Add the camera and a light to the scene, linked into one object. */
    let light = new THREE.DirectionalLight();
    light.position.set(0, 0, 1);
    camera.position.set(0, 40, 100);
    camera.rotation.x = -Math.PI / 9; //camera looks down a bit
    camera.add(light);
    scene.add(new THREE.DirectionalLight(0x808080));

    let ground = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 110),
        new THREE.MeshLambertMaterial({
            color: "white",
            map: makeTexture("textures/rug.jpg")
        })
    );

    let wall1 = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 80),
        new THREE.MeshBasicMaterial({
            color: "tan",
        })
    );


    let wall2 = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 80),
        new THREE.MeshBasicMaterial({
            color: "lightpink",
            // map: makeTexture("textures/rug.jpg")
        })
    );
    let wall3 = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 80),
        new THREE.MeshBasicMaterial({
            color: "lightpink",
            // map: makeTexture("textures/rug.jpg")
        })
    );
    wall1.position.y = 35;
    wall2.position.y = 35;
    wall3.position.y = 35;

    wall2.rotation.y = -Math.PI / 2;
    wall3.rotation.y = Math.PI / 2;

    wall2.position.x = 50;
    wall3.position.x = -50;

    wall1.position.z = -50;

    scene.add(wall1);
    scene.add(wall2);
    scene.add(wall3);


    ground.rotation.x = -Math.PI/2;
    ground.position.y = -8;
    scene.add(ground);

    let gunmat = new THREE.MeshLambertMaterial({
        color: 0xaaaaff
    });
    gun = new THREE.Mesh(new THREE.SphereGeometry(1.5,16,8),gunmat);
    let barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.0,0.0,0,0), gunmat);
    barrel.position.y = 2.5;
    //gun.add(barrel);
    gunbase = new THREE.Mesh(new THREE.CylinderGeometry(0,0,0.0,0), gunmat);

    bullet = new THREE.Mesh( new THREE.SphereGeometry(.01, 0, 0 ), gunmat );
    bullet.position.x = 0;
    bullet.position.y = 0;

    scene.add( bullet );


    let linegeom = new THREE.Geometry();
    linegeom.vertices.push(new THREE.Vector3(0,0,0));
    linegeom.vertices.push(new THREE.Vector3(0,100,0));
    ray = new THREE.Line( linegeom, new THREE.LineDashedMaterial( { color: 0xff69b4, dashSize: 5, gapSize: 5} ));
    ray.computeLineDistances();

    //gunbase.add(ray);
    gunbase.add(camera);
    // gunbase.add(gun);
    scene.add(gunbase);

    raycaster = new THREE.Raycaster( new THREE.Vector3(0,0,0), new THREE.Vector3(0,1,0) );
} // end createWorld


/**
 *  When an animation is in progress, this function is called just before rendering each
 *  frame of the animation.
 */
function updateForFrame() {

    if (storyCounter > 7) {
        storyCounter = 7;
    }
    let d;



    let textureMap = new THREE.TextureLoader().load( 'textures/knit.jpeg' );
    textureMap.wrapS = textureMap.wrapT = THREE.RepeatWrapping;
    textureMap.anisotropy = 16;
    textureMap.encoding = THREE.sRGBEncoding;



    loader.load(
        // resource URL
        'models/WholePajamas.gltf',
        // called when the resource is loaded
        function ( gltf ) {
            testModels.push(gltf.scene.children[0]);
            testModels[0].position.set(0,-7,25);
            testModels[0].scale.set(6,6,6);
            testModels[0].name = "outfit";
            testModels[0].material = new THREE.MeshPhongMaterial( { color: 'skyblue', map: textureMap, side: THREE.DoubleSide } );
            testModels[0].castShadow = true;
            scene.add(testModels[0]);
        }
    );




    if (storyCounter < 3) {



    } else {

        var selectedObject = scene.getObjectByName("outfit");
        scene.remove( selectedObject );

        //selectedObject.position.z=50;

        loader.load(
            // resource URL
            'models/NewTop.gltf',
            // called when the resource is loaded
            function ( gltf ) {
                testModels1.push(gltf.scene.children[0]);
                testModels1[0].position.set(0,-8,25);
                testModels1[0].scale.set(6,6,6);
                testModels1[0].material = new THREE.MeshPhongMaterial( { color: 'black', side: THREE.DoubleSide } );
                //testModels[0].rotateY( 70 * Math.PI / 180 );
                testModels1[0].castShadow = true;
                scene.add(testModels1[0]);
            }
        );

        loader.load(
            // resource URL
            'models/NewDress.gltf',
            // called when the resource is loaded
            function ( gltf ) {
                testDressModel.push(gltf.scene.children[0]);
                testDressModel[0].position.set(0,-7.8,25);
                testDressModel[0].scale.set(6,6,6);
                testDressModel[0].material = new THREE.MeshPhongMaterial( { color: 'gray', map: inputMaterial, side: THREE.DoubleSide } );
                //testModels[0].rotateY( 70 * Math.PI / 180 );
                testDressModel[0].castShadow = true;
                scene.add(testDressModel[0]);
            }
        );
    }


    document.getElementById("dialog").innerHTML = "" + story[storyCounter];
    // $('#dialog').prepend('<div id="arrow"></div>');

    //d.prepend('<div id="arrow"></div>');

    // add input
    //document.getElementById("#dialog").innerHTML = "" + story[0];

}

var hit = null;
function newhit(obj) {
    if (obj != hit) {
        if (hit != null) {
            hit.material.color.set(0xff69b4);
            hit.material.needsUpdate = true;
        }
        if (obj != null) {
            obj.material.color.set(0xff0000);
            obj.material.needsUpdate = true;
        }
        hit = obj;
    }
}

/**
 *  Render the scene.  This is called for each frame of the animation, after updating
 *  the position and velocity data of the balls.
 */
function render() {
    renderer.render(scene, camera);
}

/**
 *  Creates a CubeTexture and starts loading the images.
 *  filenames must be an array containing six strings that
 *  give the names of the files for the positive x, negative x,
 *  positive y, negative y, positive z, and negative z
 *  images in that order.  path, if present, is pre-pended
 *  to each of the filenames to give the full path to the
 *  files.  No error checking is done here, and no callback
 *  function is implemented.  When the images are loaded, the
 *  texture will appear on the objects on which it is used
 *  in the next frame of the animation.
 */
function makeCubeTexture(filenames, path) {
    var URLs;
    if (path) {
        URLs = [];
        for (var i = 0; i < 6; i++)
            URLs.push( path + filenames[i] );
    }
    else {
        URLs = filenames;
    }
    var loader = new THREE.CubeTextureLoader();
    var texture = loader.load(URLs);
    return texture;
}

/**
 *  Creates and returns a Texture object that will read its image from the
 *  specified URL. If the second parameter is provided, the texture will be
 *  applied to the material when the
 */
function makeTexture( imageURL, material ) {
    function callback() {
        if (material) {
            material.map = texture;
            material.needsUpdate = true;
        }
    }
    let loader = new THREE.TextureLoader();
    let texture = loader.load(imageURL, callback);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat = new THREE.Vector2(10,10);
    texture.anisotropy = renderer.getMaxAnisotropy();
    return texture;
}
//----------------------------- mouse and key support -------------------------------
function doMouseDown(evt) {
    let fn = "[doMouseDown]: ";
    console.log( fn );

    let x = evt.clientX;
    let y = evt.clientY;
    console.log("Clicked mouse at " + x + "," + y);


    storyCounter++;
}



function doKeyDown( event ) {
    let fn = "[doKeyDown]: ";
    console.log( fn + "Key pressed with code " + event.key );
    // https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes

    const code = event.key;
    // console.log("Key pressed with code " + code);
    let rot = 0;
    if ( code === 'a' ) {
        if (storyCounter < 3) {
            var selectedObjectBody = scene.getObjectByName("body");
            var selectedObjectHair = scene.getObjectByName("hair");
            var selectedObject = scene.getObjectByName("outfit");
            selectedObject.rotateY(Math.PI / 2);
            selectedObjectBody.rotateY(Math.PI / 2);
            selectedObjectHair.rotateY(Math.PI / 2);
        } else {
            // var selectedObject = scene.getObjectByName("newFit");
            // scene.getObjectByName("newFit2").selectedObject.rotateY(-Math.PI / 2);
            // selectedObject.rotateY(Math.PI / 2);
        }



    }
    else if ( code === 'd' ) { // 'd' and 'right arrow'

        if (storyCounter < 3) {
            var selectedObjectBody = scene.getObjectByName("body");
            var selectedObjectHair = scene.getObjectByName("hair");
            var selectedObject = scene.getObjectByName("outfit");
            selectedObject.rotateY(-Math.PI / 2);
            selectedObjectBody.rotateY(-Math.PI / 2);
            selectedObjectHair.rotateY(-Math.PI / 2);
        } else {
            // var selectedObject = scene.getObjectByName("newFit");
            // scene.getObjectByName("newFit2").selectedObject.rotateY(-Math.PI / 2);
            // selectedObject.rotateY(-Math.PI / 2);
        }

    }

    if (storyCounter == 5) {
        if (code === 'ArrowLeft') {

            denimMap = new THREE.TextureLoader().load( 'textures/den.jpg' );
            denimMap.wrapS = denimMap.wrapT = THREE.RepeatWrapping;
            denimMap.anisotropy = 16;
            denimMap.encoding = THREE.sRGBEncoding;
            inputMaterial = denimMap;
            score = 100;
            story[6] ="I love my denim dress!";

        } else if (code === 'ArrowRight') {
            denimMap = new THREE.TextureLoader().load( 'textures/interesting.jpg' );
            denimMap.wrapS = denimMap.wrapT = THREE.RepeatWrapping;
            denimMap.anisotropy = 16;
            denimMap.encoding = THREE.sRGBEncoding;
            inputMaterial = denimMap;
            score = 0;
            story[6] ="Hmmm.. this is just all right.";

        }
    }

    if ( event.shiftKey )                                  // 'shift'
        rot *= 5;
    if ( rot !== 0 ) {
        gunRotateY += rot;
        gunbase.rotation.y = gunRotateY;
        //event.stopPropagation();          // *** MH

    }
}


//--------------------------- animation support -----------------------------------

let clock;  // Keeps track of elapsed time of animation.

function doFrame() {
    updateForFrame();
    render();
    requestAnimationFrame(doFrame);
}

//----------------------- respond to window resizing -------------------------------

/* When the window is resized, we need to adjust the aspect ratio of the camera.
 * We also need to reset the size of the canvas that used by the renderer to
 * match the new size of the window.
 */
function doResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); // Need to call this for the change in aspect to take effect.
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function createRenderer() {
    //renderer = new THREE.WebGLRenderer();
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    // we set this according to the div container.
    renderer.setSize( container.clientWidth, container.clientHeight );
    renderer.setClearColor( 0x000000, 1.0 );
    container.appendChild( renderer.domElement );  // adding 'canvas; to container here
    // render, or 'create a still image', of the scene
}
//----------------------------------------------------------------------------------

/**
 *  This init() function is called when by the onload event when the document has loaded.
 */
function init() {
    container = document.querySelector('#scene-container');

    // Create & Install Renderer ---------------------------------------
    createRenderer();

    window.addEventListener( 'resize', doResize );  // Set up handler for resize event
    document.addEventListener("keydown",doKeyDown);
    window.addEventListener(    "mousedown",doMouseDown );
    // window.addEventListener(    "mousemove",doMouseMove );

    createWorld();

    clock = new THREE.Clock(); // For keeping time during the animation.

    requestAnimationFrame(doFrame);  // Start the animation.


}





init();


