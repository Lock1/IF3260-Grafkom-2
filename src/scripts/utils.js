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

export function webglCreateShaderProgram(gl, vShaderID, fShaderID) {
    var vertCode   = document.getElementById(vShaderID).textContent;
    var vertShader = shaderCreator(gl, gl.VERTEX_SHADER, vertCode);

    var fragCode   = document.getElementById(fShaderID).textContent;
    var fragShader = shaderCreator(gl, gl.FRAGMENT_SHADER, fragCode);

    var shaderProgram = createProgram(gl, vertShader, fragShader)
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return;
    }

    return shaderProgram;
}
