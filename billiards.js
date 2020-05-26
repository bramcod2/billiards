//------------------------------------------------------------
// Global variables
//------------------------------------------------------------
var gl;
var circleVertexPositionBuffer;
var circleVertexColorBuffer;
var mvMatrixLoc;
var ColorLoc;
var balls = [];
var mouseDownPos = {};
var mouseLoc;
var mvGlobalMatrix = [];
var velocity = [];
var choiceColors = [];
var lvertices = [];
var mouseDown = false;
var cue = [];

var program;// = initShaders(gl, "vertex-shader", "fragment-shader");

var cueProgram = initShaders(gl, 'vertex-shader5', 'fragment-shader5');

var positionBufferId;
var colorBufferId;

function animate() {
  // TODO: compute elapsed time from last render and update the balls'
    // positions and velocities accordingly.
    //wall collisions
    mvGlobalMatrix[0] = mult(mvGlobalMatrix[0], translate(velocity[0]));
    if (mvGlobalMatrix[0][0][3] > 0.95 || mvGlobalMatrix[0][0][3] < -0.95) {
        velocity[0][0] = -velocity[0][0];
    }
    if (mvGlobalMatrix[0][1][3] > 0.95 || mvGlobalMatrix[0][1][3] < -0.95) {
        velocity[0][1] = -velocity[0][1];
    }
//wall collisions
    mvGlobalMatrix[1] = mult(mvGlobalMatrix[1], translate(velocity[1]));
    if (mvGlobalMatrix[1][0][3] > 0.95 || mvGlobalMatrix[1][0][3] < -0.95) {
        velocity[1][0] = -velocity[1][0];
    }
    if (mvGlobalMatrix[1][1][3] > 0.95 || mvGlobalMatrix[1][1][3] < -0.95) {
        velocity[1][1] = -velocity[1][1];
    }

    //http://gamedev.stackexchange.com/questions/20516/ball-collisions-sticking-together
    // by aaaaaaaaaaaa
    // yes this is no joke...
    // it is really by aaaaaaaaaaaa
    var xDist, yDist, distanceBetween;
    for (var i = 0; i < 2; i++) {
        var A = mvGlobalMatrix[i];
        for (var j = i + 1; j < 2; j++) {
            var B = mvGlobalMatrix[j];
            xDist = A[0][3] - B[0][3];
            yDist = A[1][3] - B[1][3];
            var distSquared = xDist * xDist + yDist * yDist;
            if (distSquared <= (0.05 + 0.05) * (0.05 + 0.05)) {

                var xVel = velocity[j][0] - velocity[i][0];
                var yVel = velocity[j][1] - velocity[i][1];
                var dotProduct = xDist * xVel + yDist * yVel;
                if (dotProduct > 0) {
                    var collisionScale = dotProduct / distSquared;
                    var xCollision = xDist * collisionScale;
                    var yCollision = yDist * collisionScale;

                    var combinedMass = 4; // 2 + 2 ?
                    var collisionWeightA = 2 * 2 / combinedMass;// 2 for weight
                    var collisionWeightB = 2 * 2 / combinedMass;

                    velocity[i][0] += collisionWeightA * xCollision;
                    velocity[i][1] += collisionWeightA * yCollision;

                    velocity[j][0] -= collisionWeightB * xCollision;
                    velocity[j][1] -= collisionWeightB * yCollision;
                }
            }
        }
    }



    for (var i = 0; i < 2; i++) { //decleration
        for (var j = 0; j < 3; j++)
        {
            velocity[i][j] = velocity[i][j] * .98;
        }
    }
}

function tick() {
  requestAnimFrame(tick);
  render();
  animate();
}

//------------------------------------------------------------
// render()
//------------------------------------------------------------
function render() {
    // Draw
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (var i = 0; i < 2; i++) {
        var mvMatrix = mat4();

        gl.uniformMatrix4fv(mvMatrixLoc, false, flatten(mvGlobalMatrix[i]));
        gl.uniform4f(ColorLoc, choiceColors[i][0], choiceColors[i][1],
            choiceColors[i][2], choiceColors[i][3]);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, 63);
    }
    if (mouseDown) {
        //// Create position buffer for cue stick
        cueProgram = initShaders(gl, 'vertex-shader5', 'fragment-shader5');
        console.log(cueProgram);
        //gl.useProgram(cueProgram);

        //// Create position buffer
        //positionBufferId = gl.createBuffer();
        //gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferId);
        //var sPosition = gl.getAttribLocation(cueProgram, "sPosition");
        //gl.vertexAttribPointer(sPosition, 2, gl.FLOAT, false, 0, 0);
        //gl.enableVertexAttribArray(sPosition);
        //mouseLoc = gl.getUniformLocation(cueProgram, "mouse");



        function render5() {
            if (init) {
                render5.thetaInc = 0.05;
                init = false;
                // Load the vertices once
                var vertices = [
                vec2(-0.5, -0.5),
                vec2(0.5, -0.5)
            ];
            gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
            render5.n = vertices.length;


            render5.mouseDown = false;
            var canvas = document.getElementById('gl-canvas');
            canvas.addEventListener('mousedown', function() {
                render5.mouseDown = true;
                gl.uniform2f(mouseLoc,
                             event.clientX,
                             event.clientY);
            });
            canvas.addEventListener('mousemove', function() {
                if (render5.mouseDown) {
                    gl.uniform2f(mouseLoc,
                                 event.clientX,
                                 event.clientY);
                }
            });
            canvas.addEventListener('mouseup', function() {
                render5.mouseDown = false;
            });
        }

      }
    }


}

//------------------------------------------------------------
// Initialization
//------------------------------------------------------------
/**
 * Initializes webgl, shaders and event callbacks.
 */
window.onload = function init() {
  var canvas = document.getElementById('gl-canvas');
  var canvasWidth = canvas.width;
  var canvasHeight = canvas.height;

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("WebGL isn't available");
  }

  //----------------------------------------
  // Configure WebGL
  //----------------------------------------
  gl.viewport(0, 0, canvasWidth, canvasHeight);
  gl.clearColor(0.0, 0.8, 0.0, 1.0);

  //----------------------------------------
  // TODO: load shaders and initialize attribute
  // buffers
    //----------------------------------------
  var vShader = document.getElementById('ball-vshader');
  var fShader = document.getElementById('ball-fshader');
  var shaderProgram = initShaders(gl, vShader.id, fShader.id);

  gl.useProgram(shaderProgram);

  initBuffers();
  //initCueBuffers();
  //----------------------------------------
  // TODO: write event handlers
    //----------------------------------------

  var canvas = document.getElementById('gl-canvas');

  canvas.onmousedown = function(e) {
      mouseDown = true;
      console.log(mouseDown);
      mouseDownPos.x = e.clientX;
      mouseDownPos.y = e.clientY;

      //console.log('buttonPress ' + mouseDownPos.x);
  };
  canvas.onmouseup = function(e) {
      var releaseX = e.clientX;
      var releaseY = e.clientY;

      var xVel = (mouseDownPos.x - releaseX) / 1500;
      var yVel = (releaseY - mouseDownPos.y) / 1500;

      velocity[0][0] += xVel;
      velocity[0][1] += yVel;
      mouseDown = false;
  };

  canvas.onmousemove = function(e) {
      var x = e.clientX;
      var y = e.clientY;

      if (mouseDown) {
          cue = [
              x, y, 0,
              mouseDownPos.x, mouseDownPos.y, 0
          ];

          console.log(cue);
          //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lvertices),
          //              gl.STATIC_DRAW);
      }
  };

  tick();
};


//From 3.1-3.6
function initBuffers() {

    var program = initShaders(gl, 'ball-vshader', 'ball-fshader');
    gl.useProgram(program);

    var points = [
    ];
    var colors = [];

    choiceColors.push(vec4(0.0, 0.0, 0.0, 1.0));
    choiceColors.push(vec4(1.0, 0.0, 1.0, 1.0));

    for (var theta = 0; theta < 2 * Math.PI; theta = theta + 0.1) {
        var x = 0.05 * Math.cos(theta);
        var y = 0.05 * Math.sin(theta);
        points.push(vec4(x, y, 0.0, 1.0));
        colors.push(choiceColors[1]);
    }
    var ball = {
        'points': points,
        'velocity': 0,
        'color': colors
    };
    balls.push(ball);

    var mvMatrix = mat4();
    mvMatrixLoc = gl.getUniformLocation(program, 'mvMatrix');

    ColorLoc = gl.getUniformLocation(program, 'Color');
    // initial velocities
    velocity[0] = vec3(-0.05, 0.02, 0);
    velocity[1] = vec3(0.0, 0.0, 0);

    //initialize positions
    mvGlobalMatrix[0] = (mult(mvMatrix, translate(-0.5, 0.5, 0.5)));
    mvGlobalMatrix[1] = (mult(mvMatrix, translate(0.5, 0.5, 0.5)));

    //initialize colors
    choiceColors[0] = vec4(1.0, 1.0, 1.0, 1.0);
    choiceColors[1] = vec4(1.0, 0.0, 1.0, 1.0);

    // init buffers
    circleVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexPositionBuffer);
    var vPosition = gl.getAttribLocation(program, 'vPosition');
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    circleVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexColorBuffer);
    var vColor = gl.getAttribLocation(program, 'vColor');
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

}
