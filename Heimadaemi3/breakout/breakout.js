/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Ferningur skoppar um gluggann.  Notandi getur breytt
//     hraðanum með upp/niður örvum.
//
//    Hjálmtýr Hafsteinsson, september 2023
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

// Núverandi staðsetning miðju ferningsins
var box = vec2( 0.0, 0.0 );

// Stefna (og hraði) fernings
var dX;
var dY;

// Svæðið er frá -maxX til maxX og -maxY til maxY
var maxX = 1.0;
var maxY = 1.0;

// Hálf breidd/hæð ferningsins
var boxRad = 0.05;

// Ferningurinn er upphaflega í miðjunni
var vertices = new Float32Array([-0.2, -0.05, 0.2, -0.05, 0.2, 0.05, -0.2, 0.05]);

var bufferBox;
var bufferPad;
var vPosition;
var xmove = 0.0;

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    
    // Gefa ferningnum slembistefnu í upphafi
    dX = Math.random()*0.1-0.05 * 0.5;
    dY = Math.random()*0.1-0.05 * 0.5;


    // Gera kassi
    var Ballvertices = [
        vec2( -0.05, -0.05 ),
        vec2( -0.05, 0.05),
        vec2(  0.05, 0.05 ),
        vec2(  0.05, -0.05 )
    ];

    // kassi í buffer  
    // Load the data into the GPU
    bufferBox = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferBox );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(Ballvertices), gl.DYNAMIC_DRAW );
     
    // Associate out shader variables with our data buffer EKKI VISS MEÐ ÞETTA
    // var vPosition = gl.getAttribLocation( program, "vPosition" );
    //     gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    //     gl.enableVertexAttribArray( vPosition );


    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    bufferPad = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferPad );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.DYNAMIC_DRAW );

    // Associate out shader variables with our data buffer
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    locBox = gl.getUniformLocation( program, "boxPos" );

    // Meðhöndlun örvalykl


    // Event listener for keyboard
    window.addEventListener("keydown", function(e){
        switch( e.key) {
            case "ArrowLeft":	// vinstri ör
                xmove -= 0.1;
                break;
            case "ArrowRight":	// hægri ör
                xmove += 0.1;
                break;
            default:
                xmove = 0.0;
        }
        for(i=0; i<4; i++) {
            vertices[i][0] += xmove;
        }});

        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(vertices));

    render();
}


function render() {
    
    // Láta ferninginn skoppa af veggjunum
    if (Math.abs(box[0] + dX) > maxX - boxRad) dX = -dX;
    if (Math.abs(box[1] + dY) > maxY - boxRad) dY = -dY;

    // Uppfæra staðsetningu
    box[0] += dX;
    box[1] += dY;
    
    gl.clear( gl.COLOR_BUFFER_BIT );
    //
    gl.uniform2fv( locBox, flatten(box) );
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferBox );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );

    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

    if (box[1] <= -0.85 && 
        box[0] > -0.2 + xmove &&
        box[0] < 0.2 + xmove) {console.log("asd")
        dX = -dX
        dY = -dY
    }
    gl.uniform2fv( locBox, flatten([xmove, -0.9]));
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferPad );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );


    window.requestAnimFrame(render);
}
