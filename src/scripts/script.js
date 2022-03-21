import { translationMatrix, scaleMatrix, matrixMult, rotationMatrix } from './math.js'
// import { shaderCreator, createProgram } from './utils.js'
import { webglCreateShaderProgram } from './utils.js'
import { getHollowCube, getModelFromObjFile } from './model.js'

function main() {
    const canvas = document.getElementById('canvas');
    const gl     = canvas.getContext('webgl');

    if (!gl) {
        alert('Browsermu jelek');
        return;
    }

    var shaderProgram = webglCreateShaderProgram(gl, 'vertex-shader-3d-cube', 'fragment-shader-3d-cube');
    gl.useProgram(shaderProgram);


    // Create vertex buffer
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // Create index buffer
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    var model     = getHollowCube(); // TODO : Update
    var vertices  = model.vertices;
    var indices   = model.indices;
    var numPoints = model.numPoints;

    // Combine
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    var coord = gl.getAttribLocation(shaderProgram, "coordinates");
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);

    var currentMatrix = translationMatrix(0, 0);
    var translationMatrixLoc = gl.getUniformLocation(shaderProgram, "transformationMatrix");
    gl.uniformMatrix4fv(translationMatrixLoc, false, new Float32Array(currentMatrix));

    var colorLoc = gl.getUniformLocation(shaderProgram, "userColor");
    gl.uniform3f(colorLoc, 0.0, 0.0, 0.0);

    // Pass data
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    var xPos = 0;
    var yPos = 0;
    var scaleX = 1;
    var scaleY = 1;
    var scaleZ = 1;
    var red = 20;
    var green = 25;
    var blue = 0;

    // Update
    var rtx = Math.PI / 180 * (1 / 60) * 5;
    var rty = Math.PI / 180 * (1 / 60) * 5;
    var rtz = 0
    currentMatrix = matrixMult(scaleMatrix(scaleX, scaleY, scaleZ), currentMatrix);
    currentMatrix = matrixMult(translationMatrix(xPos, yPos), currentMatrix);
    currentMatrix = matrixMult(rotationMatrix(rtx, rty, rtz), currentMatrix);
    gl.uniform3f(colorLoc, red, green, blue);

    var timer = 0;
    window.requestAnimationFrame(render);

    function render(time_now) {
        var delta = time_now - timer; // FIXME : Mungkin ga dibutuhin, lets see
        currentMatrix = matrixMult(rotationMatrix(rtx, rty, rtz), currentMatrix);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniformMatrix4fv(translationMatrixLoc, false, new Float32Array(currentMatrix));
        gl.drawElements(gl.TRIANGLES, numPoints, gl.UNSIGNED_SHORT, 0);
        window.requestAnimationFrame(render);
    }
}

main()
