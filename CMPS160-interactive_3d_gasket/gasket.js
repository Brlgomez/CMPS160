
var canvas;
var gl;

var points = [];
var colors = [];

var planePoints = [];
var planeColor = [];

var cBuffer;
var vBuffer;
var vColor;
var vPosition;
var pBuffer;

var projectionLoc;
var FOV = 90;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);
var ratio = 1.0;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 1;

var theta = [0, 0, 0];
var thetaLoc;

var theta2 = 0.0;
var radius = 2.0;
var phi = 0.0;
var modelViewLoc;

var xdir = 0.0;
var xdirLoc;

var ydir = 0.0;
var ydirLoc;

var zdir = 0.0;
var zdirLoc;

var NumTimesToSubdivide = 2;

var count = 0.0;
var index = 0;
window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //  Configure WebGL

    gl.viewport( 0.0, 0.0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 0.6, 0.6, 1.0 );

    // enable hidden-surface removal

    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );

    gl.useProgram( program );

    var vertices = [
		    vec3(  0.0000,  0.0000, -1.0000 ),
		    vec3(  0.0000,  0.9428,  0.3333 ),
		    vec3( -0.8165, -0.4714,  0.3333 ),
		    vec3(  0.8165, -0.4714,  0.3333 )
		    ];
    var vert2 = [
		 vec3(-100.0, -1.0, -50.0),
		 vec3(100.0, -1.0, -50.0),
		 vec3(-100.0, -1.0, 50.0),
		 vec3(100.0, -1.0, 50.0)
		 ];

    divideTetra( vertices[0], vertices[1], vertices[2], vertices[3],
               NumTimesToSubdivide);
    
    drawFloor(vert2[0], vert2[1], vert2[2], vert2[3]);
   
    // Create a buffer object, initialize it, and associate it with the
    // associated attribute variable in our vertex shader

    // For Gasket
    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    
    vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // For Floor
    pCBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pCBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(planeColor), gl.STATIC_DRAW);

    pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(planePoints), gl.STATIC_DRAW);

    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);

    thetaLoc = gl.getUniformLocation(program, "theta");
    projectionLoc = gl.getUniformLocation(program, "projection");
    xdirLoc = gl.getUniformLocation(program, "xdir");
    ydirLoc = gl.getUniformLocation(program, "ydir");
    zdirLoc = gl.getUniformLocation(program, "zdir");
    modelViewLoc = gl.getUniformLocation(program, "modelView");

    document.getElementById("buttonx").onclick = function(){
	axis = xAxis;
	count ++;
    };
    
    document.getElementById("buttony").onclick = function(){
	axis = yAxis;
	count++;
    }; 

    document.getElementById("buttonz").onclick = function(){
	axis = zAxis;
	count++;
    }; 

    document.getElementById("transx").onchange = function(event){
	xdir = event.target.value;
    };

    document.getElementById("transy").onchange = function(event){
	ydir = event.target.value;
    };

    document.getElementById("transz").onchange = function(event){
        zdir = event.target.value;
    };

    document.getElementById("fov").onchange = function(event){
	FOV = event.target.value;
    };
    
    document.getElementById("ratio").onchange = function(event){
	ratio = event.target.value;
    };

    window.addEventListener("keydown", function() {
	    switch(event.keyCode){
	    case 65:
		theta2 -= 0.1;
		break;
	    case 68:
		theta2 += 0.1;
		break;
	    case 87:
		if (radius > 1.0){
		    radius -= 0.1;
		}
		break;
	    case 83:
		if (radius < 9.5){
		    radius += 0.1;
		}
		break;
	    case 49:
		NumTimesToSubdivide++;
		if (NumTimesToSubdivide < 5){
		    index = 0;
		    points = [];
		    init();
		}
		break;
	    case 50:
		NumTimesToSubdivide--;
		if (NumTimesToSubdivide > 0){
		    index = 0;
		    points = [];
		    init();
		}
		break;
	    }
	});
    
    render();
};

function triangle( a, b, c, color )
{
    // add colors and vertices for one triangle
    var baseColors = [
		      vec3(0.1, 0.7, 0.9),
		      vec3(0.2, 0.9, 0.5),
		      vec3(0.3, 0.5, 0.9),
		      vec3(0.4, 0.9, 0.7),
		      vec3(1.0, 1.0, 1.0)
		      ];

    colors.push( baseColors[color] );
    points.push( a );
    colors.push( baseColors[color] );
    points.push( b );
    colors.push( baseColors[color] );
    points.push( c );
    colors.push( baseColors[4] );
    index += 3;
}

function tetra( a, b, c, d )
{
    // tetrahedron with each side using
    // a different color
    triangle( a, c, b, 0 );
    triangle( a, c, d, 1 );
    triangle( a, b, d, 2 );
    triangle( b, c, d, 3 );
}

function divideTetra( a, b, c, d, count )
{
    // check for end of recursion
    if ( count === 0 ) {
        tetra( a, b, c, d );
    }
    // find midpoints of sides
    // divide four smaller tetrahedra
    else {
        var ab = mix( a, b, 0.5 );
        var ac = mix( a, c, 0.5 );
        var ad = mix( a, d, 0.5 );
        var bc = mix( b, c, 0.5 );
        var bd = mix( b, d, 0.5 );
        var cd = mix( c, d, 0.5 );

        --count;
        
        divideTetra(  a, ab, ac, ad, count );
        divideTetra( ab,  b, bc, bd, count );
        divideTetra( ac, bc,  c, cd, count );
        divideTetra( ad, bd, cd,  d, count );
    }
}

function drawFloor(a, b, c, d)
{    
    planePoints.push(a);
    planePoints.push(b);
    planePoints.push(c);
    planePoints.push(d);
    planePoints.push(b);
    planePoints.push(c);
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if( theta[axis] != count){
	theta[axis] += 1;
    }
    gl.uniform3fv(thetaLoc, theta);
    gl.uniform1f(xdirLoc, xdir);
    gl.uniform1f(ydirLoc, ydir);
    gl.uniform1f(zdirLoc, zdir);
    
    eye = vec3(radius * Math.sin(theta2) * Math.cos(phi),
	       radius * Math.sin(theta2) * Math.sin(phi),
	       radius * Math.cos(theta2));
    var modelViewMatrix = lookAt(eye, at, up);
    
    var perspect = perspective(FOV, ratio, .1, 100);
    
    gl.uniformMatrix4fv(modelViewLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionLoc, false, flatten(perspect));
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0,0);
    for (var i=0; i < index; i+=3){
	gl.drawArrays( gl.TRIANGLES, i, 3 );
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(planePoints), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0,0);
    gl.drawArrays(gl.TRIANGLES, 0, planePoints.length);
    
    requestAnimFrame(render);
}
