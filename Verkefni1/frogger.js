/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Sýnir hvernig hægt er að breyta lit með uniform breytu
//
//    Hjálmtýr Hafsteinsson, ágúst 2023
/////////////////////////////////////////////////////////////////

var gl;
var points;
var bufferSafespace;
var bufferTriangle; // Declare bufferId globally
var vPosition;

var colorLoc;
var offsetLoc;
var trianglePosition = [0.0, -0.9]; // Initial position of the triangle
var offset = [0,0];


window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // Initialize the vertices for a smaller triangle positioned at the bottom
    var triangle = new Float32Array([
        -0.05, -1,  // Bottom-left vertex
         0.05, -1,  // Bottom-right vertex
         0.0, -0.9  // Top vertex
    ]);

    var safespace = new Float32Array([
         -1, 1,  // Bottom-left vertex
         -1, 0.9,  // Bottom-right verte
         1, 0.9,  // Top vertex
         1, 1,  // Top vertex

         -1, 0.05,  // Bottom-left vertex
         -1, -0.05,  // Bottom-right verte
         1, -0.05,  // Top vertex
         1, 0.05,  // Top vertex
         

         -1, -1,  // Bottom-left vertex
         -1, -0.9,  // Bottom-right verte
         1, -0.9,  // Top vertex
         1, -1,  // Top vertex
         
    ]);

    //var triangles = new Float32Array(vertices);

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    // Triangle
    bufferTriangle = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferTriangle );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(triangle), gl.STATIC_DRAW );
    // Safe space
    bufferSafespace = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferSafespace );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(safespace), gl.STATIC_DRAW );

    // Associate shader variables with our data buffer
    
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Find the location of the variable fColor in the shader program
    colorLoc = gl.getUniformLocation( program, "fColor" );
    offsetLoc = gl.getUniformLocation( program, "offset" );


    render();
}

window.addEventListener("keydown", function (event) {
    switch (event.code) {
        case "ArrowUp":
            offset[1] += 0.05;
            console.log('hi');
            break;
        case "ArrowDown":
            offset[1] -= 0.05;
            break;
        case "ArrowLeft":
            offset[0] -= 0.05;
            break;
        case "ArrowRight":
            offset[0] += 0.05;
            break;
    }
    // render(); // Update and render on key press
});


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

        // Draw the safe space
        gl.uniform4fv(offsetLoc, new Float32Array([0, 0, 0.0, 0.0]));
        gl.uniform4fv(colorLoc, new Float32Array([1.0, 1.0, 0.0, 1.0]));
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferSafespace);
        gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        gl.drawArrays(gl.TRIANGLE_FAN, 4, 4);
        gl.drawArrays(gl.TRIANGLE_FAN, 8, 4);


    // gl.uniform4fv(offsetLoc, new Float32Array([0, 0, 0.0, 0.0]));
    // gl.uniform4fv(colorLoc, new Float32Array([1.0, 1.0, 0.0, 1.0]));
    // gl.bindBuffer(gl.ARRAY_BUFFER, bufferSafespace);
    // gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

    // Set the position of the triangle
    // var translatedVertices = new Float32Array([
    //     -0.05 + trianglePosition[0], -1.0 + trianglePosition[1],
    //     0.05 + trianglePosition[0], -1.0 + trianglePosition[1],
    //     0.0 + trianglePosition[0], -0.9 + trianglePosition[1]
    // ]);

    gl.uniform4fv(offsetLoc, new Float32Array([offset[0], offset[1], 0.0, 0.0]));
    gl.uniform4fv(colorLoc, new Float32Array([0.0, 1.0, 0.0, 1.0]));
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferTriangle);
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // gl.bufferData(gl.ARRAY_BUFFER, translatedVertices, gl.STATIC_DRAW);

    //gl.uniform4fv(offsetLoc, new Float32Array([offset[0], offset[1], 0.0, 0.0]));
    window.requestAnimationFrame(render);

}