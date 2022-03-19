// import translationMatrix and scaleMatrix from src\cube\geometric.js
import { translationMatrix, scaleMatrix, matrixMult } from './math.js'
import { shaderCreator, createProgram } from './utils.js'

function main() {

    var currentMatrix = translationMatrix(0, 0);
    const canvas = document.getElementById('canvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }

    // Create vertex shader
    var vertCode = document.getElementById('vertex-shader-3d').textContent;

    var vertShader = shaderCreator(gl, gl.VERTEX_SHADER, vertCode);

    // Create fragment shader
    var fragCode = document.getElementById('fragment-shader-3d').textContent;

    var fragShader = shaderCreator(gl, gl.FRAGMENT_SHADER, fragCode);

    // Create program
    var shaderProgram = createProgram(gl, vertShader, fragShader);

    // Check the shader program
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return;
    }

    gl.useProgram(shaderProgram);

    // Create vertex buffer
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // Create index buffer
    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // Create 8 small cubes to create the hollow cube
    var width = 0.125;
    var P_OUTER = 0.5; // positive in outer section
    var N_OUTER = -0.5; // negative in outer section
    var P_INNER = 0.5 - width;
    var N_INNER = -0.5 + width;
    var vertices = [];
    for (var i = 0; i < 64; i++) {
        var currentVertex = [];
        for (var j = 0; j < 3; j++) { // i == 0 untuk x, dst untuk y dan z, berturut-turut
            // Mengambil dua digit ke-(j + 1) dari i dalam biner dari kanan
            var code = Math.floor(i / Math.pow(2, 2 * j)) % 4
            // Untuk XY (dalam biner), X yang menandakan positif (0) atau negatif (-1), sedangkan
            // Y yang menentukan dia outer (0) atau inner (1)
            switch (code) {
                case 0:
                    currentVertex.push(P_OUTER);
                    break;
                case 1:
                    currentVertex.push(P_INNER);
                    break;
                case 2:
                    currentVertex.push(N_OUTER);
                    break;
                case 3:
                    currentVertex.push(N_INNER);
                    break;
                default:
                    console.log("ERROR!!!")
            }
        }
        vertices = vertices.concat(currentVertex);
    }

    var indices = [];
    var numPoints = 0;

    function addRectangleIndices(idx1, idx2, idx3, idx4) {
        // From two triangle
        indices.push(idx1); indices.push(idx2); indices.push(idx3);
        indices.push(idx3); indices.push(idx4); indices.push(idx1);
        numPoints += 6;
    }

    // From outer
    addRectangleIndices(0, 1, 5, 4); addRectangleIndices(1, 3, 7, 5);
    addRectangleIndices(2, 6, 7, 3); addRectangleIndices(6, 14, 15, 7);
    addRectangleIndices(10, 11, 15, 14); addRectangleIndices(9, 13, 15, 11);
    addRectangleIndices(8, 12, 13, 9); addRectangleIndices(4, 5, 13, 12);

    addRectangleIndices(0, 4, 20, 16); addRectangleIndices(4, 12, 28, 20);
    addRectangleIndices(8, 24, 28, 12); addRectangleIndices(24, 56, 60, 28);
    addRectangleIndices(40, 44, 60, 56); addRectangleIndices(36, 52, 60, 44);
    addRectangleIndices(32, 48, 52, 36); addRectangleIndices(16, 20, 52, 48);

    addRectangleIndices(0, 16, 17, 1); addRectangleIndices(16, 48, 49, 17);
    addRectangleIndices(32, 33, 49, 48); addRectangleIndices(33, 35, 51, 49);
    addRectangleIndices(34, 50, 51, 35); addRectangleIndices(18, 19, 51, 50);
    addRectangleIndices(2, 3, 19, 18); addRectangleIndices(1, 17, 19, 3);

    addRectangleIndices(2, 18, 22, 6); addRectangleIndices(18, 50, 54, 22);
    addRectangleIndices(34, 38, 54, 50); addRectangleIndices(38, 46, 62, 54);
    addRectangleIndices(42, 58, 62, 46); addRectangleIndices(26, 30, 62, 58);
    addRectangleIndices(10, 14, 30, 26); addRectangleIndices(6, 22, 30, 14);

    addRectangleIndices(8, 9, 25, 24); addRectangleIndices(9, 11, 27, 25);
    addRectangleIndices(10, 26, 27, 11); addRectangleIndices(26, 58, 59, 27);
    addRectangleIndices(42, 43, 59, 58); addRectangleIndices(41, 57, 59, 43);
    addRectangleIndices(40, 56, 57, 41); addRectangleIndices(24, 25, 57, 56);

    addRectangleIndices(32, 36, 37, 33); addRectangleIndices(36, 44, 45, 37);
    addRectangleIndices(40, 41, 45, 44); addRectangleIndices(41, 43, 47, 45);
    addRectangleIndices(42, 46, 47, 43); addRectangleIndices(38, 39, 47, 46);
    addRectangleIndices(34, 35, 39, 38); addRectangleIndices(33, 37, 39, 35);


    // From inner (for hollow effect)
    addRectangleIndices(5, 7, 23, 21); addRectangleIndices(7, 15, 31, 23);
    addRectangleIndices(13, 29, 31, 15); addRectangleIndices(5, 21, 29, 13);

    addRectangleIndices(20, 28, 29, 21); addRectangleIndices(28, 60, 61, 29);
    addRectangleIndices(52, 53, 61, 60); addRectangleIndices(20, 21, 53, 52);

    addRectangleIndices(17, 49, 53, 21); addRectangleIndices(49, 51, 55, 53);
    addRectangleIndices(19, 23, 55, 51); addRectangleIndices(17, 21, 23, 19);

    addRectangleIndices(22, 54, 55, 23); addRectangleIndices(54, 62, 63, 55);
    addRectangleIndices(30, 31, 63, 62); addRectangleIndices(22, 23, 31, 30);

    addRectangleIndices(25, 27, 31, 29); addRectangleIndices(27, 59, 63, 31);
    addRectangleIndices(57, 61, 63, 59); addRectangleIndices(25, 29, 61, 57);

    addRectangleIndices(37, 45, 61, 53); addRectangleIndices(45, 47, 63, 61);
    addRectangleIndices(39, 55, 63, 47); addRectangleIndices(37, 53, 55, 39);

    // Combine
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    var coord = gl.getAttribLocation(shaderProgram, "coordinates");
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coord);

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
    currentMatrix = matrixMult(scaleMatrix(scaleX, scaleY, scaleZ), currentMatrix);
    currentMatrix = matrixMult(translationMatrix(xPos, yPos), currentMatrix);
    gl.uniform3f(colorLoc, red, green, blue);
    render();

    function render() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniformMatrix4fv(translationMatrixLoc, false, new Float32Array(currentMatrix));
        gl.drawElements(gl.TRIANGLES, numPoints, gl.UNSIGNED_SHORT, 0);
    }
}

main()