/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Sýnir hvernig hægt er að breyta lit með uniform breytu
//
//    Hjálmtýr Hafsteinsson, ágúst 2023
/////////////////////////////////////////////////////////////////
var gl;
var points;

var NumPoints = 400;
var colorLoc;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.
    var vertices = new Float32Array([ 0.0, 0.0
        ]);
    //  Configure WebGL

    var newVertices = [];

     for (var i = 0; i < NumPoints; ++i) {
        //var random = Math.random();
        for (var j = 0; j < vertices.length; ++j) {
            //newVertices.push(vertices[j] + Math.random());
            newVertices.push(vertices[j] + Math.random() * 2 - 1);
        }
    }

    var triangles = [];

    var triangles = [];
var r = 0.1; // radius; you can adjust this value as needed

//Búa til þríhyrninga í kringum punktana

for (var i = 0; i < newVertices.length; i += 2) {
    var x = newVertices[i];
    var y = newVertices[i + 1];

    // First vertex
    var x1 = x + r * Math.cos(Math.PI / 2);
    var y1 = y + r * Math.sin(Math.PI / 2);

    // Second vertex
    var x2 = x + r * Math.cos(7 * Math.PI / 6);
    var y2 = y + r * Math.sin(7 * Math.PI / 6);

    // Third vertex
    var x3 = x + r * Math.cos(11 * Math.PI / 6);
    var y3 = y + r * Math.sin(11 * Math.PI / 6);

    // Push the vertices into the triangles array
    triangles.push(x1, y1, x2, y2, x3, y3);
}
    var triangles = new Float32Array(triangles); 

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(triangles), gl.STATIC_DRAW );

    // Associate shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Find the location of the variable fColor in the shader program
    colorLoc = gl.getUniformLocation( program, "fColor" );

    render();
}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );

    for (var i = 0; i < NumPoints; i += 3) {
        gl.uniform4fv(colorLoc, new Float32Array([Math.random(), Math.random(), Math.random(), 1]));
        gl.drawArrays(gl.TRIANGLES, i, 3);
    }

}