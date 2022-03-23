import { translationMatrix, scaleMatrix, matrixMult, rotationMatrix, projectionMatrix } from './math.js';
import { webglCreateShaderProgram } from './utils.js';
import { getCube, getHollowCube, parserObjFile } from './model.js';
import { tetrahedral_obj, icosahedron_obj, cube_obj } from './builtin-obj-models.js';
import { m4 } from './matUtils.js';


var state;

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
        },

        useLight: true,
        // projectionType: "obli", // orth, obli, pers
        projectionType: "orth", // orth, obli, pers
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

function computeCameraMatrix() {
    var cameraMatrix;
    // this.nextElementSibling.value = this.value;
    // eye[0] = parseFloat(this.value);
    // cameraMatrix = m4.lookAt(eye, center, up);
    return cameraMatrix;
}


function main() {
    // Set state and event listener
    setDefaultState();
    setUIEventListener();

    var transformMatrix;
    var cameraMatrix;

    // -- Ritual WebGL Create Program --
    const canvas = document.getElementById('canvas');
    const gl     = canvas.getContext('webgl');

    if (!gl) {
        alert('Browsermu jelek');
        return;
    }

    var lightingShaderProgram = webglCreateShaderProgram(gl, 'vertex-shader-3d-light', 'fragment-shader-3d-light');
    var flatShaderProgram     = webglCreateShaderProgram(gl, 'vertex-shader-3d-flat', 'fragment-shader-3d-flat');

    gl.useProgram(lightingShaderProgram);

    // -- Create buffer & pointer --
    var vertexBuffer = gl.createBuffer();
    var indexBuffer  = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    var lightCoordLoc  = gl.getAttribLocation(lightingShaderProgram, "coordinates");
    var lightTrMatLoc  = gl.getUniformLocation(lightingShaderProgram, "transformationMatrix");
    var lightColorLoc  = gl.getUniformLocation(lightingShaderProgram, "userColor");
    var lightPrjMatLoc = gl.getUniformLocation(lightingShaderProgram, "uProjectionMatrix");

    var flatCoordLoc  = gl.getAttribLocation(flatShaderProgram, "coordinates");
    var flatTrMatLoc  = gl.getUniformLocation(flatShaderProgram, "transformationMatrix");
    var flatColorLoc  = gl.getUniformLocation(flatShaderProgram, "userColor");
    var flatPrjMatLoc = gl.getUniformLocation(flatShaderProgram, "uProjectionMatrix");




    // var modelViewMatrixLoc = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

    window.requestAnimationFrame(render);



    function render() {
        // Clear canvas & set states
        transformMatrix = computeTransformMatrix();

        if (state.useLight) {
            var shaderProgram = lightingShaderProgram;
            var coordLoc      = lightCoordLoc;
            var trMatLoc      = lightTrMatLoc;
            var colorLoc      = lightColorLoc;
            var projLoc       = lightPrjMatLoc;
        }
        else {
            var shaderProgram = flatShaderProgram;
            var coordLoc      = flatCoordLoc;
            var trMatLoc      = flatTrMatLoc;
            var colorLoc      = flatColorLoc;
            var projLoc       = flatPrjMatLoc;
        }

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        gl.useProgram(shaderProgram);
        gl.vertexAttribPointer(coordLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(coordLoc);
        gl.uniformMatrix4fv(trMatLoc, false, new Float32Array(transformMatrix));
        gl.uniform3f(colorLoc, 1, 0.5, 0);

        gl.uniformMatrix4fv(projLoc, false, projectionMatrix(state.projectionType))

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

        // Bind vertices and indices
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(state.model.vertices), gl.STATIC_DRAW);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(state.model.indices), gl.STATIC_DRAW);

        // Draw
        gl.drawElements(gl.TRIANGLES, state.model.numPoints, gl.UNSIGNED_SHORT, 0);
        window.requestAnimationFrame(render);
    }
}


function setUIEventListener() {
    // -------------------- Model & Projection --------------------
    function callbackFile(e) {
        var file = e.target.files[0];
        if (!file) {
            console.log("File not found");
            return;
        }

        var reader = new FileReader();
        reader.onload = function (e) {
            state.model = parserObjFile(e.target.result);
        };
        reader.readAsText(file);
    }

    function callbackModel(e) {
        var selectedModelRadio = document.querySelector("input[name='bentuk']:checked").value;
        switch (selectedModelRadio) {
            case "tetrahedral":
                state.model = parserObjFile(tetrahedral_obj, true);
                break;
            case "cube":
                state.model = getHollowCube();
                break;
            case "icosahedron":
                state.model = parserObjFile(icosahedron_obj, true);
                break;
        }
    }

    function callbackProjection(e) {
        var selectedModelRadio = document.querySelector("input[name='proyeksi']:checked").value;
        switch (selectedModelRadio) {
            case "orthographic":
                state.projectionType = "orth";
                break;
            case "oblique":
                state.projectionType = "obli";
                break;
            case "perspective":
                state.projectionType = "pers";
                break;
        }
    }

    document.getElementById('obj-input').addEventListener('change', callbackFile, false);
    document.forms["model"].elements["bentuk"].forEach((item, i) => {
        item.onclick = callbackModel;
    });

    document.forms["model"].elements["proyeksi"].forEach((item, i) => {
        item.onclick = callbackProjection;
    });




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








    // -------------------- Camera --------------------
    // Add listener for slider change in eye-x position
    document.getElementById("eye-x").oninput = function () {
        this.nextElementSibling.value = this.value;
        eye[0] = parseFloat(this.value);
        // cameraMatrix = m4.lookAt(eye, center, up);
    };

    document.getElementById("eye-y").oninput = function () {
        this.nextElementSibling.value = this.value;
        eye[1] = parseFloat(this.value);
        // cameraMatrix = m4.lookAt(eye, center, up);
    };

    document.getElementById("eye-z").oninput = function () {
        this.nextElementSibling.value = this.value;
        eye[2] = parseFloat(this.value);
        // cameraMatrix = m4.lookAt(eye, center, up);
    };

    document.getElementById("center-x").oninput = function () {
        this.nextElementSibling.value = this.value;
        center[0] = parseFloat(this.value);
        // cameraMatrix = m4.lookAt(eye, center, up);
    };

    document.getElementById("center-y").oninput = function () {
        this.nextElementSibling.value = this.value;
        center[1] = parseFloat(this.value);
        // cameraMatrix = m4.lookAt(eye, center, up);
    };

    document.getElementById("center-z").oninput = function () {
        this.nextElementSibling.value = this.value;
        center[2] = parseFloat(this.value);
        // cameraMatrix = m4.lookAt(eye, center, up);
    };

    document.getElementById("up-x").oninput = function () {
        this.nextElementSibling.value = this.value;
        up[0] = parseFloat(this.value);
        // cameraMatrix = m4.lookAt(eye, center, up);
    };

    document.getElementById("up-y").oninput = function () {
        this.nextElementSibling.value = this.value;
        up[1] = parseFloat(this.value);
        // cameraMatrix = m4.lookAt(eye, center, up);
    };

    document.getElementById("up-z").oninput = function () {
        this.nextElementSibling.value = this.value;
        up[2] = parseFloat(this.value);
        // cameraMatrix = m4.lookAt(eye, center, up);
    };


    // -------------------- Reset --------------------
    document.getElementById("reset").addEventListener("click", () => {
        setDefaultState();
    });

    function callbackShading(e) {
        state.useLight = document.querySelector("#shading").checked;
    }
    document.getElementById('shading').addEventListener('change', callbackShading, false);
    document.getElementById("reset").click();
}


main();
