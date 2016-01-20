var canvas;
var gl;

var points = [];

var theta = 0.0;
var thetaLoc;

var speed = 50.0;
var temp = 50.0;
var direction = true;
var change = 0.0;
var count = 10000;
var stop = false;

var red = 0.0;
var redLoc;
var changeRed = false;

var green = 0.0;
var greenLoc;
var changeGreen = false;
var blue = 0.0;
var blueLoc;
var changeBlue = false;

var strech = 0.0;
var strechLoc;
var strechBoolean = false;

var NumTimesToSubdivide = 6;

window.onload = function init(){
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" );}
                               
    //  Configure WebGL                             
    gl.viewport( 0, 0, canvas.width, canvas.height);
    gl.clearColor( 0.2, 0.6, 0.5, 0.9 );

    //  Load shaders and initialize attribute buffers                                  
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // First, initialize the corners of our gasket with three points.
    var vertices = [
	vec2( -1-0.3, -1+0.3),
        vec2(  0+0.3,  1+0.3 ),
        vec2(  1-0.3, -1+0.3 )
    ];

    divideTriangle( vertices[0], vertices[1], vertices[2],
                NumTimesToSubdivide);
   
    // Load the data into the GPU    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    
    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    thetaLoc = gl.getUniformLocation(program, "theta");
    redLoc = gl.getUniformLocation(program, "red");
    greenLoc = gl.getUniformLocation(program, "green");
    blueLoc = gl.getUniformLocation(program, "blue");
    strechLoc = gl.getUniformLocation(program, "strech");

    // Initialize event handlers
    window.onkeydown = function( event ) {
        var key = String.fromCharCode(event.keyCode);
        switch( key ) {
	case '1':
	    strechBoolean = !strechBoolean;
	    break;
	}
    };
    document.getElementById("slide").onchange = function(event){
	speed = event.target.value;
	change = (speed/temp)/7;
	if(speed >= 0.0){
	    direction = true;
	}
	else{
	    direction = false;
	}
    };
    document.getElementById("color").onclick = function(){
	changeRed = !changeRed
    };
    document.getElementById("colorGreen").onclick = function(){
        changeGreen = !changeGreen
    };
    document.getElementById("colorBlue").onclick = function(){
        changeBlue = !changeBlue
    };
    document.getElementById("reset").onclick = function(){
	change = 0.0;
    };
    document.getElementById("stop2").onclick = function(){
	stop = true;
    };
    document.getElementById("startover").onclick = function(){
	count = 10000;
	stop = false;
	change = (speed/temp)/7;
    };
   
    render();
};

function triangle( a, b, c, a )
{
    points.push( a, b, c, a );
}

function divideTriangle( a, b, c, count )
{
    // check for end of recursion   
    if ( count === 0 ) {
        triangle( a, b, c, a );
    }
    else {
        //bisect the sides
        var ab = mix( a, b, Math.random()*(.55-.45)+.45);
        var ac = mix( a, c, Math.random()*(.55-.45)+.45);
        var bc = mix( b, c, Math.random()*(.55-.45)+.45);
	ab = mix( ab, bc, .75);
        --count;
        // three new triangles
        divideTriangle( a, ac, ab, count );
	divideTriangle( ac, bc, c, count );
        divideTriangle( bc, b, ab, count );
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    if (direction == true){
	if(stop == false){
	    speed -= change;
	    theta = speed;
	}
	else{
	    speed -= change/1000 + count/100000;
	    if(count != 0){
		count -= 25;
		theta = speed;
	    }
	}
    }
    else{
	if(stop == false){
            speed -= change;
            theta = speed;
        }
        else{
            speed -= change/1000 - count/100000;
            if(count != 0){
                count -= 25;
                theta = speed;
            }
        }
    }
    gl.uniform1f(thetaLoc, theta);

    red = (changeRed ? 0.9: 0.0);
    gl.uniform1f(redLoc, red);

    green = (changeGreen ? 0.9: 0.0);
    gl.uniform1f(greenLoc, green);
    
    blue = (changeBlue ? 0.9: 0.0);
    gl.uniform1f(blueLoc, blue);

    strech = (strechBoolean ? 0.0: 1.0);
    gl.uniform1f(strechLoc, strech);

    gl.drawArrays( gl.LINE_STRIP, 0, points.length );
    setTimeout(function () {requestAnimFrame( render, canvas );}, 60);
}







