import { useRef, useEffect } from 'react'
import * as THREE from 'three'

export default function ChessHeroScene() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const W = mount.clientWidth
    const H = mount.clientHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W, H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.4
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x000000, 25, 65)

    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 200)
    camera.position.set(0, -2, 22)
    camera.lookAt(0, 6, 0)

    scene.add(new THREE.AmbientLight(0x0a0a14, 3))

    const sun = new THREE.DirectionalLight(0xffc97a, 4)
    sun.position.set(-8, 30, 10)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.left = -20
    sun.shadow.camera.right = 20
    sun.shadow.camera.top = 40
    sun.shadow.camera.bottom = -10
    sun.shadow.camera.near = 1
    sun.shadow.camera.far = 80
    scene.add(sun)

    const fill = new THREE.DirectionalLight(0x3355aa, 1.2)
    fill.position.set(12, 5, 8)
    scene.add(fill)

    const baseGlow = new THREE.PointLight(0xc9a84c, 6, 18)
    baseGlow.position.set(0, 0, 3)
    scene.add(baseGlow)

    const rimLight = new THREE.PointLight(0xffd27a, 3, 25)
    rimLight.position.set(0, 18, -8)
    scene.add(rimLight)

    const ivoryMat = new THREE.MeshStandardMaterial({
      color: 0xe8dfc8,
      roughness: 0.08,
      metalness: 0.05,
    })

    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xc9a84c,
      roughness: 0.05,
      metalness: 1.0,
      emissive: 0xc9a84c,
      emissiveIntensity: 0.15,
    })

    const darkMat = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.3,
      metalness: 0.6,
    })

    function lathe(points, mat, segs = 48) {
      const v2 = points.map(([x, y]) => new THREE.Vector2(x, y))
      const geo = new THREE.LatheGeometry(v2, segs)
      const m = new THREE.Mesh(geo, mat)
      m.castShadow = true
      m.receiveShadow = true
      return m
    }

    function torus(r, tube, mat) {
      const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 16, 64), mat)
      m.rotation.x = Math.PI / 2
      m.castShadow = true
      return m
    }

    function sphere(r, mat) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 32), mat)
      m.castShadow = true
      return m
    }

    function cylinder(rt, rb, h, mat, segs = 32) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, segs), mat)
      m.castShadow = true
      return m
    }

    const queen = new THREE.Group()

    const plinth = lathe([
      [0, 0], [2.2, 0], [2.4, 0.1], [2.4, 0.3],
      [2.2, 0.5], [1.8, 0.6], [1.6, 0.8],
    ], ivoryMat)
    queen.add(plinth)

    const gr1 = torus(1.9, 0.07, goldMat)
    gr1.position.y = 0.45
    queen.add(gr1)

    const shaft = lathe([
      [1.6, 0.8], [1.5, 1.0], [1.3, 1.6],
      [1.1, 2.2], [0.95, 2.8],
    ], ivoryMat)
    queen.add(shaft)

    const belly = lathe([
      [0.95, 2.8], [1.15, 3.2], [1.3, 3.7],
      [1.35, 4.1], [1.3, 4.5], [1.1, 4.9], [0.9, 5.2],
    ], ivoryMat)
    queen.add(belly)

    const gr2 = torus(1.28, 0.065, goldMat)
    gr2.position.y = 4.1
    queen.add(gr2)

    const neck = lathe([
      [0.9, 5.2], [0.75, 5.5], [0.65, 5.9],
      [0.7, 6.3], [0.8, 6.6],
    ], ivoryMat)
    queen.add(neck)

    const collar = lathe([
      [0.8, 6.6], [1.1, 6.9], [1.25, 7.1],
      [1.2, 7.3], [1.1, 7.5], [1.0, 7.6],
    ], ivoryMat)
    queen.add(collar)

    const gr3 = torus(1.1, 0.065, goldMat)
    gr3.position.y = 7.1
    queen.add(gr3)

    const crownBand = cylinder(1.15, 1.0, 0.5, ivoryMat)
    crownBand.position.y = 7.85
    queen.add(crownBand)

    const gr4 = torus(1.12, 0.06, goldMat)
    gr4.position.y = 7.65
    queen.add(gr4)

    const gr5 = torus(1.12, 0.06, goldMat)
    gr5.position.y = 8.1
    queen.add(gr5)

    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2
      const r = 0.88
      const spike = cylinder(0.065, 0.12, 0.9, ivoryMat, 12)
      spike.position.set(Math.cos(angle) * r, 8.7, Math.sin(angle) * r)
      queen.add(spike)

      const orb = sphere(0.13, goldMat)
      orb.position.set(Math.cos(angle) * r, 9.2, Math.sin(angle) * r)
      queen.add(orb)
    }

    const topOrb = sphere(0.28, goldMat)
    topOrb.position.y = 9.3
    queen.add(topOrb)

    queen.scale.set(2.2, 2.2, 2.2)
    queen.position.set(0, -4, 0)
    scene.add(queen)

    const boardGroup = new THREE.Group()
    const sqSize = 1.0
    const bN = 8

    for (let i = 0; i < bN; i++) {
      for (let j = 0; j < bN; j++) {
        const isLight = (i + j) % 2 === 0
        const sq = new THREE.Mesh(
          new THREE.BoxGeometry(sqSize - 0.01, 0.06, sqSize - 0.01),
          new THREE.MeshStandardMaterial({
            color: isLight ? 0xc8a865 : 0x1a1005,
            roughness: 0.5,
          })
        )
        sq.position.set((i - bN / 2 + 0.5) * sqSize, 0, (j - bN / 2 + 0.5) * sqSize)
        sq.receiveShadow = true
        boardGroup.add(sq)
      }
    }

    const border = new THREE.Mesh(
      new THREE.BoxGeometry(bN * sqSize + 0.6, 0.14, bN * sqSize + 0.6),
      new THREE.MeshStandardMaterial({ color: 0x3d1f05, roughness: 0.6 })
    )
    border.position.y = -0.07
    border.receiveShadow = true
    boardGroup.add(border)

    boardGroup.position.set(0, -4.06, 2)
    scene.add(boardGroup)

    function buildPawn(mat) {
      const g = new THREE.Group()
      const b = lathe([
        [0, 0], [0.55, 0], [0.6, 0.08], [0.6, 0.2], [0.52, 0.3], [0.42, 0.38]
      ], mat)
      g.add(b)
      const s = lathe([
        [0.42, 0.38], [0.35, 0.55], [0.3, 0.8], [0.32, 1.05],
        [0.38, 1.25], [0.35, 1.45], [0.25, 1.6]
      ], mat)
      g.add(s)
      const head = sphere(0.28, mat)
      head.position.y = 1.88
      g.add(head)
      return g
    }

    const pawnPositions = [
      [-3, 1.5], [3, 1.5], [-2.5, -1], [2.5, -1],
      [-3.5, -0.2], [3.5, -0.2],
    ]
    pawnPositions.forEach(([x, z]) => {
      const pawn = buildPawn(darkMat)
      pawn.scale.set(0.7, 0.7, 0.7)
      pawn.position.set(x, -4.06, z)
      scene.add(pawn)
    })

    const pCount = 500
    const pGeo = new THREE.BufferGeometry()
    const pos = new Float32Array(pCount * 3)
    for (let i = 0; i < pCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30 + 5
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0xc9a84c, size: 0.06, transparent: true, opacity: 0.5,
    }))
    scene.add(particles)

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.95 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -4.1
    ground.receiveShadow = true
    scene.add(ground)

    let time = 0
    let animId

    function animate() {
      animId = requestAnimationFrame(animate)
      time += 0.006

      queen.position.y = -4 + Math.sin(time * 0.6) * 0.18
      queen.rotation.y = Math.sin(time * 0.25) * 0.12

      camera.position.x = Math.sin(time * 0.18) * 2.5
      camera.position.y = -2 + Math.sin(time * 0.12) * 0.8
      camera.position.z = 22 + Math.sin(time * 0.09) * 1.5
      camera.lookAt(Math.sin(time * 0.1) * 0.3, 6 + Math.sin(time * 0.15) * 0.5, 0)

      baseGlow.intensity = 5 + Math.sin(time * 1.5) * 1.5
      baseGlow.position.y = -1 + Math.sin(time * 0.6) * 0.18

      particles.rotation.y = time * 0.015
      const posArr = pGeo.attributes.position.array
      for (let i = 0; i < pCount; i++) {
        posArr[i * 3 + 1] += 0.008
        if (posArr[i * 3 + 1] > 20) posArr[i * 3 + 1] = -10
      }
      pGeo.attributes.position.needsUpdate = true

      renderer.render(scene, camera)
    }

    animate()

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
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  return (
    <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />
  )
}