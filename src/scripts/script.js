import { translationMatrix, scaleMatrix, matrixMult, rotationMatrix, projectionMatrix } from './math.js';
import { webglCreateShaderProgram } from './utils.js';
import { parserObjFile } from './model.js';
import { tetrahedral_obj, icosahedron_obj, cube_obj } from './builtin-obj-models.js';
import { m4 } from './matUtils.js';


var state;
var mouse_state = {
    dragging: false,

    origin: {
        x: undefined,
        y: undefined
    },

    delta: {
        x: 0,
        y: 0,
    },

    constant: {
        x: 2 * Math.PI / document.getElementById('canvas').width,
        y: 2 * Math.PI / document.getElementById('canvas').height
    }
}


function setDefaultState() {
    state = {
        model: parserObjFile(cube_obj, true),

        transformation: {
            translation: [0, 0, 0],
            rotation   : [0, 0, Math.PI / 180 * 30],
            scale      : [1, 1, 1],
            mouseRot   : [0, 0]
        },

        view: {
            rotation: 60,
            radius  : 0.1,
        },

        useLight      : true,
        projectionType: "orth", // orth, obli, pers
        pickedColor   : [1.0, 0.5, 0.0, 1.0],
        idleAnimation : true,

        timeoutIdle   : true,
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

function computeViewMatrix() {
    var viewMatrix;
    viewMatrix = rotationMatrix(0, state.view.rotation * Math.PI / 180, 0);
    viewMatrix = matrixMult(viewMatrix, translationMatrix(0, 0, state.view.radius));
    return m4.inverse(viewMatrix);
}

function main() {
    // Set state and event listener
    setUIEventListener();
    document.getElementById("reset").click(); // Reset everything to default state

    var transformMatrix;
    var cameraMatrix;

    // -- Ritual WebGL Create Program --
    const canvas = document.getElementById('canvas');
    const gl     = canvas.getContext('webgl');

    if (!gl) {
        alert('Browsermu jelek');
        return;
    }

    var lightingShaderProgram = webglCreateShaderProgram(gl, 'vertex-shader-3d', 'fragment-shader-3d-light');
    var flatShaderProgram     = webglCreateShaderProgram(gl, 'vertex-shader-3d', 'fragment-shader-3d-flat');

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
    var lightFudgeLoc  = gl.getUniformLocation(lightingShaderProgram, "fudgeFactor");

    var flatCoordLoc  = gl.getAttribLocation(flatShaderProgram, "coordinates");
    var flatTrMatLoc  = gl.getUniformLocation(flatShaderProgram, "transformationMatrix");
    var flatColorLoc  = gl.getUniformLocation(flatShaderProgram, "userColor");
    var flatPrjMatLoc = gl.getUniformLocation(flatShaderProgram, "uProjectionMatrix");
    var flatFudgeLoc  = gl.getUniformLocation(flatShaderProgram, "fudgeFactor");

    window.requestAnimationFrame(render);



    function render() {
        // Clear canvas & set states
        if (state.idleAnimation && state.timeoutIdle) {
            state.transformation.rotation[0] += Math.PI / 180 * (1 / 60) * 2;
            state.transformation.rotation[1] += Math.PI / 180 * (1 / 60) * 6;
        }

        transformMatrix = computeTransformMatrix();

        if (!mouse_state.dragging) {
            mouse_state.delta.x *= 0.95;
            mouse_state.delta.y *= 0.95;
            state.transformation.rotation[1] -= mouse_state.delta.x;
            state.transformation.rotation[0] -= mouse_state.delta.y;
        }

        const rotX = document.getElementById("rotasiX");
        const rotY = document.getElementById("rotasiY");

        if (state.transformation.rotation[0] > Math.PI)
            state.transformation.rotation[0] = -Math.PI;

        if (state.transformation.rotation[1] > Math.PI)
            state.transformation.rotation[1] = -Math.PI;

        const degreeX = 180 / Math.PI * state.transformation.rotation[0];
        const degreeY = 180 / Math.PI * state.transformation.rotation[1];
        rotX.value = degreeX;
        rotY.value = degreeY;
        rotX.nextElementSibling.value = Math.round(degreeX);
        rotY.nextElementSibling.value = Math.round(degreeY);

        if (state.useLight) {
            var shaderProgram = lightingShaderProgram;
            var coordLoc      = lightCoordLoc;
            var trMatLoc      = lightTrMatLoc;
            var colorLoc      = lightColorLoc;
            var projLoc       = lightPrjMatLoc;
            var fudgeLoc      = lightFudgeLoc;
        }
        else {
            var shaderProgram = flatShaderProgram;
            var coordLoc      = flatCoordLoc;
            var trMatLoc      = flatTrMatLoc;
            var colorLoc      = flatColorLoc;
            var projLoc       = flatPrjMatLoc;
            var fudgeLoc      = flatFudgeLoc;
        }

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);

        gl.useProgram(shaderProgram);
        gl.vertexAttribPointer(coordLoc, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(coordLoc);
        gl.uniformMatrix4fv(trMatLoc, false, new Float32Array(transformMatrix));
        gl.uniform3f(colorLoc, state.pickedColor[0], state.pickedColor[1], state.pickedColor[2]);

        if (state.projectionType === "pers")
            gl.uniform1f(fudgeLoc, 1.275);
        else
            gl.uniform1f(fudgeLoc, 0);

        var viewProjectionMat = matrixMult(projectionMatrix(state.projectionType), computeViewMatrix());
        gl.uniformMatrix4fv(projLoc, false, viewProjectionMat);

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
            state.model = parserObjFile(e.target.result, true);
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
                state.model = parserObjFile(cube_obj, true);
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
    document.getElementById("cam-radius").oninput = function () {
        this.nextElementSibling.value = this.value;
        state.view.radius = parseFloat(this.value);
    };

    document.getElementById("cam-rotation").oninput = function () {
        this.nextElementSibling.value = this.value;
        state.view.rotation = parseFloat(this.value);
    };


    // -------------------- Reset --------------------
    document.getElementById("reset").addEventListener("click", () => {
        setDefaultState();
    });


    // -------------------- Color & etc --------------------
    // Sumber : Tugas besar 1
    function getColor() {
        const hexToRgb = hex =>
          hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
                     ,(m, r, g, b) => '#' + r + r + g + g + b + b)
            .substring(1).match(/.{2}/g)
            .map(x => parseInt(x, 16))

        var hex = document.getElementById("color_picker").value;
        var rgb = hexToRgb(hex);
        state.pickedColor = [rgb[0]/255, rgb[1]/255, rgb[2]/255, 1.0];
    }

    document.getElementById("color_picker").addEventListener('change', getColor, false);

    function callbackShading(e) {
        state.useLight = document.querySelector("#shading").checked;
    }

    function callbackIdle(e) {
        state.idleAnimation = document.querySelector("#idle").checked;
    }

    document.getElementById("shading").addEventListener('change', callbackShading, false);

    document.getElementById("idle").addEventListener('change', callbackIdle, false);

    function callbackMouseDown(e) {
        mouse_state.dragging = true;
        mouse_state.origin.x = e.pageX;
        mouse_state.origin.y = e.pageY;
        e.preventDefault();
        return false;
    }

    function callbackMouseUp(e) {
        mouse_state.dragging = false;
    }

    function callbackMouseMove(e) {
        if (!mouse_state.dragging)
            return false;

        mouse_state.delta.x = (e.pageX - mouse_state.origin.x) * mouse_state.constant.x;
        mouse_state.delta.y = (e.pageY - mouse_state.origin.y) * mouse_state.constant.y;

        state.transformation.rotation[1] -= mouse_state.delta.x;
        state.transformation.rotation[0] -= mouse_state.delta.y;

        mouse_state.origin.x = e.pageX;
        mouse_state.origin.y = e.pageY;

        e.preventDefault();
    }

    document.getElementById('canvas').addEventListener("mousedown", callbackMouseDown, false);
    document.getElementById('canvas').addEventListener("mouseup", callbackMouseUp, false);
    document.getElementById('canvas').addEventListener("mouseout", callbackMouseUp, false);
    document.getElementById('canvas').addEventListener("mousemove", callbackMouseMove, false);

    function callbackTimeoutIdle() {
        state.timeoutIdle = true;
    }

    function callbackBodyTimer() {
        state.timeoutIdle = false;
        var timer;
        clearTimeout(timer);
        timer = setTimeout(callbackTimeoutIdle, 2 * 1000)
    }
    document.body.addEventListener("mouseup", callbackBodyTimer, false);
}


main();
