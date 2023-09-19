/////////////////////////////////////////////////////////////////
//    Frogger
//
//    Sigríður Birna Matthíasdóttir, 2023
/////////////////////////////////////////////////////////////////

var gl;
var points;
var bufferSafespace;
var bufferTriangle; // Declare bufferId globally
var bufferCar;
var bufferScore;
var vPosition;

var rotation = 0.0;
var rotationLoc;
var colorLoc;
var offsetLoc;
var trianglePosition = [0.0, 0.0]; // Initial position of the triangle
var offset = [0,-0.9];
var bla = 0;


window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );;
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // Initialize the vertices for fríða the frog
    var triangle = new Float32Array([
        -0.05, -0.1,  // Bottom-left vertex
         0.05, -0.1,  // Bottom-right vertex
         0.0, 0.0  // Top vertex
    ]);

    // Initialize the vertices for cars
    var cars = new Float32Array([
        -0.1, 0.7,  // 
        -0.1, 0.6,  
        0.1, 0.6,  
        0.1, 0.7,  
    ]);

    var score = new Float32Array([
        -1, -1,  
        -1, -0.8,  
        -0.98, -0.8,  
        -0.98, -1.0, 
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

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    rotationLoc = gl.getUniformLocation(program, "rotation")
    // Load the data into the GPU
    // Triangle
    bufferTriangle = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferTriangle );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(triangle), gl.STATIC_DRAW );
    // Safe space
    bufferSafespace = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferSafespace );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(safespace), gl.STATIC_DRAW );
    // Car
    bufferCar = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferCar );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cars), gl.STATIC_DRAW );
    // Score
    bufferScore = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferScore );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(score), gl.STATIC_DRAW );

    // Associate shader variables with our data buffer
    
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // Find the location of the variable fColor in the shader program
    colorLoc = gl.getUniformLocation( program, "fColor" );
    offsetLoc = gl.getUniformLocation( program, "offset" );
  
    displayScore();  // Initialize the score display

    render();
}

window.addEventListener("keydown", function (event) {
    const stepSize = 0.05;
    const rotationUp = 0;  // 0 radians or 0 degrees
    const rotationDown = Math.PI;  // 180 degrees in radians

    switch (event.code) {
        case "ArrowUp":
            if (offset[1] + stepSize <= 1.0) { // Check top boundary
                console.log(offset);
                offset[1] += stepSize;
                if (rotation === rotationDown) { // If currently facing down
                    rotation = rotationUp;  // Make it face up
                } 
            }
            break;
        case "ArrowDown":
            if (offset[1] - stepSize >= -1.0) { // Check bottom boundary
                offset[1] -= stepSize;
                if (rotation === rotationUp) { // If currently facing up
                    rotation = rotationDown;  // Make it face down
                }
            }
            break;
        case "ArrowLeft":
            if (offset[0] - stepSize >= -1.0) { // Check left boundary
                offset[0] -= 0.1;
            }
            break;
        case "ArrowRight":
            if (offset[0] + stepSize <= 1.0) { // Check right boundary
                offset[0] += stepSize;
            }
            break;
    }

    if (offset[1] >= 0.9 && bla == 0) { // Assuming 0.9 is the topmost position
        updateScore(1) 
        bla = 1; // Add 1 to the score whenever the frog reaches the top
    } else if (offset[1] <= -0.9 && bla == 1){ // Assuming 0.9 is the topmost position
        updateScore(1) 
        bla = 0;
    }
    // render(); // Update and render on key press
});

function areRectanglesColliding(A, B) {
    return (A.x < B.x + B.width &&
            A.x + A.width > B.x &&
            A.y < B.y + B.height &&
            A.y + A.height > B.y);
}

let score = 6;  // Initialize score to 0

function updateScore(value) {
    score += value;  // Increase the score by the given value
    displayScore();  // Update the displayed score
}

function displayScore() {
    let scoreBoard = document.getElementById('scoreBoard');
    scoreBoard.innerHTML = "Score: " + score;
}

function render() {

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform1f(rotationLoc, 0.0);
    let isGameOver = false;

     // Draw the safe space
        gl.uniform4fv(offsetLoc, new Float32Array([0, 0, 0.0, 0.0]));
        gl.uniform4fv(colorLoc, new Float32Array([1.0, 1.0, 0.0, 1.0]));
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferSafespace);
        gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        gl.drawArrays(gl.TRIANGLE_FAN, 4, 4);
        gl.drawArrays(gl.TRIANGLE_FAN, 8, 4);

    // Draw frog  
    gl.uniform1f(rotationLoc, rotation);
    gl.uniform4fv(offsetLoc, new Float32Array([offset[0], offset[1], 0.0, 0.0]));
    gl.uniform4fv(colorLoc, new Float32Array([0.0, 1.0, 0.0, 1.0]));
   
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferTriangle);
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    const frogBoundingBox = {
        x: offset[0] - 0.05,
        y: offset[1] - 0.1,
        width: 0.1, // width of the frog (twice the half-width)
        height: 0.1 // height of the frog
    };

    // Draw car
    gl.uniform1f(rotationLoc, 0.0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferCar);
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    const time = Date.now();

    for (let r = 0; r < 6; ++r){   
        let laneSpeedMultipliers = [0.0005, 0.0004, 0.0003, 0.00025, 0.0002, 0.00015]; 
        let direction = r % 3 === 0 ? -1 : 1;
        for (let i = 0; i < 3; ++i){
            let laneSpeed = laneSpeedMultipliers[r];
            let carX = direction*((0.7 * i + time * laneSpeed) % 2.4 - 1.2);
            let carY = r * -0.27;
            
            const carBoundingBox = {
                x: -0.1 + carX,
                y: 0.6 + carY,
                width: 0.2,  // width of the car
                height: 0.1  // height of the car 
            };
            
            if (areRectanglesColliding(frogBoundingBox, carBoundingBox)) {
                console.table([frogBoundingBox, carBoundingBox]);  // Handle game over scenario here
                offset = [0,-0.9];

            }

            gl.uniform4fv(offsetLoc, new Float32Array([carX, carY, 0.0, 0.0]));
            gl.uniform4fv(colorLoc, new Float32Array([0.2 * i, 0.3 * i, 0.2*r, 1]));
            gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        }
    }
  // Draw score
    gl.uniform1f(rotationLoc, 0.0);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferScore);
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    for (let i = 0; i < score; ++i) {
        gl.uniform4fv(offsetLoc, new Float32Array([0.03 * i, 0.0, 0.0, 0.0]))
        gl.uniform4fv(colorLoc, new Float32Array([1.0, 0.0, 0.5, 1]));
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    }

    if (isGameOver) {
        return; // if game over, do not request the next animation frame.
    }

     window.requestAnimationFrame(render);

}