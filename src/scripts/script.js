import { translationMatrix, scaleMatrix, matrixMult, rotationMatrix } from './math.js'
import { webglCreateShaderProgram } from './utils.js'
import { getHollowCube, getModelFromObjFile } from './model.js'

function main() {
    // -- Ritual WebGL --
    const canvas = document.getElementById('canvas');
    const gl     = canvas.getContext('webgl');

    if (!gl) {
        alert('Browsermu jelek');
        return;
    }

    var shaderProgram = webglCreateShaderProgram(gl, 'vertex-shader-3d-cube', 'fragment-shader-3d-cube');
    gl.useProgram(shaderProgram);

    // -- Get model --
    // TODO : Update
    var model     = getHollowCube();


    // -- Ritual Binding Buffer --
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    var coord = gl.getAttribLocation(shaderProgram, "coordinates"); // FIXME : ??? Kenapa attr kalo serasa uniform?
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);

    var transformMatrix = translationMatrix(0, 0);
    var transformMatrixLoc = gl.getUniformLocation(shaderProgram, "transformationMatrix");
    gl.uniformMatrix4fv(transformMatrixLoc, false, new Float32Array(transformMatrix));

    var colorLoc = gl.getUniformLocation(shaderProgram, "userColor");
    gl.uniform3f(colorLoc, 1, 0.5, 0);

    // Pass data
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);


    // -- Initial transformation matrix calculation --
    var xPos = 0;
    var yPos = 0;
    var scaleX = 1;
    var scaleY = 1;
    var scaleZ = 1;

    var rtx = Math.PI / 180 * (1 / 60) * 5;
    var rty = Math.PI / 180 * (1 / 60) * 5;
    var rtz = 0
    transformMatrix = matrixMult(scaleMatrix(scaleX, scaleY, scaleZ), transformMatrix);
    transformMatrix = matrixMult(translationMatrix(xPos, yPos), transformMatrix);
    transformMatrix = matrixMult(rotationMatrix(rtx, rty, rtz), transformMatrix);

    var timer = 0;
    window.requestAnimationFrame(render);

    function render(time_now) {
        var delta = time_now - timer; // FIXME : Mungkin ga dibutuhin, lets see
        transformMatrix = matrixMult(rotationMatrix(rtx, rty, rtz), transformMatrix);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniformMatrix4fv(transformMatrixLoc, false, new Float32Array(transformMatrix));
        gl.drawElements(gl.TRIANGLES, model.numPoints, gl.UNSIGNED_SHORT, 0);
        window.requestAnimationFrame(render);
    }
}

main()
