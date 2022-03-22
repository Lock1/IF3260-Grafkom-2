import { translationMatrix, scaleMatrix, matrixMult, rotationMatrix, projectionMatrix } from './math.js';
import { webglCreateShaderProgram } from './utils.js';
import { getCube, getHollowCube, parserObjFile } from './model.js';
import { tetrahedral_obj, icosahedron_obj, cube_obj } from './builtin-obj-models.js';
import { m4 } from './matUtils.js';

function getInitialTransformMatrix() {
    var transformMatrix = translationMatrix(0, 0, 0); // Just empty matrix
    var translation = [0, 0, 0];
    var scale       = [0.8, 0.8, 0.8];
    var rotation    = [0, 0, 0];

    transformMatrix = matrixMult(scaleMatrix(scale[0], scale[1], scale[2]), transformMatrix);
    transformMatrix = matrixMult(translationMatrix(translation[0], translation[1], translation[2]), transformMatrix);
    transformMatrix = matrixMult(rotationMatrix(rotation[0], rotation[1], rotation[2]), transformMatrix);
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

        var reader    = new FileReader();
        reader.onload = function(e) {
          model = parserObjFile(e.target.result);
        };
        reader.readAsText(file);
    }

    // Add listener for slider change in rotation
    document.getElementById("rotasiX").addEventListener("input", (e) => {
        rot_increment[0] = (Math.PI / 180) * e.target.value / 60;
        console.log(rot_increment[0]);
        render();
    });

    document.getElementById("rotasiY").addEventListener("input", (e) => {
        rot_increment[1] = (Math.PI / 180) * e.target.value / 60;
        console.log(rot_increment[1]);
        render();
    });

    document.getElementById("rotasiZ").addEventListener("input", (e) => {
        rot_increment[2] = (Math.PI / 180) * e.target.value / 60;
        console.log(rot_increment[2]);
        render();
    });

    // Add listener for slider change in translation
    document.getElementById("translasiX").addEventListener("input", (e) => {
        trans_increment[0] = e.target.value / 100;
        render();
    });

    document.getElementById("translasiY").addEventListener("input", (e) => {
        trans_increment[1] = e.target.value / 100;
        render();
    });    

    document.getElementById("translasiZ").addEventListener("input", (e) => {
        trans_increment[2] = e.target.value / 100;
        render();
    });

    // Add listener for slider change in scaling
    document.getElementById("scalingX").addEventListener("input", (e) => {
        scale_increment[0] = e.target.value;
        render();
    });

    document.getElementById("scalingY").addEventListener("input", (e) => {
        scale_increment[1] = e.target.value;
        render();
    });

    document.getElementById("scalingZ").addEventListener("input", (e) => {
        scale_increment[2] = e.target.value;
        render();
    });

    // Add listener for slider change in eye-x position
    document.getElementById("eye-x").oninput = function () {
        // print the value of the input
        eye[0] = parseFloat(this.value);
        render();
        console.log(eye[0]);
    };

    document.getElementById("eye-y").oninput = function () {
        // print the value of the input
        eye[1] = parseFloat(this.value);
        render();
        console.log(eye[1]);
    };

    document.getElementById("eye-z").oninput = function () {
        // print the value of the input
        eye[2] = parseFloat(this.value);
        render();
        console.log(eye[2]);
    };

    document.getElementById("center-x").oninput = function () {
        // print the value of the input
        center[0] = parseFloat(this.value);
        render();
        console.log(center[0]);
    };

    document.getElementById("center-y").oninput = function () {
        // print the value of the input
        center[1] = parseFloat(this.value);
        render();
        console.log(center[1]);
    };

    document.getElementById("center-z").oninput = function () {
        // print the value of the input
        center[2] = parseFloat(this.value);
        render();
        console.log(center[2]);
    };

    document.getElementById("up-x").oninput = function () {
        // print the value of the input
        up[0] = parseFloat(this.value);
        render();
        console.log(up[0]);
    };

    document.getElementById("up-y").oninput = function () {
        // print the value of the input
        up[1] = parseFloat(this.value);
        render();
        console.log(up[1]);
    };

    document.getElementById("up-z").oninput = function () {
        // print the value of the input
        up[2] = parseFloat(this.value);
        render();
        console.log(up[2]);
    };

    // // Add listener for eye position "eye-y"
    // document.getElementById("eye-y").addEventListener("input", function(e) {
    //     eye[1] = parseFloat(e.target.value);
    //     console.log(eye);
    //     //updateViewMatrix();
    // });

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
    var rot_increment = [Math.PI / 180 * (1 / 60) * 20, Math.PI / 180 * (1 / 60) * 30, 0];
    var trans_increment = [0, 0, 0];
    var scale_increment = [0.8, 0.8, 0.8];

    // Initial transformation matrix
    var transformMatrix = getInitialTransformMatrix();

    // -- Ritual WebGL Create Program --
    const canvas = document.getElementById('canvas');
    const gl     = canvas.getContext('webgl');

    if (!gl) {
        alert('Browsermu jelek');
        return;
    }

    var shaderProgram = webglCreateShaderProgram(gl, 'vertex-shader-3d-cube', 'fragment-shader-3d-cube');

    var initmodelViewMatrix = gl.getUniformLocation(shaderProgram, 'uModelViewMatrix')

    gl.useProgram(shaderProgram);

    // -- Create buffer & pointer --
    var vertexBuffer = gl.createBuffer();
    var indexBuffer  = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    var coordLoc           = gl.getAttribLocation(shaderProgram, "coordinates");
    var transformMatrixLoc = gl.getUniformLocation(shaderProgram, "transformationMatrix");
    var colorLoc           = gl.getUniformLocation(shaderProgram, "userColor");

    window.requestAnimationFrame(render);



    function render() {
        // Idle animation
        // transformMatrix = projectionMatrix(gl);
        transformMatrix = matrixMult(transformMatrix, translationMatrix(trans_increment[0], trans_increment[1], trans_increment[2]));
        transformMatrix = matrixMult(transformMatrix, rotationMatrix(rot_increment[0], rot_increment[1], rot_increment[2]));
        transformMatrix = matrixMult(transformMatrix, scaleMatrix(scale_increment[0],scale_increment[1],scale_increment[2]));
        

        // Clear canvas & set states
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        // Bind vertices and indices
        gl.vertexAttribPointer(coordLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(coordLoc);
        gl.uniformMatrix4fv(transformMatrixLoc, false, new Float32Array(transformMatrix));
        gl.uniform3f(colorLoc, 1, 0.5, 0);

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);

        //Compute matrix for the camera
        var cameraMatrix = m4.identity();

        cameraMatrix = m4.lookAt(eye, center, up);

        var viewMatrix = m4.inverse(cameraMatrix);

        viewMatrix = m4.xRotate(viewMatrix, -Math.PI / 2);
        viewMatrix = m4.yRotate(viewMatrix, -Math.PI / 2);
        viewMatrix = m4.zRotate(viewMatrix, -Math.PI / 2);

        // Compute matrix for the model
        var modelMatrix = m4.identity();
        var modelViewMatrix = m4.multiply(viewMatrix, modelMatrix);

        gl.uniformMatrix4fv(
            initmodelViewMatrix,
            false,
            modelViewMatrix);

        // Draw
        gl.drawElements(gl.TRIANGLES, model.numPoints, gl.UNSIGNED_SHORT, 0);
        // window.requestAnimationFrame(render);
    }
}


main();
