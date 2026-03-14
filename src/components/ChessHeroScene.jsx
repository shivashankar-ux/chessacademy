import { useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'

export default function ChessHeroScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const width = mount.clientWidth
    const height = mount.clientHeight

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    mount.appendChild(renderer.domElement)

    // Scene
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x000000, 0.025)

    // Camera - LOW angle looking UP at giant chess pieces
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 200)
    camera.position.set(0, 2, 18)
    camera.lookAt(0, 8, 0)

    // ─── LIGHTS ─────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0x111111, 1)
    scene.add(ambientLight)

    // Golden key light from above
    const keyLight = new THREE.DirectionalLight(0xffd27a, 3)
    keyLight.position.set(5, 30, 5)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.width = 2048
    keyLight.shadow.mapSize.height = 2048
    keyLight.shadow.camera.near = 0.5
    keyLight.shadow.camera.far = 100
    keyLight.shadow.camera.left = -30
    keyLight.shadow.camera.right = 30
    keyLight.shadow.camera.top = 30
    keyLight.shadow.camera.bottom = -30
    scene.add(keyLight)

    // Cool fill from opposite
    const fillLight = new THREE.DirectionalLight(0x4488ff, 0.5)
    fillLight.position.set(-8, 10, -5)
    scene.add(fillLight)

    // Rim light from behind
    const rimLight = new THREE.PointLight(0xc9a84c, 2, 50)
    rimLight.position.set(0, 20, -10)
    scene.add(rimLight)

    // Ground glow
    const groundGlow = new THREE.PointLight(0xc9a84c, 1, 30)
    groundGlow.position.set(0, 0.5, 5)
    scene.add(groundGlow)

    // ─── MATERIALS ──────────────────────────────────────────────
    const whitePieceMat = new THREE.MeshStandardMaterial({
      color: 0xf5f0e8,
      roughness: 0.1,
      metalness: 0.05,
      envMapIntensity: 1,
    })

    const blackPieceMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.15,
      metalness: 0.3,
    })

    const goldRingMat = new THREE.MeshStandardMaterial({
      color: 0xc9a84c,
      roughness: 0.1,
      metalness: 0.9,
      emissive: 0xc9a84c,
      emissiveIntensity: 0.2,
    })

    const boardMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      roughness: 0.6,
      metalness: 0.2,
    })

    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a2e,
      roughness: 0.8,
      metalness: 0.1,
      emissive: 0x0a0a1a,
      emissiveIntensity: 0.5,
    })

    const windowMat = new THREE.MeshStandardMaterial({
      color: 0xffd27a,
      emissive: 0xffa500,
      emissiveIntensity: 2,
      roughness: 0.1,
      metalness: 0.5,
    })

    const windowMat2 = new THREE.MeshStandardMaterial({
      color: 0x88aaff,
      emissive: 0x4466ff,
      emissiveIntensity: 1.5,
      roughness: 0.1,
    })

    // ─── HELPER: Build chess piece ───────────────────────────────
    function buildQueenPiece(mat, goldMat) {
      const group = new THREE.Group()

      // Base disc
      const base = new THREE.CylinderGeometry(1.6, 1.8, 0.35, 32)
      const baseMesh = new THREE.Mesh(base, mat)
      baseMesh.castShadow = true
      group.add(baseMesh)

      // Gold ring on base
      const ring1 = new THREE.TorusGeometry(1.55, 0.08, 12, 40)
      const ring1Mesh = new THREE.Mesh(ring1, goldMat)
      ring1Mesh.position.y = 0.2
      ring1Mesh.rotation.x = Math.PI / 2
      group.add(ring1Mesh)

      // Lower body
      const lower = new THREE.CylinderGeometry(1.3, 1.55, 1.5, 32)
      const lowerMesh = new THREE.Mesh(lower, mat)
      lowerMesh.position.y = 1.1
      lowerMesh.castShadow = true
      group.add(lowerMesh)

      // Waist
      const waist = new THREE.SphereGeometry(0.95, 24, 24)
      const waistMesh = new THREE.Mesh(waist, mat)
      waistMesh.position.y = 2.4
      waistMesh.castShadow = true
      group.add(waistMesh)

      // Gold waist ring
      const ring2 = new THREE.TorusGeometry(0.95, 0.07, 12, 40)
      const ring2Mesh = new THREE.Mesh(ring2, goldMat)
      ring2Mesh.position.y = 2.4
      ring2Mesh.rotation.x = Math.PI / 2
      group.add(ring2Mesh)

      // Upper body
      const upper = new THREE.CylinderGeometry(1.1, 0.9, 2.2, 32)
      const upperMesh = new THREE.Mesh(upper, mat)
      upperMesh.position.y = 3.85
      upperMesh.castShadow = true
      group.add(upperMesh)

      // Crown base
      const crownBase = new THREE.CylinderGeometry(1.3, 1.1, 0.4, 32)
      const crownBaseMesh = new THREE.Mesh(crownBase, mat)
      crownBaseMesh.position.y = 5.15
      group.add(crownBaseMesh)

      // Crown points - 5 points
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2
        const point = new THREE.CylinderGeometry(0.1, 0.2, 0.8, 8)
        const pointMesh = new THREE.Mesh(point, mat)
        pointMesh.position.set(
          Math.cos(angle) * 1.0,
          5.8,
          Math.sin(angle) * 1.0
        )
        group.add(pointMesh)

        // Crown orbs
        const orb = new THREE.SphereGeometry(0.15, 10, 10)
        const orbMesh = new THREE.Mesh(orb, goldMat)
        orbMesh.position.set(
          Math.cos(angle) * 1.0,
          6.35,
          Math.sin(angle) * 1.0
        )
        group.add(orbMesh)
      }

      // Top orb
      const topOrb = new THREE.SphereGeometry(0.35, 16, 16)
      const topOrbMesh = new THREE.Mesh(topOrb, goldMat)
      topOrbMesh.position.y = 6.5
      group.add(topOrbMesh)

      return group
    }

    function buildKingPiece(mat, goldMat) {
      const group = new THREE.Group()

      const base = new THREE.CylinderGeometry(1.4, 1.6, 0.35, 32)
      const baseMesh = new THREE.Mesh(base, mat)
      baseMesh.castShadow = true
      group.add(baseMesh)

      const ring1 = new THREE.TorusGeometry(1.35, 0.08, 12, 40)
      const ring1Mesh = new THREE.Mesh(ring1, goldMat)
      ring1Mesh.position.y = 0.2
      ring1Mesh.rotation.x = Math.PI / 2
      group.add(ring1Mesh)

      const lower = new THREE.CylinderGeometry(1.1, 1.35, 1.4, 32)
      const lowerMesh = new THREE.Mesh(lower, mat)
      lowerMesh.position.y = 1.05
      lowerMesh.castShadow = true
      group.add(lowerMesh)

      const waist = new THREE.SphereGeometry(0.8, 24, 24)
      const waistMesh = new THREE.Mesh(waist, mat)
      waistMesh.position.y = 2.1
      group.add(waistMesh)

      const upper = new THREE.CylinderGeometry(1.0, 0.8, 2.5, 32)
      const upperMesh = new THREE.Mesh(upper, mat)
      upperMesh.position.y = 3.45
      upperMesh.castShadow = true
      group.add(upperMesh)

      const crownBase = new THREE.CylinderGeometry(1.2, 1.0, 0.35, 32)
      const crownBaseMesh = new THREE.Mesh(crownBase, mat)
      crownBaseMesh.position.y = 4.88
      group.add(crownBaseMesh)

      // Cross
      const crossV = new THREE.BoxGeometry(0.22, 1.2, 0.22)
      const crossVMesh = new THREE.Mesh(crossV, goldMat)
      crossVMesh.position.y = 5.7
      group.add(crossVMesh)

      const crossH = new THREE.BoxGeometry(0.8, 0.22, 0.22)
      const crossHMesh = new THREE.Mesh(crossH, goldMat)
      crossHMesh.position.y = 5.9
      group.add(crossHMesh)

      return group
    }

    function buildBishopPiece(mat, goldMat) {
      const group = new THREE.Group()

      const base = new THREE.CylinderGeometry(1.1, 1.25, 0.3, 32)
      const baseMesh = new THREE.Mesh(base, mat)
      group.add(baseMesh)

      const lower = new THREE.CylinderGeometry(0.85, 1.1, 1.2, 32)
      const lowerMesh = new THREE.Mesh(lower, mat)
      lowerMesh.position.y = 0.9
      group.add(lowerMesh)

      const waist = new THREE.SphereGeometry(0.7, 24, 24)
      const waistMesh = new THREE.Mesh(waist, mat)
      waistMesh.position.y = 1.9
      group.add(waistMesh)

      const upper = new THREE.CylinderGeometry(0.55, 0.65, 2.0, 32)
      const upperMesh = new THREE.Mesh(upper, mat)
      upperMesh.position.y = 3.1
      group.add(upperMesh)

      const head = new THREE.SphereGeometry(0.55, 20, 20)
      const headMesh = new THREE.Mesh(head, mat)
      headMesh.position.y = 4.4
      group.add(headMesh)

      const tip = new THREE.SphereGeometry(0.18, 10, 10)
      const tipMesh = new THREE.Mesh(tip, goldMat)
      tipMesh.position.y = 5.05
      group.add(tipMesh)

      return group
    }

    function buildRookPiece(mat, goldMat) {
      const group = new THREE.Group()

      const base = new THREE.CylinderGeometry(1.2, 1.35, 0.3, 32)
      const baseMesh = new THREE.Mesh(base, mat)
      group.add(baseMesh)

      const shaft = new THREE.CylinderGeometry(1.0, 1.15, 3.5, 32)
      const shaftMesh = new THREE.Mesh(shaft, mat)
      shaftMesh.position.y = 2.05
      group.add(shaftMesh)

      const ring = new THREE.TorusGeometry(1.0, 0.07, 10, 40)
      const ringMesh = new THREE.Mesh(ring, goldMat)
      ringMesh.position.y = 3.5
      ringMesh.rotation.x = Math.PI / 2
      group.add(ringMesh)

      const top = new THREE.CylinderGeometry(1.2, 1.0, 0.4, 32)
      const topMesh = new THREE.Mesh(top, mat)
      topMesh.position.y = 4.0
      group.add(topMesh)

      // Battlements
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2
        const bat = new THREE.BoxGeometry(0.4, 0.5, 0.4)
        const batMesh = new THREE.Mesh(bat, mat)
        batMesh.position.set(
          Math.cos(angle) * 0.75,
          4.45,
          Math.sin(angle) * 0.75
        )
        group.add(batMesh)
      }

      return group
    }

    // ─── PLACE GIANT CHESS PIECES ───────────────────────────────
    const pieces = []

    // White Queen - center-left, VERY tall scale
    const whiteQueen = buildQueenPiece(whitePieceMat, goldRingMat)
    whiteQueen.scale.set(2.8, 2.8, 2.8)
    whiteQueen.position.set(-4, 0, -2)
    whiteQueen.castShadow = true
    scene.add(whiteQueen)
    pieces.push({ mesh: whiteQueen, floatOffset: 0, speed: 0.3 })

    // Black King - center-right
    const blackKing = buildKingPiece(blackPieceMat, goldRingMat)
    blackKing.scale.set(2.6, 2.6, 2.6)
    blackKing.position.set(4.5, 0, -3)
    scene.add(blackKing)
    pieces.push({ mesh: blackKing, floatOffset: Math.PI * 0.7, speed: 0.25 })

    // White Bishop - far left
    const whiteBishop = buildBishopPiece(whitePieceMat, goldRingMat)
    whiteBishop.scale.set(2.0, 2.0, 2.0)
    whiteBishop.position.set(-9, 0, -1)
    scene.add(whiteBishop)
    pieces.push({ mesh: whiteBishop, floatOffset: Math.PI * 1.2, speed: 0.35 })

    // Black Rook - far right
    const blackRook = buildRookPiece(blackPieceMat, goldRingMat)
    blackRook.scale.set(1.8, 1.8, 1.8)
    blackRook.position.set(9, 0, -1)
    scene.add(blackRook)
    pieces.push({ mesh: blackRook, floatOffset: Math.PI * 0.4, speed: 0.28 })

    // ─── CHESS BOARD GROUND ──────────────────────────────────────
    const boardGroup = new THREE.Group()
    const squareSize = 1.5
    const boardW = 12

    for (let i = 0; i < boardW; i++) {
      for (let j = 0; j < boardW; j++) {
        const isLight = (i + j) % 2 === 0
        const sq = new THREE.BoxGeometry(squareSize - 0.02, 0.08, squareSize - 0.02)
        const sqMesh = new THREE.Mesh(sq, isLight
          ? new THREE.MeshStandardMaterial({ color: 0xc8a865, roughness: 0.4 })
          : new THREE.MeshStandardMaterial({ color: 0x1a1206, roughness: 0.6 })
        )
        sqMesh.position.set(
          (i - boardW / 2 + 0.5) * squareSize,
          -0.04,
          (j - boardW / 2 + 0.5) * squareSize
        )
        sqMesh.receiveShadow = true
        boardGroup.add(sqMesh)
      }
    }

    // Board border
    const border = new THREE.BoxGeometry(boardW * squareSize + 0.8, 0.2, boardW * squareSize + 0.8)
    const borderMesh = new THREE.Mesh(border, new THREE.MeshStandardMaterial({
      color: 0x5a3a10,
      roughness: 0.5,
      metalness: 0.1,
    }))
    borderMesh.position.y = -0.1
    borderMesh.receiveShadow = true
    boardGroup.add(borderMesh)

    boardGroup.position.set(0, 0, 2)
    scene.add(boardGroup)

    // ─── MINIATURE CITY ─────────────────────────────────────────
    function addBuilding(x, z, w, d, h, hasEmissive) {
      const buildingGroup = new THREE.Group()

      const geo = new THREE.BoxGeometry(w, h, d)
      const mesh = new THREE.Mesh(geo, buildingMat.clone())
      mesh.position.y = h / 2
      mesh.castShadow = true
      mesh.receiveShadow = true
      buildingGroup.add(mesh)

      // Windows
      const winsPerFloor = Math.floor(w / 0.25)
      const floors = Math.floor(h / 0.4)
      for (let f = 0; f < floors; f++) {
        for (let ww = 0; ww < winsPerFloor; ww++) {
          if (Math.random() > 0.35) {
            const winGeo = new THREE.BoxGeometry(0.1, 0.12, 0.05)
            const winMesh = new THREE.Mesh(winGeo, Math.random() > 0.5 ? windowMat : windowMat2)
            winMesh.position.set(
              -w / 2 + (ww + 0.5) * (w / winsPerFloor),
              0.25 + f * 0.4,
              d / 2 + 0.03
            )
            buildingGroup.add(winMesh)
          }
        }
      }

      // Roof antenna on some
      if (Math.random() > 0.5) {
        const ant = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 6)
        const antMesh = new THREE.Mesh(ant, new THREE.MeshStandardMaterial({
          color: 0x888888, roughness: 0.4
        }))
        antMesh.position.y = h + 0.2
        buildingGroup.add(antMesh)

        if (Math.random() > 0.4) {
          const blinker = new THREE.SphereGeometry(0.04, 8, 8)
          const blinkerMesh = new THREE.Mesh(blinker, new THREE.MeshStandardMaterial({
            color: 0xff2222, emissive: 0xff0000, emissiveIntensity: 3
          }))
          blinkerMesh.position.y = h + 0.42
          buildingGroup.add(blinkerMesh)
        }
      }

      buildingGroup.position.set(x, 0, z)
      scene.add(buildingGroup)
      return buildingGroup
    }

    // City around and behind the chess board
    const cityData = [
      // Back row - tall skyscrapers
      [-14, -12, 1.8, 1.8, 5.5], [-11, -12, 1.4, 1.4, 7.2], [-8, -13, 2.0, 1.6, 6.1],
      [-5, -12, 1.2, 1.2, 8.4], [-2, -14, 1.5, 1.5, 9.2], [1, -13, 1.8, 1.8, 7.8],
      [4, -12, 1.3, 1.3, 8.9], [7, -12, 2.0, 1.6, 6.5], [10, -13, 1.4, 1.4, 7.1],
      [13, -12, 1.8, 1.8, 5.8],
      // Mid-far
      [-16, -8, 1.6, 1.4, 4.2], [-13, -9, 1.2, 1.2, 3.8], [11, -9, 1.4, 1.4, 4.5],
      [14, -8, 1.8, 1.6, 3.9],
      // Sides
      [-15, -4, 1.4, 1.2, 3.2], [-15, -1, 1.2, 1.0, 2.5], [-15, 2, 1.4, 1.2, 4.0],
      [14, -4, 1.4, 1.2, 3.5], [14, -1, 1.2, 1.0, 2.8], [14, 2, 1.4, 1.2, 3.2],
      // Front small
      [-12, 6, 0.8, 0.8, 1.4], [-9, 7, 0.6, 0.6, 1.1], [8, 7, 0.8, 0.8, 1.6],
      [11, 6, 0.6, 0.6, 1.0],
    ]

    cityData.forEach(([x, z, w, d, h]) => addBuilding(x, z, w, d, h, true))

    // Ground plane (city streets)
    const groundGeo = new THREE.PlaneGeometry(80, 80, 1, 1)
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x080808,
      roughness: 0.9,
    })
    const ground = new THREE.Mesh(groundGeo, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.01
    ground.receiveShadow = true
    scene.add(ground)

    // Road lines
    for (let i = -6; i <= 6; i += 3) {
      const roadGeo = new THREE.PlaneGeometry(0.08, 40)
      const roadMesh = new THREE.Mesh(roadGeo, new THREE.MeshStandardMaterial({
        color: 0xc9a84c, emissive: 0x8a6a20, emissiveIntensity: 0.4
      }))
      roadMesh.rotation.x = -Math.PI / 2
      roadMesh.position.set(i, 0.005, -5)
      scene.add(roadMesh)

      const roadGeo2 = new THREE.PlaneGeometry(40, 0.08)
      const roadMesh2 = new THREE.Mesh(roadGeo2, new THREE.MeshStandardMaterial({
        color: 0xc9a84c, emissive: 0x8a6a20, emissiveIntensity: 0.4
      }))
      roadMesh2.rotation.x = -Math.PI / 2
      roadMesh2.position.set(-5, 0.005, i - 5)
      scene.add(roadMesh2)
    }

    // Particle field - floating golden dust
    const particleCount = 300
    const particleGeo = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40
      positions[i * 3 + 1] = Math.random() * 30
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const particleMat = new THREE.PointsMaterial({
      color: 0xc9a84c,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
    })
    const particles = new THREE.Points(particleGeo, particleMat)
    scene.add(particles)

    // ─── ANIMATION ──────────────────────────────────────────────
    let time = 0
    let animId

    function animate() {
      animId = requestAnimationFrame(animate)
      time += 0.008

      // Float pieces gently
      pieces.forEach(({ mesh, floatOffset, speed }) => {
        mesh.position.y = Math.sin(time * speed + floatOffset) * 0.3
        mesh.rotation.y = Math.sin(time * speed * 0.4 + floatOffset) * 0.08
      })

      // Slowly drift camera for cinematic effect
      camera.position.x = Math.sin(time * 0.1) * 1.5
      camera.position.y = 2 + Math.sin(time * 0.07) * 0.5
      camera.lookAt(Math.sin(time * 0.05) * 0.5, 8, 0)

      // Rotate particles slowly
      particles.rotation.y = time * 0.02

      // Pulse ground glow
      groundGlow.intensity = 0.8 + Math.sin(time * 2) * 0.3

      renderer.render(scene, camera)
    }

    animate()

    // ─── RESIZE ─────────────────────────────────────────────────
    function onResize() {
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      mount.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
    />
  )
}
