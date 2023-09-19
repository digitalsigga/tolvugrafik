var gl;
var points;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.95, 1.0, 1.0, 1.0 );
    
    //  Generate vertices for Sierpinski Carpet
    var vertices = [];
    divideSquare(vertices, -1, 1, 2, 4); // Let's start with 3 iterations.
    var verticesFloat32Array = new Float32Array(vertices);
    
    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, verticesFloat32Array, gl.STATIC_DRAW ); // Use verticesFloat32Array

    // Associate our shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render(verticesFloat32Array);  // Pass verticesFloat32Array as an argument
};

function divideSquare(vertices, x, y, length, n) {
    if (n === 0) {
        // Finna hornin
        var squareVertices = [
            x, y, // top left
            x + length, y, // top right
            x, y - length, // bottom left
            x + length, y - length // bottom right
        ];

        // Append square vertices to the vertices array.
        for (var i = 0; i < squareVertices.length; i++) {
            vertices.push(squareVertices[i]);
        }
        return;
    }

    var subLength = length / 3;
    for (var dx = 0; dx < 3; dx++) {
        for (var dy = 0; dy < 3; dy++) {
            // Skip the middle square
            if (dx === 1 && dy === 1) continue;

            // Generate vertices for the smaller square
            divideSquare(vertices, x + dx * subLength, y - dy * subLength, subLength, n - 1);
        }
    }
}

 
function render(verticesFloat32Array) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (var i = 0; i < verticesFloat32Array.length / 8; i++) {
        gl.drawArrays(gl.TRIANGLE_STRIP, i * 4, 4);
    }
}