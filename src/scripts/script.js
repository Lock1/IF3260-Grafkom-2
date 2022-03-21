import { translationMatrix, scaleMatrix, matrixMult, rotationMatrix } from './math.js'
import { webglCreateShaderProgram } from './utils.js'
import { getHollowCube, getModelFromObjFile } from './model.js'

function getInitialTransformMatrix() {
    var transformMatrix = translationMatrix(0, 0); // Just empty matrix
    var translation = [0, 0];
    var scale       = [0.7, 0.7, 0.7];
    var rotation    = [0, 0, 0];

    transformMatrix = matrixMult(scaleMatrix(scale[0], scale[1], scale[2]), transformMatrix);
    transformMatrix = matrixMult(translationMatrix(translation[0], translation[1]), transformMatrix);
    transformMatrix = matrixMult(rotationMatrix(rotation[0], rotation[1], rotation[2]), transformMatrix);
    return transformMatrix;
}

function main() {
    // -- Get model --
    // TODO : Update
    var model     = getHollowCube();

    // Idle animation parameter
    // Asumsi requestAnimationFrame hingga 60 calls per sec
    var rot_increment = [Math.PI / 180 * (1 / 60) * 5, Math.PI / 180 * (1 / 60) * 2, 0];

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

    // -- Ritual Binding Buffer --
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    var coordLoc = gl.getAttribLocation(shaderProgram, "coordinates");
    gl.vertexAttribPointer(coordLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coordLoc);

    var transformMatrixLoc = gl.getUniformLocation(shaderProgram, "transformationMatrix");
    gl.uniformMatrix4fv(transformMatrixLoc, false, new Float32Array(transformMatrix));

    var colorLoc = gl.getUniformLocation(shaderProgram, "userColor");
    gl.uniform3f(colorLoc, 1, 0.5, 0);

    // Bind vertices and indices
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    window.requestAnimationFrame(render);



    function render() {
        // Idle animation
        transformMatrix = matrixMult(rotationMatrix(rot_increment[0], rot_increment[1], rot_increment[2]), transformMatrix);

        // Update buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
        gl.uniformMatrix4fv(transformMatrixLoc, false, new Float32Array(transformMatrix));

        // Draw
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES, model.numPoints, gl.UNSIGNED_SHORT, 0);
        window.requestAnimationFrame(render);
    }
}

document.getElementById('obj-input').addEventListener('change', getModelFromObjFile, false);
main();
