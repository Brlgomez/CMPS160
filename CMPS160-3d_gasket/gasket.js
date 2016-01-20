
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

var perspectLoc;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 1;

var theta = [0, 0, 0];
var thetaLoc;

var xdir = 0.0;
var xdirLoc;

var ydir = 0.0;
var ydirLoc;

var zdir = 0.0;
var zdirLoc;

var NumTimesToSubdivide = 2;

var count = 0.0;
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
    perspectLoc = gl.getUniformLocation(program, "perspect");
    xdirLoc = gl.getUniformLocation(program, "xdir");
    ydirLoc = gl.getUniformLocation(program, "ydir");
    zdirLoc = gl.getUniformLocation(program, "zdir");

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
    //planeColor.push(0.0, 0.0, 0.0);
    planePoints.push(a);
    planePoints.push(b);
    planePoints.push(c);
    planePoints.push(d);
    planePoints.push(b);
    planePoints.push(c);

    var i = 0;
    for (var z = 100.0; z > -100.0; z -= 5.0) {
	for (var x = -100.0; x < 100.0; x += 5.0) {
	    if (i % 2) {
		// Add 6 colors to current square.
	    }
	    else {
		// Add 6 different colors to current square.
	    }
	    // Add 6 points that make the square. Each point
	    // should be composed of x and z.
	    //planePoints.push(x, -1.0, z+5);
	    //planePoints.push(x+5, -1.0, z+5);
	    //planePoints.push(x+5, -1.0, z);
	    //planePoints.push(x, -1.0, z+5);
	    //planePoints.push(x+5, -1.0, z+5);
	    //planePoints.push(x, -1.0, z);
	    ++i;
	}
	++i;
    }
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
    var perspect = perspective(75, 1, .1, 10);
    gl.uniformMatrix4fv(perspectLoc, false, flatten(perspect));
    
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0,0); 
    gl.drawArrays( gl.TRIANGLES, 0, points.length );

    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(planePoints), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0,0);
    gl.drawArrays(gl.TRIANGLES, 0, planePoints.length);
    
    requestAnimFrame(render);
}
