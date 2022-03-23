import { translationMatrix, scaleMatrix, matrixMult, rotationMatrix, projectionMatrix } from './math.js';
import { webglCreateShaderProgram } from './utils.js';
import { getCube, getHollowCube, parserObjFile } from './model.js';
import { tetrahedral_obj, icosahedron_obj, cube_obj } from './builtin-obj-models.js';
import { m4 } from './matUtils.js';


var state;
var transformMatrix;

function setDefaultState() {
    state = {
        model: getHollowCube(),

        transformation: {
            translation: [0, 0, 0],
            rotation   : [0, 0, 0],
            scale      : [1, 1, 1]
        },

        view: {
            eye   : [0, 0, 0],
            center: [0, 0, 0],
            up    : [0, 0, 1]
        }
    };
}


function computeTransformMatrix() {
    var transformMatrix;
    var translation = state.transformation.translation;
    var scale       = state.transformation.scale;
    var rotation    = state.transformation.rotation;

    transformMatrix = scaleMatrix(scale[0], scale[1], scale[2]);
    transformMatrix = matrixMult(rotationMatrix(rotation[0], rotation[1], rotation[2]), transformMatrix);
    transformMatrix = matrixMult(translationMatrix(translation[0], translation[1], translation[2]), transformMatrix);
    return transformMatrix;
}


function main() {
    // Variable for eye position, center position and up vector
    var eye = [0, 0, 0];
    var center = [0, 0, 0];
    var up = [0, 0, 1];

    // Helper function
    async function callbackFile(e) {
        var file = e.target.files[0];
        if (!file) {
            console.log("File not found");
            return;
        }

        var reader = new FileReader();
        reader.onload = function (e) {
            model = parserObjFile(e.target.result);
        };
        reader.readAsText(file);
    }

    setDefaultState();
    setUIEventListener();
    // Add listener for reset button
    document.getElementById("reset").addEventListener("click", function () {
        model = getHollowCube();
        transformMatrix = m4.identity();

        // Idle animation parameter
        // Asumsi requestAnimationFrame hingga 60 calls per sec
        rot_increment = [0, 0, 0];
        trans_increment = [0, 0, 0];
        scale_increment = [0.8, 0.8, 0.8];

        // Initial transformation matrix
        transformMatrix = m4.identity();
        cameraMatrix = m4.identity();
        eye = [0, 0, 0];
        up = [0, 1, 0];
        center = [0, 0, 0];
        render();
    });

    // Add listener for slider change in eye-x position
    document.getElementById("eye-x").oninput = function () {
        // print the value of the input
        this.nextElementSibling.value = this.value;
        eye[0] = parseFloat(this.value);
        cameraMatrix = m4.lookAt(eye, center, up);
        render();
        //console.log(eye[0]);
    };

    document.getElementById("eye-y").oninput = function () {
        // print the value of the input
        this.nextElementSibling.value = this.value;
        eye[1] = parseFloat(this.value);
        cameraMatrix = m4.lookAt(eye, center, up);
        render();
        //console.log(eye[1]);
    };

    document.getElementById("eye-z").oninput = function () {
        // print the value of the input
        this.nextElementSibling.value = this.value;
        eye[2] = parseFloat(this.value);
        cameraMatrix = m4.lookAt(eye, center, up);
        render();
        //console.log(eye[2]);
    };

    document.getElementById("center-x").oninput = function () {
        // print the value of the input
        this.nextElementSibling.value = this.value;
        center[0] = parseFloat(this.value);
        cameraMatrix = m4.lookAt(eye, center, up);
        render();
        //console.log(center[0]);
    };

    document.getElementById("center-y").oninput = function () {
        // print the value of the input
        this.nextElementSibling.value = this.value;
        center[1] = parseFloat(this.value);
        cameraMatrix = m4.lookAt(eye, center, up);
        render();
        //console.log(center[1]);
    };

    document.getElementById("center-z").oninput = function () {
        // print the value of the input
        this.nextElementSibling.value = this.value;
        center[2] = parseFloat(this.value);
        cameraMatrix = m4.lookAt(eye, center, up);
        render();
        //console.log(center[2]);
    };

    document.getElementById("up-x").oninput = function () {
        // print the value of the input
        this.nextElementSibling.value = this.value;
        up[0] = parseFloat(this.value);
        cameraMatrix = m4.lookAt(eye, center, up);
        render();
        //console.log(up[0]);
    };

    document.getElementById("up-y").oninput = function () {
        // print the value of the input
        this.nextElementSibling.value = this.value;
        up[1] = parseFloat(this.value);
        cameraMatrix = m4.lookAt(eye, center, up);
        render();
        //console.log(up[1]);
    };

    document.getElementById("up-z").oninput = function () {
        // print the value of the input
        this.nextElementSibling.value = this.value;
        up[2] = parseFloat(this.value);
        cameraMatrix = m4.lookAt(eye, center, up);
        render();
        //console.log(up[2]);
    };

    // Reset button
    document.getElementById("reset").addEventListener("click", () => {
        rot_increment = [0, 0, 0];
        trans_increment = [0, 0, 0];
        scale_increment = [0.8, 0.8, 0.8];
        transformMatrix =  m4.identity();
        render();
    });

    function callbackModel(e) {
        var selectedModelRadio = document.querySelector("input[name='bentuk']:checked").value;
        switch (selectedModelRadio) {
            case "tetrahedral":
                model = parserObjFile(tetrahedral_obj, true);
                render();
                break;
            case "cube":
                model = parserObjFile(cube_obj, true);
                render();
                break;
            case "icosahedron":
                model = parserObjFile(icosahedron_obj, true);
                render();
                break;
        }
    }

    document.getElementById('obj-input').addEventListener('change', callbackFile, false);
    document.forms["model"].elements["bentuk"].forEach((item, i) => {
        item.onclick = callbackModel;
    });

    // -- Get model --
    // TODO : Update
    var model = getHollowCube();

    // Idle animation parameter
    // Asumsi requestAnimationFrame hingga 60 calls per sec
    var rot_increment = [0, 0, 0];
    var trans_increment = [0, 0, 0];
    var scale_increment = [0.8, 0.8, 0.8];

    // Initial transformation matrix
    var transformMatrix = m4.identity();
    var cameraMatrix = m4.identity();

    // -- Ritual WebGL Create Program --
    const canvas = document.getElementById('canvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        alert('Browsermu jelek');
        return;
    }

    var shaderProgram = webglCreateShaderProgram(gl, 'vertex-shader-3d', 'fragment-shader-3d');

    gl.useProgram(shaderProgram);

    // -- Create buffer & pointer --
    var vertexBuffer = gl.createBuffer();
    var indexBuffer  = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    var coordLoc           = gl.getAttribLocation(shaderProgram, "coordinates");
    var transformMatrixLoc = gl.getUniformLocation(shaderProgram, "transformationMatrix");
    var colorLoc           = gl.getUniformLocation(shaderProgram, "userColor");
    // var modelViewMatrixLoc = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

    window.requestAnimationFrame(render);



    function render() {
        // Idle animation
        // transformMatrix = getInitialTransformMatrix();
        // transformMatrix = translationMatrix(trans_increment[0], trans_increment[1], trans_increment[2]);
        // transformMatrix = rotationMatrix(rot_increment[0], rot_increment[1], rot_increment[2]);
        // transformMatrix = scaleMatrix(scale_increment[0], scale_increment[1], scale_increment[2]);

        // plz don't comment these lines, somehow camera control doesn't work if this get commented out
        // transformMatrix = matrixMult(transformMatrix, translationMatrix(trans_increment[0], trans_increment[1], trans_increment[2]));
        // transformMatrix = matrixMult(transformMatrix, rotationMatrix(rot_increment[0], rot_increment[1], rot_increment[2]));
        // transformMatrix = matrixMult(transformMatrix, scaleMatrix(scale_increment[0], scale_increment[1], scale_increment[2]));

        // Clear canvas & set states
        transformMatrix = computeTransformMatrix();

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        // Bind vertices and indices
        gl.vertexAttribPointer(coordLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(coordLoc);
        gl.uniformMatrix4fv(transformMatrixLoc, false, new Float32Array(transformMatrix));
        gl.uniform3f(colorLoc, 1, 0.5, 0);

        //Compute matrix for the camera
        // var cameraMatrix = m4.identity();
        //
        // cameraMatrix = m4.lookAt(eye, center, up);
        //
        // var viewMatrix = m4.inverse(cameraMatrix);
        //
        // viewMatrix = m4.xRotate(viewMatrix, -Math.PI / 2);
        // viewMatrix = m4.yRotate(viewMatrix, -Math.PI / 2);
        // viewMatrix = m4.zRotate(viewMatrix, -Math.PI / 2);

        // Compute matrix for the model
        // var modelMatrix = m4.identity();
        // var modelViewMatrix = m4.identity();
        // gl.uniformMatrix4fv(modelViewMatrixLoc,false,modelViewMatrix);
        // gl.uniform3f(colorLoc, 1, 0.5, 0);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(state.model.vertices), gl.STATIC_DRAW);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(state.model.indices), gl.STATIC_DRAW);

        // Draw
        gl.drawElements(gl.TRIANGLES, state.model.numPoints, gl.UNSIGNED_SHORT, 0);
        window.requestAnimationFrame(render);
    }
}


function setUIEventListener() {
    // -------------------- Rotation --------------------
    document.getElementById("rotasiX").addEventListener("input", (e) => {
        state.transformation.rotation[0] = (Math.PI / 180) * e.target.value;
    });

    document.getElementById("rotasiY").addEventListener("input", (e) => {
        state.transformation.rotation[1] = (Math.PI / 180) * e.target.value;
    });

    document.getElementById("rotasiZ").addEventListener("input", (e) => {
        state.transformation.rotation[2] = (Math.PI / 180) * e.target.value;
    });

    // -------------------- Translation --------------------
    document.getElementById("translasiX").addEventListener("input", (e) => {
        state.transformation.translation[0] = e.target.value / 100;
    });

    document.getElementById("translasiY").addEventListener("input", (e) => {
        state.transformation.translation[1] = e.target.value / 100;
    });

    document.getElementById("translasiZ").addEventListener("input", (e) => {
        state.transformation.translation[2] = e.target.value / 100;
    });

    // -------------------- Scaling --------------------
    document.getElementById("scalingX").addEventListener("input", (e) => {
        state.transformation.scale[0] = e.target.value;
    });

    document.getElementById("scalingY").addEventListener("input", (e) => {
        state.transformation.scale[1] = e.target.value;
    });

    document.getElementById("scalingZ").addEventListener("input", (e) => {
        state.transformation.scale[2] = e.target.value;
    });
}


main();
