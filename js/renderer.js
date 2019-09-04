// The JQuery library facilitates DOM operations and normalizes parameters for input events across the browsers

const canvas = document.querySelector('#main_canvas');
// Scale the inner drawling surface to the same
// aspect ratio as the canvas element
canvas.width = canvas.height * 
            (canvas.clientWidth / canvas.clientHeight);

const renderer = new THREE.WebGLRenderer({canvas});
//renderer.setSize(viewportWidth, viewportHeight);
//$('#' + containerId).append(renderer.domElement);

var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100.0);
camera.position.z = 1.0;
scene.add( camera );

const fragmentShader = `
    uniform vec3 iResolution;
    uniform float iTime;
    void mainImage( out vec4 fragColor, in vec2 fragCoord )                            
    {
        // Normalized pixel coordinates (from 0 to 1)
        vec2 uv = fragCoord/iResolution.xy;
    
        // Time varying pixel color
        //vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));
    
        vec2 p = (2.0*fragCoord-iResolution.xy)/min(iResolution.y,iResolution.x);
        
        // background color
        vec3 bcol = vec3(1.0,0.8,0.7-0.07*p.y)*(1.0-0.25*length(p));
    
        // animate
        float tt = mod(iTime,1.5)/1.5;
        float ss = pow(tt,.2)*0.5 + 0.5;
        ss = 1.0 + ss*0.5*sin(tt*6.2831*3.0 + p.y*0.5)*exp(-tt*4.0);
        p *= vec2(0.5,1.5) + ss*vec2(0.5,-0.5);
    
        // shape
    #if 0
        p *= 0.8;
        p.y = -0.1 - p.y*1.2 + abs(p.x)*(1.0-abs(p.x));
        float r = length(p);
        float d = 0.5;
    #else
        p.y -= 0.25;
        float a = atan(p.x,p.y)/3.141593;
        float r = length(p);
        float h = abs(a);
        float d = (13.0*h - 22.0*h*h + 10.0*h*h*h)/(6.0-5.0*h);
    #endif
        
        // color
        float s = 0.75 + 0.75*p.x;
        s *= 1.0-0.4*r;
        s = 0.3 + 0.7*s;
        s *= 0.5+0.5*pow( 1.0-clamp(r/d, 0.0, 1.0 ), 0.1 );
        vec3 hcol = vec3(1.0,0.5*r,0.3)*s;
        
        vec3 col = mix( bcol, hcol, smoothstep( -0.01, 0.01, d-r) );
    
        fragColor = vec4(col,1.0);
    }

    void main() {
        mainImage(gl_FragColor, gl_FragCoord.xy);
    }
`;

const uniforms = {
    iTime: { value: 0 },
    iResolution:  { value: new THREE.Vector3() },
    };
    const material = new THREE.ShaderMaterial({
    fragmentShader,
    uniforms,
    });


  const plane = new THREE.PlaneBufferGeometry(2, 2);

var mesh = new THREE.Mesh(plane, material);
scene.add(mesh);

totalRunningTime = 0

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

function render(time) {
    time *= 0.001;  // convert to seconds
    totalRunningTime += time;

    resizeRendererToDisplaySize(renderer);

    const canvas = renderer.domElement;
    uniforms.iResolution.value.set(canvas.width, canvas.height, 1);
    uniforms.iTime.value = time;

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);