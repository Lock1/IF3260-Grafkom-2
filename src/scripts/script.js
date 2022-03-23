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
    // Initial matrices
    // var transformMatrix = m4.identity();
    // var cameraMatrix   = m4.identity();

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

    var lightCoordLoc = gl.getAttribLocation(lightingShaderProgram, "coordinates");
    var lightTrMatLoc = gl.getUniformLocation(lightingShaderProgram, "transformationMatrix");
    var lightColorLoc = gl.getUniformLocation(lightingShaderProgram, "userColor");

    var flatCoordLoc = gl.getAttribLocation(flatShaderProgram, "coordinates");
    var flatTrMatLoc = gl.getUniformLocation(flatShaderProgram, "transformationMatrix");
    var flatColorLoc = gl.getUniformLocation(flatShaderProgram, "userColor");


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

        if (state.useLight) {
            gl.useProgram(lightingShaderProgram);
            gl.vertexAttribPointer(lightCoordLoc, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(lightCoordLoc);
            gl.uniformMatrix4fv(lightTrMatLoc, false, new Float32Array(transformMatrix));
            gl.uniform3f(lightColorLoc, 1, 0.5, 0);
        }
        else {
            gl.useProgram(flatShaderProgram);
            gl.vertexAttribPointer(flatCoordLoc, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(flatCoordLoc);
            gl.uniformMatrix4fv(flatTrMatLoc, false, new Float32Array(transformMatrix));
            gl.uniform3f(flatColorLoc, 1, 0.5, 0);
        }

        // Bind vertices and indices

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

    document.getElementById('obj-input').addEventListener('change', callbackFile, false);
    document.forms["model"].elements["bentuk"].forEach((item, i) => {
        item.onclick = callbackModel;
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
}


main();
