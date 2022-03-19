main()

function shaderCreator(gl, type, source) {
    var shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(shader))
    }
    return shader
}

function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program))
    }
    return program
}

function main() {
    const canvas = document.getElementById('canvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }

    // Create vertex shader
    var vertCode = `
        attribute vec3 coordinates;
        uniform mat4 transformationMatrix;
        varying float colorFactor;
        void main() {
            // Z dikali negatif karena vektor Z di WebGL berlawanan
            vec4 transformedPosition = vec4(coordinates.xy, coordinates.z * -1.0, 1.0) * transformationMatrix;
            gl_Position = transformedPosition;
            colorFactor = min(max((1.0 - transformedPosition.z) / 2.0, 0.0), 1.0);
        }
	`;

    var vertShader = shaderCreator(gl, gl.VERTEX_SHADER, vertCode);

    // Create fragment shader
    var fragCode = `
        precision mediump float;
        uniform vec3 userColor;
        varying float colorFactor;
        void main(void) {
            gl_FragColor = vec4(userColor * colorFactor, 1.0);
        }
    `;

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
}