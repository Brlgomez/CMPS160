
var canvas;
var gl;

var index = 0;

var points = [];
var normals = [];

var planePoints = [];
var planeColor = [];

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

var numTimesToSubdivide = 3;

var count = 0.0;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

var lightX = -2.0;
var shadingX = 2.0;
var cartoon = 1.0;
var shadingY = 0.5;
var shadingZ = 1.0;
var lightPositionLoc;
var lightPosition = vec4( lightX, 1.0, 1.0, 0.0 );
var lightAmbient = vec4( 0.3, 0.3, 0.4, 1.0 );
var lightDiffuse = vec4( shadingX * cartoon, 0.2, 1.0, 1.0 );
var lightSpecular = vec4( 0.5, 0.5, 0.5, 1.0 );

var materialAmbient = vec4( 0.0, shadingY, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.5, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;
var materialShininessLoc;

var ambientProductLoc;
var diffuseProductLoc;
var specularProductLoc;
var ctm;
var ambientColor, diffuseColor, specularColor;

var onOff = 0.0;

function triangle(a, b, c) 
{

    if(onOff == 0.0){
	var ab = mix( a, b, 0.5);
	var ac = mix( a, c, 0.5);
	var bc = mix( b, c, 0.5);
	normals.push(ab);
	normals.push(ac);
	normals.push(bc);
    }
    if(onOff == 1.0){
	normals.push(a);
	normals.push(b);
        normals.push(c);
    }
     
    points.push(a);
    points.push(b);
    points.push(c);

    index += 3;
}

function divideTriangle( a, b, c, counter )
{
    if ( counter > 0 ) {

        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle( a, ab, ac, counter - 1 );
        divideTriangle( ab, b, bc, counter - 1 );
        divideTriangle( bc, c, ac, counter - 1 );
        divideTriangle( ab, bc, ac, counter - 1 );
    }
    else {
        triangle( a, b, c );
    }
}

function tetrahedron( a, b, c, d, n )
{
    divideTriangle( a, b, c, n );
    divideTriangle( d, c, b, n );
    divideTriangle( a, d, b, n );
    divideTriangle( a, c, d, n );
}

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

    var vert2 = [
		 vec4(-100.0, -1.0, -50.0, 1.0),
		 vec4(100.0, -1.0, -50.0, 1.0),
		 vec4(-100.0, -1.0, 50.0, 1.0),
		 vec4(100.0, -1.0, 50.0, 1.0)
		 ];
    
    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
    drawFloor(vert2[0], vert2[1], vert2[2], vert2[3]);
   
    // Create a buffer object, initialize it, and associate it with the
    // associated attribute variable in our vertex shader

    // For Sphere
    
    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );
    
    // For Floor
    
    //var pCBuffer = gl.createBuffer();
    //gl.bindBuffer(gl.ARRAY_BUFFER, pCBuffer);
    //gl.bufferData(gl.ARRAY_BUFFER, flatten(planeColor), gl.STATIC_DRAW);

    //var pBuffer = gl.createBuffer();
    //gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    //gl.bufferData(gl.ARRAY_BUFFER, flatten(planePoints), gl.STATIC_DRAW);

    //gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    //gl.vertexAttribPointer(vNormal, 4, gl.FLOAT,false,0,0);
    
    thetaLoc = gl.getUniformLocation(program, "theta");
    projectionLoc = gl.getUniformLocation(program, "projection");
    xdirLoc = gl.getUniformLocation(program, "xdir");
    ydirLoc = gl.getUniformLocation(program, "ydir");
    zdirLoc = gl.getUniformLocation(program, "zdir");
    modelViewLoc = gl.getUniformLocation(program, "modelView");
    ambientProductLoc = gl.getUniformLocation(program, "ambientProduct");
    diffuseProductLoc = gl.getUniformLocation(program, "diffuseProduct");
    specularProductLoc = gl.getUniformLocation(program, "specularProduct");
    lightPositionLoc = gl.getUniformLocation(program, "lightPosition");
    materialShininessLoc = gl.getUniformLocation(program, "shininess");
    

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
	    case 81:
		if(lightX < 5.0){
		    lightX += 0.5;
		}
		break;
	    case 69:
		if(lightX > -5.0){
		    lightX -= 0.5;
		}
		break;
	    case 90:
		if(shadingX == 2.0){
		    shadingX -= 2.0;
		    shadingY -= 0.5;
		}
		break;
	    case 67:
		if(shadingX == 0.0){
		    shadingX += 2.0;
		    shadingY += 0.5;
		}
		break;
	    case 70:
		if(onOff == 1.0){
		    onOff = 0.0;
		    index = 0;
		    points = [];
		    normals = [];
		    init();
		}
		break;
	    case 86:
		if(onOff == 0.0){
		    onOff = 1.0;
                    index = 0;
                    points = [];
                    normals = [];
                    init();
		}
		break;
	    case 49:
		cartoon = 1.0;
		break;
	    case 50:
		cartoon = 2000.0;
		break;
	    }
	});
    
    render();
};

function drawFloor(a, b, c, d)
{    
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
	    // Add 6 points that make the square.
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
    
    lightPosition = vec4(lightX, 1.0, 1.0, 0.0 );
    lightDiffuse = vec4(shadingX * cartoon, 0.2, 1.0, 1.0 );
    materialAmbient = vec4(0.0, shadingY, 1.0, 1.0 );
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    
    gl.uniform4fv(ambientProductLoc, flatten(ambientProduct));
    gl.uniform4fv(diffuseProductLoc, flatten(diffuseProduct));
    gl.uniform4fv(specularProductLoc, flatten(specularProduct));
    gl.uniform4fv(lightPositionLoc, flatten(lightPosition));
    gl.uniform1f(materialShininessLoc, materialShininess);

    eye = vec3(radius * Math.sin(theta2) * Math.cos(phi),
	       radius * Math.sin(theta2) * Math.sin(phi),
	       radius * Math.cos(theta2));
    var modelViewMatrix = lookAt(eye, at, up);
    
    var perspect = perspective(FOV, ratio, .1, 100); 

    gl.uniformMatrix4fv(modelViewLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionLoc, false, flatten(perspect));
    
    //gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    //gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    //gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0,0);
    //gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0,0); 

    for (var i=0; i < index; i+=3){
    	gl.drawArrays( gl.TRIANGLES, i, 3 );
    }
    
    //gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    //gl.bufferData(gl.ARRAY_BUFFER, flatten(planePoints), gl.STATIC_DRAW);
    //gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0,0);
    //gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0,0); 
    //gl.drawArrays(gl.TRIANGLES, 0, planePoints.length); 
    
    requestAnimFrame(render);
}
