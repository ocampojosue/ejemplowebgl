//Utilizando la libreria glmatrix
//Lo primero es inicializar una variable de rotación
var cubeRotation = 0.0;

main(); //Aqui se llama a la funcion principal main

//
// Comienza la función
//
function main() {
  const canvas = document.querySelector('#glcanvas');
  const gl = canvas.getContext('webgl');
  //Proporciona acceso al elemento de contexto WebGL y como argumento el canvas

  //  Si no tenemos un contexto GL, saltará el error

  if (!gl) {
    alert('No se puede inicializar WebGL. Es posible que su navegador o máquina no lo admita.');
    return;
  }

  // Programa de sombreado de vértices

  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;

    void main(void) {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;
    }
  `;

  // Programa de sombreado de fragmentos

  const fsSource = `
    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;

    void main(void) {
      gl_FragColor = texture2D(uSampler, vTextureCoord);
    }
  `;

  //Inicializar un programa de sombreado; 
  //aquí es donde se establece toda la iluminación para los vértices, etc.
  
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

// Recopile toda la información necesaria para usar el programa de sombreado.
  // Busque qué atributos utiliza nuestro programa de sombreado para aVertexPosition, 
  //aVertexNormal, aTextureCoord y busque ubicaciones uniformes.

  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
      uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
    }
  };

// Aquí es donde llamamos a la rutina que construye todos los objetos que dibujaremos.
 
  const buffers = initBuffers(gl);
  const texture = loadTexture(gl, 'uu.png');
  var then = 0;

 // Dibuja la escena repetidamente
  function render(now) {
    now *= 0.001;  // convertir a segundos
    const deltaTime = now - then;
    then = now;

    drawScene(gl, programInfo, buffers, texture, deltaTime);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

//
// initBuffers
//
// Inicialice los búferes que necesitaremos. Para esta demostración, 
//solo tenemos un objeto: un simple cubo tridimensional.
//
function initBuffers(gl) {

  // Crea un búfer para las posiciones de los vértices del cubo.

  const positionBuffer = gl.createBuffer();
 // Seleccione el positionBuffer como el que se aplicará a las operaciones de búfer desde aquí.

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Ahora cree una matriz de posiciones para el cubo.

  const positions = [
    // Cara frontal
    -1.0, -1.0,  1.0,
     1.0, -1.0,  1.0,
     1.0,  1.0,  1.0,
    -1.0,  1.0,  1.0,

    // Cara posterior
    -1.0, -1.0, -1.0,
    -1.0,  1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0, -1.0, -1.0,

    // Cara superior
    -1.0,  1.0, -1.0,
    -1.0,  1.0,  1.0,
     1.0,  1.0,  1.0,
     1.0,  1.0, -1.0,

    // Cara inferior
    -1.0, -1.0, -1.0,
     1.0, -1.0, -1.0,
     1.0, -1.0,  1.0,
    -1.0, -1.0,  1.0,

    // Cara derecha
     1.0, -1.0, -1.0,
     1.0,  1.0, -1.0,
     1.0,  1.0,  1.0,
     1.0, -1.0,  1.0,

    // Cara izquierda
    -1.0, -1.0, -1.0,
    -1.0, -1.0,  1.0,
    -1.0,  1.0,  1.0,
    -1.0,  1.0, -1.0,
  ];

   // Ahora pase la lista de posiciones a WebGL para construir la forma. 
  //Hacemos esto creando un Float32Array a partir de la matriz de JavaScript, 
  //luego lo usamos para llenar el búfer actual.
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

 // Configure las normales para los vértices, de modo que podamos calcular la iluminación.
 
  const textureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);

  const textureCoordinates = [
    // Delantera
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
   // Atrás
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Arriba
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Abajo
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Derecha
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
    // Izquierda
    0.0,  0.0,
    1.0,  0.0,
    1.0,  1.0,
    0.0,  1.0,
  ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordinates),
                gl.STATIC_DRAW);

  // Construya el búfer de matriz de elementos; esto especifica los índices 
  //en las matrices de vértices para los vértices de cada cara.

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  //Esta matriz define cada cara como dos triángulos, utilizando los índices 
  //en la matriz de vértices para especificar la posición de cada triángulo.

  const indices = [
    0,  1,  2,      0,  2,  3,    // front
    4,  5,  6,      4,  6,  7,    // back
    8,  9,  10,     8,  10, 11,   // top
    12, 13, 14,     12, 14, 15,   // bottom
    16, 17, 18,     16, 18, 19,   // right
    20, 21, 22,     20, 22, 23,   // left
  ];

  // Ahora envíe la matriz de elementos a GL

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indices), gl.STATIC_DRAW);

  return {
    position: positionBuffer,
    textureCoord: textureCoordBuffer,
    indices: indexBuffer,
  };
}

//
// Inicializa una textura y carga una imagen.
// Cuando la imagen termine de cargarse, cópiela en la textura.
//
function loadTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Hasta entonces pon un solo píxel en la textura para que podamos usarlo de inmediato. 
  //Cuando la imagen haya terminado de descargar, actualizaremos la textura con el 
  //contenido de la imagen.

  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // azul opaca
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);
               
  const image = new Image();
  image.onload = function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                  srcFormat, srcType, image);

    // WebGL1 tiene diferentes requisitos para la potencia de 2 imágenes frente a la 
    //no potencia de 2 imágenes, así que verifique si la imagen tiene una potencia de 
    //2 en ambas dimensiones.
    if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
       // Sí, es una potencia de 2. Genera mips.
       gl.generateMipmap(gl.TEXTURE_2D);
    } else {
       // No, no es una potencia de 2. Gire los mips y coloque 
       //la envoltura para sujetar el borde
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    }
  };
  image.src = url;

  return texture;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}

//
// Dibuja la escena
//
function drawScene(gl, programInfo, buffers, texture, deltaTime) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Claro a negro, completamente opaco
  gl.clearDepth(1.0);                 //  Limpiar todo
  gl.enable(gl.DEPTH_TEST);           // Habilitar pruebas de profundidad
  gl.depthFunc(gl.LEQUAL);            // Las cosas cercanas oscurecen las cosas lejanas

  // Limpia el lienzo antes de empezar a dibujar en él.

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Cree una matriz de perspectiva, una matriz especial que se utiliza
  //para simular la distorsión de la perspectiva en una cámara.
  // Nuestro campo de visión es de 45 grados, con una relación ancho
  //alto que coincide con el tamaño de visualización del lienzo y solo 
  //queremos ver objetos entre 0,1 unidades y 100 unidades de la cámara.

  const fieldOfView = 45 * Math.PI / 180;   // en radianes
  const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  const zNear = 0.1;
  const zFar = 100.0;
  const projectionMatrix = mat4.create();

  // nota: glmatrix.js siempre tiene el primer argumento
  //como destino para recibir el resultado.
  mat4.perspective(projectionMatrix,
                   fieldOfView,
                   aspect,
                   zNear,
                   zFar);

  //Establezca la posición del dibujo en el punto de "identidad",
  //que es el centro de la escena.
  const modelViewMatrix = mat4.create();

  // Ahora mueva un poco la posición de dibujo a donde queremos
  //empezar a dibujar el cuadrado.
//Ahora necesitamos actualizar la función para aplicar la rotación actual al cuadrado al dibujarla
  mat4.translate(modelViewMatrix,     // matriz de destino
    modelViewMatrix,     // matriz para traducir
    [-0.0, 0.0, -4.0]);  // cantidad para traducir
mat4.rotate(modelViewMatrix,  // matriz de destino
 modelViewMatrix,  // matriz para rotar
 cubeRotation,     // cantidad para rotar en radianes
 [1, 0, 0]);       // eje para girar alrededor (Z)
mat4.rotate(modelViewMatrix,  // matriz de destino
 modelViewMatrix,  // matriz para rotar
 cubeRotation * .7,// antidad para rotar en radianes
 [0, 1, 0]);       // eje para girar alrededor (X)

  //  Dígale a WebGL cómo extraer las posiciones del búfer 
  //de posición en el atributo vertexPosition
  {
    const numComponents = 3;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition);
  }

  // Indique a WebGL cómo extraer las coordenadas de textura 
  //del búfer de coordenadas de textura al atributo textureCoord.
  {
    const numComponents = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(
        programInfo.attribLocations.textureCoord,
        numComponents,
        type,
        normalize,
        stride,
        offset);
    gl.enableVertexAttribArray(
        programInfo.attribLocations.textureCoord);
  }

  // Dile a WebGL qué índices usar para indexar los vértices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

  // Dile a WebGL que use nuestro programa al dibujar

  gl.useProgram(programInfo.program);

  // Establecer los uniformes del sombreador

  gl.uniformMatrix4fv(
      programInfo.uniformLocations.projectionMatrix,
      false,
      projectionMatrix);
  gl.uniformMatrix4fv(
      programInfo.uniformLocations.modelViewMatrix,
      false,
      modelViewMatrix);

  // Especifique la textura para mapear en las caras.

  // Dile a WebGL que queremos afectar la unidad de textura 0
  gl.activeTexture(gl.TEXTURE0);

  // Unir la textura a la unidad de textura 0
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Dile al sombreador que enlazamos la textura a la unidad de textura 0
  gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

  {
    const vertexCount = 36;
    const type = gl.UNSIGNED_SHORT;
    const offset = 0;
    gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
  }

  // Actualizar la rotación para el próximo sorteo

  cubeRotation += deltaTime;
}

//
// Inicialice un programa de sombreado, para que WebGL sepa cómo dibujar nuestros datos
//
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  // Create the shader program

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  // Crea el programa de sombreado

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

//crea un sombreador del tipo dado, carga la fuente y la compila.

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  // Envía la fuente al objeto sombreador

  gl.shaderSource(shader, source);

  // Compilar el programa de sombreado

  gl.compileShader(shader);

  // Ver si se compiló correctamente

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}