///////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Einfaldasta WebGL forritið.  Teiknar einn rauðan þríhyrning.
//
//    Hjálmtýr Hafsteinsson, ágúst 2023
///////////////////////////////////////////////////////////////////

var gl;

var locColor;
var locTime;
var locColor1;
var locColor2;
var iniTime;

window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    var vertices = new Float32Array([-1, -1, 0, 1, 1, -1]);

    // Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Associate shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    locColor = gl.getUniformLocation(program, "rcolor");
    locTime = gl.getUniformLocation(program, "time");

    locColor1 = gl.getUniformLocation(program, "color1");
    locColor2 = gl.getUniformLocation(program, "color2");

    // Initialize with random colors
    var color1 = randomColor();
    var color2 = randomColor();

    gl.uniform4fv(locColor1, flatten(color1));
    gl.uniform4fv(locColor2, flatten(color2));

    setInterval(function() {
        color1 = color2;  // Shift color2 to color1
        color2 = randomColor();  // Generate a new random color for color2

        gl.uniform4fv(locColor1, flatten(color1));
        gl.uniform4fv(locColor2, flatten(color2));
    }, 1000);  // Update colors every second

    iniTime = Date.now();
    render();
};

function randomColor() {
    return vec4(Math.random(), Math.random(), Math.random(), 1.0);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    var elapsed = (Date.now() - iniTime) / 1000.0;
    gl.uniform1f(locTime, elapsed);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    window.requestAnimFrame(render);
}
