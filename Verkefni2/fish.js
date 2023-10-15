/////////////////////////////////////////////////////////////////
//    S�nid�mi � T�lvugraf�k
//     Fiskur samsettur �r ferhyrndu spjaldi (b�kur) og
//     �r�hyrningi (spor�ur).  H�gt er a� sn�a me� m�sinni og
//     f�ra til me� upp- og ni�ur-�rvum (e�a m�sarhj�li).
//
//    Hj�lmt�r Hafsteinsson, okt�ber 2023
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var NumVertices  = 12;
var NumBody = 6;
var NumTail = 3;
var NumUgg = 3;

var offsetLoc;
var offset = [0,-0.9];


// Hn�tar fisks � xy-planinu
var vertices = [
    // l�kami (spjald)
    vec4( -0.5,  0.0, 0.0, 1.0 ),
	vec4(  0.2,  0.2, 0.0, 1.0 ),
	vec4(  0.5,  0.0, 0.0, 1.0 ),
	vec4(  0.5,  0.0, 0.0, 1.0 ),
	vec4(  0.2, -0.15, 0.0, 1.0 ),
	vec4( -0.5,  0.0, 0.0, 1.0 ),
	// spor�ur (�r�hyrningur)
    vec4( -0.5,  0.0, 0.0, 1.0 ),
    vec4( -0.65,  0.15, 0.0, 1.0 ),
    vec4( -0.65, -0.15, 0.0, 1.0 ),
    // Uggi
    vec4( -0.1, -0.1, 0.0, 1.0 ),
    vec4( -0.1,  0.1, 0.0, 1.0 ),
    vec4( 0.0,  0.0, 0.0, 1.0 )
];


var movement = false;     // Er m�sarhnappur ni�ri?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var rotTail = 0.0;        // Sn�ningshorn spor�s
var incTail = 2.0;        // Breyting � sn�ningshorni
var rotUgg = 0.0;        // Sn�ningshorn spor�s
var incUgg = 1.0; 

var zView = 2.0;          // Sta�setning �horfanda � z-hniti

var proLoc;
var mvLoc;
var colorLoc;

let fish_loc = new Array(10).fill(null).map(_ => {
    return vec3(Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10)
})

let fish_col = new Array(fish_loc.length).fill(null).map(_=> {
    return vec4(Math.random(), Math.random(), Math.random(), 1.0)
}) 

let fish_move = new Array(fish_loc.length).fill(null).map(_=> {
    return vec3(0.02*(2*Math.random() - 1, 2*Math.random() +  1, 2*Math.random() +1))
}) 


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.95, 1.0, 1.0, 1.0 );
 
    gl.enable(gl.DEPTH_TEST);
 
    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    colorLoc = gl.getUniformLocation( program, "fColor" );

    proLoc = gl.getUniformLocation( program, "projection" );
    mvLoc = gl.getUniformLocation( program, "modelview" );

    // Setjum ofanvarpsfylki h�r � upphafi
    var proj = perspective( 90.0, 1.0, 0.1, 100.0 );
    gl.uniformMatrix4fv(proLoc, false, flatten(proj));
    

    // Atbur�af�ll fyrir m�s
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
    	    spinY += (e.offsetX - origX) % 360;
            spinX += (e.offsetY - origY) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );
    
    // Atbur�afall fyrir lyklabor�
     window.addEventListener("keydown", function(e){
         switch( e.keyCode ) {
            case 38:	// upp �r
                zView += 0.2;
                break;
            case 40:	// ni�ur �r
                zView -= 0.2;
                break;
         }
     }  );  

    // Atbur�afall fyri m�sarhj�l
     window.addEventListener("mousewheel", function(e){
         if( e.wheelDelta > 0.0 ) {
             zView += 0.2;
         } else {
             zView -= 0.2;
         }
     }  );  

    render();
}


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var mv = lookAt( vec3(0.0, 0.0, zView), vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0) );
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) );


    rotUgg += incUgg;
    if(rotUgg > 35.0 || rotUgg < -35.0)
    incUgg *= -1;

    rotTail += incTail;
    if( rotTail > 35.0  || rotTail < -35.0 )
        incTail *= -1;

        const time = Date.now();

        for (let i = 0; i < fish_loc.length; ++i) { // Innri lykkja teikna öll elements hvers fisks og jafn mörg og fish loc 
            gl.uniform4fv(colorLoc, fish_col[i] );
            // Teikna l�kama fisks (�n sn�nings)
                   fish_loc[i] = add(fish_loc[i], fish_move[i]);

        // Ensure fish does not go too far away, if it does, invert direction
        for (let j = 0; j < 3; j++) {
            if (Math.abs(fish_loc[i][j]) > 10) {
                fish_move[i][j] *= -1; 
            }
        }
        
            mv = mult(mv, translate(add(fish_loc[i], fish_move[i])))
            gl.uniformMatrix4fv(mvLoc, false, flatten(mv));
            gl.drawArrays( gl.TRIANGLES, 0, NumBody );
    
            // Teikna spor� og sn�a honum
            let mvs = mult( mv, translate ( -0.5, 0.0, 0.0 ) );
         mvs = mult( mvs, rotateY( rotTail ) );
        mvs = mult( mvs, translate ( 0.5, 0.0, 0.0 ) );
        
         gl.uniformMatrix4fv(mvLoc, false, flatten(mvs));
            gl.drawArrays( gl.TRIANGLES, NumBody, NumTail);
    
            // Teikna ugg og sn�a honum
        // To rotate the ugg, modify the model-view matrix here.
            let mvu = mult( mv, rotateY(90 - rotUgg) );
            mvu = mult( mvu, translate ( 0.1, 0.0, 0.0 ) );
        // gl.uniform4fv( colorLoc, fish_col[i] );
            gl.uniform4fv( colorLoc, fish_col[i].map(c => c -0.3) );

            gl.uniformMatrix4fv(mvLoc, false, flatten(mvu));
        
            gl.drawArrays( gl.TRIANGLES, NumBody + NumTail, 3 );
    
        // let mvuMirror = mult( mv, scalem(1, -1, 1) ); // mirror across the Y-axis
            let mvuMirror = mult( mv, rotateY(270 + rotUgg) );
            mvuMirror = mult( mvuMirror, translate ( 0.1, 0.0, 0.0 ) );
        //gl.uniform4fv( colorLoc, vec4(0.10, 1.0, 0.9, 1.0) );
            gl.uniformMatrix4fv(mvLoc, false, flatten(mvuMirror));
            gl.drawArrays( gl.TRIANGLES, NumBody + NumTail, 3 );
        }

    requestAnimFrame( render );
}

