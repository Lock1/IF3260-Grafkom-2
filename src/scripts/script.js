import { translationMatrix, scaleMatrix, matrixMult, rotationMatrix } from './math.js';
import { webglCreateShaderProgram } from './utils.js';
import { getCube, getHollowCube, parserObjFile } from './model.js';
import { tetrahedral_obj, icosahedron_obj } from './builtin-obj-models.js';

function getInitialTransformMatrix() {
    var transformMatrix = translationMatrix(0, 0); // Just empty matrix
    var translation = [0, 0];
    var scale       = [0.8, 0.8, 0.8];
    var rotation    = [0, 0, 0];

    transformMatrix = matrixMult(scaleMatrix(scale[0], scale[1], scale[2]), transformMatrix);
    transformMatrix = matrixMult(translationMatrix(translation[0], translation[1]), transformMatrix);
    transformMatrix = matrixMult(rotationMatrix(rotation[0], rotation[1], rotation[2]), transformMatrix);
    return transformMatrix;
}

function main() {
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
    function callbackModel(e) {
        var selectedModelRadio = document.querySelector("input[name='bentuk']:checked").value;
        switch (selectedModelRadio) {
            case "tetrahedral":
                // TODO : Tambah
                break;
            case "cube":
                model = getHollowCube();
                break;
            case "icosahedron":
                model = parserObjFile(icosahedron_obj, true);
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
        transformMatrix = matrixMult(rotationMatrix(rot_increment[0], rot_increment[1], rot_increment[2]), transformMatrix);

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

        // Draw
        gl.drawElements(gl.TRIANGLES, model.numPoints, gl.UNSIGNED_SHORT, 0);
        window.requestAnimationFrame(render);
    }
}


main();
