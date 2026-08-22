import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

// =====================================================
// SCENE
// =====================================================

const scene = new THREE.Scene();

// =====================================================
// CAMERA
// =====================================================

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

camera.position.set(0, 0, 10);

// =====================================================
// RENDERER
// =====================================================

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#bg"),
    antialias: true,
    alpha: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.outputColorSpace = THREE.SRGBColorSpace;

// =====================================================
// LIGHTING
// =====================================================

scene.add(
    new THREE.AmbientLight(0xffffff, 0.5)
);

// =====================================================
// MOUSE
// =====================================================

const mouse = new THREE.Vector2(0, 0);
const targetMouse = new THREE.Vector2(0, 0);

document.addEventListener("mousemove", (event) => {

    targetMouse.x =
        (event.clientX / window.innerWidth) * 2 - 1;

    targetMouse.y =
        -(event.clientY / window.innerHeight) * 2 + 1;

});

// =====================================================
// PARTICLE SETTINGS
// =====================================================

const PARTICLE_COUNT = 200;

const positions = new Float32Array(
    PARTICLE_COUNT * 3
);

const velocities = new Float32Array(
    PARTICLE_COUNT * 3
);

const basePositions = new Float32Array(
    PARTICLE_COUNT * 3
);

for (let i = 0; i < PARTICLE_COUNT; i++) {

    const i3 = i * 3;

    const x =
        (Math.random() - 0.5) * 14;

    const y =
        (Math.random() - 0.5) * 8;

    const z =
        (Math.random() - 0.5) * 4;

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    basePositions[i3] = x;
    basePositions[i3 + 1] = y;
    basePositions[i3 + 2] = z;

    velocities[i3] = 0;
    velocities[i3 + 1] = 0;
    velocities[i3 + 2] = 0;
}

// =====================================================
// PARTICLE GEOMETRY
// =====================================================

const particleGeometry =
    new THREE.BufferGeometry();

particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
        positions,
        3
    )
);

// =====================================================
// PARTICLE MATERIAL
// =====================================================

const particleMaterial =
    new THREE.PointsMaterial({

        color: 0x6f8cff,

        size: 0.055,

        transparent: true,

        opacity: 0.8,

        blending:
            THREE.AdditiveBlending,

        depthWrite: false

    });

// =====================================================
// PARTICLE SYSTEM
// =====================================================

const particles =
    new THREE.Points(
        particleGeometry,
        particleMaterial
    );

scene.add(particles);

// =====================================================
// CONNECTION LINES
// =====================================================

const MAX_CONNECTIONS = 500;

const linePositions =
    new Float32Array(
        MAX_CONNECTIONS * 6
    );

const lineGeometry =
    new THREE.BufferGeometry();

lineGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
        linePositions,
        3
    )
);

const lineMaterial =
    new THREE.LineBasicMaterial({

        color: 0x5d7fff,

        transparent: true,

        opacity: 0.25,

        blending:
            THREE.AdditiveBlending,

        depthWrite: false

    });

const connections =
    new THREE.LineSegments(
        lineGeometry,
        lineMaterial
    );

scene.add(connections);

// =====================================================
// MOUSE TRAIL
// =====================================================

const TRAIL_LENGTH = 28;

const trailPositions =
    new Float32Array(
        TRAIL_LENGTH * 3
    );

const trailGeometry =
    new THREE.BufferGeometry();

trailGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(
        trailPositions,
        3
    )
);

const trailMaterial =
    new THREE.LineBasicMaterial({

        color: 0x8a6cff,

        transparent: true,

        opacity: 0.7,

        blending:
            THREE.AdditiveBlending,

        depthWrite: false

    });

const mouseTrail =
    new THREE.Line(
        trailGeometry,
        trailMaterial
    );

scene.add(mouseTrail);

// Initialize trail

for (let i = 0; i < TRAIL_LENGTH; i++) {

    trailPositions[i * 3] = 0;
    trailPositions[i * 3 + 1] = 0;
    trailPositions[i * 3 + 2] = 1;

}

// =====================================================
// CURSOR GLOW
// =====================================================

const cursorGlow =
    new THREE.Mesh(

        new THREE.SphereGeometry(
            0.13,
            24,
            24
        ),

        new THREE.MeshBasicMaterial({

            color: 0x6f8cff,

            transparent: true,

            opacity: 0.7,

            blending:
                THREE.AdditiveBlending,

            depthWrite: false

        })

    );

scene.add(cursorGlow);

// =====================================================
// CURSOR RINGS
// =====================================================

const cursorRing =
    new THREE.Mesh(

        new THREE.TorusGeometry(
            0.35,
            0.008,
            12,
            64
        ),

        new THREE.MeshBasicMaterial({

            color: 0x7b6cff,

            transparent: true,

            opacity: 0.5,

            blending:
                THREE.AdditiveBlending,

            depthWrite: false

        })

    );

scene.add(cursorRing);

// =====================================================
// MOUSE WORLD POSITION
// =====================================================

const mouseWorld =
    new THREE.Vector3();

const raycaster =
    new THREE.Raycaster();

const mousePlane =
    new THREE.Plane(
        new THREE.Vector3(0, 0, 1),
        -0.5
    );

// =====================================================
// ANIMATION
// =====================================================

const clock =
    new THREE.Clock();

function animate() {

    requestAnimationFrame(animate);

    const time =
        clock.getElapsedTime();

    // -----------------------------------------------
    // SMOOTH MOUSE
    // -----------------------------------------------

    mouse.x +=
        (targetMouse.x - mouse.x) * 0.08;

    mouse.y +=
        (targetMouse.y - mouse.y) * 0.08;

    // -----------------------------------------------
    // MOUSE WORLD POSITION
    // -----------------------------------------------

    raycaster.setFromCamera(
        mouse,
        camera
    );

    raycaster.ray.intersectPlane(
        mousePlane,
        mouseWorld
    );

    cursorGlow.position.lerp(
        mouseWorld,
        0.2
    );

    cursorRing.position.lerp(
        mouseWorld,
        0.15
    );

    cursorRing.rotation.z =
        time * 0.8;

    // -----------------------------------------------
    // STRONGER CURSOR DISTORTION
    // -----------------------------------------------

    for (let i = 0; i < PARTICLE_COUNT; i++) {

        const i3 = i * 3;

        let x =
            positions[i3];

        let y =
            positions[i3 + 1];

        let z =
            positions[i3 + 2];

        const dx =
            x - mouseWorld.x;

        const dy =
            y - mouseWorld.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        const influenceRadius = 2.2;

        if (distance < influenceRadius) {

            const strength =
                1 -
                distance /
                influenceRadius;

            const force =
                strength *
                strength *
                0.025;

            if (distance > 0.001) {

                velocities[i3] +=
                    (dx / distance) *
                    force;

                velocities[i3 + 1] +=
                    (dy / distance) *
                    force;

            }

        }

        // -------------------------------------------
        // NATURAL FLOATING
        // -------------------------------------------

        const baseX =
            basePositions[i3];

        const baseY =
            basePositions[i3 + 1];

        const baseZ =
            basePositions[i3 + 2];

        velocities[i3] +=
            (baseX - x) * 0.0008;

        velocities[i3 + 1] +=
            (baseY - y) * 0.0008;

        velocities[i3 + 2] +=
            (baseZ - z) * 0.0008;

        velocities[i3] *= 0.94;
        velocities[i3 + 1] *= 0.94;
        velocities[i3 + 2] *= 0.94;

        positions[i3] +=
            velocities[i3];

        positions[i3 + 1] +=
            velocities[i3 + 1];

        positions[i3 + 2] +=
            velocities[i3 + 2];

    }

    particleGeometry.attributes.position.needsUpdate =
        true;

    // -----------------------------------------------
    // CONNECTIONS
    // -----------------------------------------------

    let connectionIndex = 0;

    const maxDistance = 1.35;

    for (
        let i = 0;
        i < PARTICLE_COUNT;
        i++
    ) {

        if (
            connectionIndex >=
            MAX_CONNECTIONS
        ) break;

        const i3 = i * 3;

        const x1 =
            positions[i3];

        const y1 =
            positions[i3 + 1];

        const z1 =
            positions[i3 + 2];

        for (
            let j = i + 1;
            j < PARTICLE_COUNT;
            j++
        ) {

            if (
                connectionIndex >=
                MAX_CONNECTIONS
            ) break;

            const j3 = j * 3;

            const x2 =
                positions[j3];

            const y2 =
                positions[j3 + 1];

            const z2 =
                positions[j3 + 2];

            const dx =
                x1 - x2;

            const dy =
                y1 - y2;

            const dz =
                z1 - z2;

            const distance =
                Math.sqrt(
                    dx * dx +
                    dy * dy +
                    dz * dz
                );

            if (
                distance <
                maxDistance
            ) {

                const index =
                    connectionIndex * 6;

                linePositions[index] =
                    x1;

                linePositions[index + 1] =
                    y1;

                linePositions[index + 2] =
                    z1;

                linePositions[index + 3] =
                    x2;

                linePositions[index + 4] =
                    y2;

                linePositions[index + 5] =
                    z2;

                connectionIndex++;

            }

        }

    }

    lineGeometry.setDrawRange(
        0,
        connectionIndex * 2
    );

    lineGeometry.attributes.position.needsUpdate =
        true;

    // -----------------------------------------------
    // MOUSE TRAIL
    // -----------------------------------------------

    for (
        let i = TRAIL_LENGTH - 1;
        i > 0;
        i--
    ) {

        trailPositions[i * 3] =
            trailPositions[(i - 1) * 3];

        trailPositions[i * 3 + 1] =
            trailPositions[(i - 1) * 3 + 1];

        trailPositions[i * 3 + 2] =
            trailPositions[(i - 1) * 3 + 2];

    }

    trailPositions[0] =
        mouseWorld.x;

    trailPositions[1] =
        mouseWorld.y;

    trailPositions[2] =
        mouseWorld.z;

    trailGeometry.attributes.position.needsUpdate =
        true;

    // -----------------------------------------------
    // PARTICLE ROTATION
    // -----------------------------------------------

    particles.rotation.y =
        Math.sin(time * 0.08) * 0.08;

    // -----------------------------------------------
    // CURSOR GLOW PULSE
    // -----------------------------------------------

    const pulse =
        1 +
        Math.sin(time * 4) * 0.15;

    cursorGlow.scale.set(
        pulse,
        pulse,
        pulse
    );

    // -----------------------------------------------
    // CAMERA PARALLAX
    // -----------------------------------------------

    camera.position.x +=
        (mouse.x * 0.35 -
            camera.position.x) *
        0.025;

    camera.position.y +=
        (mouse.y * 0.22 -
            camera.position.y) *
        0.025;

    camera.lookAt(
        0,
        0,
        0
    );

    // -----------------------------------------------
    // RENDER
    // -----------------------------------------------

    renderer.render(
        scene,
        camera
    );
}

animate();

// =====================================================
// RESPONSIVE
// =====================================================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
                2
            )
        );

    }
);