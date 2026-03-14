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
    renderer.toneMappingExposure = 1.3
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.fog = new THREE.Fog(0x000000, 30, 70)

    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 200)
    camera.position.set(-7, 14, 20)
    camera.lookAt(-7, 0, 0)

    scene.add(new THREE.AmbientLight(0x111122, 4))

    const sun = new THREE.DirectionalLight(0xffd27a, 3.5)
    sun.position.set(-10, 25, 15)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.left = -20
    sun.shadow.camera.right = 20
    sun.shadow.camera.top = 20
    sun.shadow.camera.bottom = -20
    sun.shadow.camera.near = 1
    sun.shadow.camera.far = 60
    scene.add(sun)

    const fill = new THREE.DirectionalLight(0x4466cc, 0.8)
    fill.position.set(15, 8, -5)
    scene.add(fill)

    const boardGlow = new THREE.PointLight(0xc9a84c, 1.5, 25)
    boardGlow.position.set(-7, 3, 0)
    scene.add(boardGlow)

    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf0e6d0, roughness: 0.1, metalness: 0.05 })
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2e, roughness: 0.15, metalness: 0.3 })
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xc9a84c, roughness: 0.05, metalness: 1, emissive: 0xc9a84c, emissiveIntensity: 0.1 })
    const lightSqMat = new THREE.MeshStandardMaterial({ color: 0xd4a85a, roughness: 0.4 })
    const darkSqMat = new THREE.MeshStandardMaterial({ color: 0x2c1a0a, roughness: 0.5 })
    const borderMat = new THREE.MeshStandardMaterial({ color: 0x5c2e00, roughness: 0.4, metalness: 0.3 })
    const goldBorderMat = new THREE.MeshStandardMaterial({ color: 0x8a6010, roughness: 0.2, metalness: 0.6 })

    function lathe(pts, mat, segs = 36) {
      const geo = new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), segs)
      const m = new THREE.Mesh(geo, mat)
      m.castShadow = true; m.receiveShadow = true
      return m
    }
    function tor(r, t, mat) {
      const m = new THREE.Mesh(new THREE.TorusGeometry(r, t, 10, 40), mat)
      m.rotation.x = Math.PI / 2; m.castShadow = true; return m
    }
    function sph(r, mat) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 20), mat)
      m.castShadow = true; return m
    }
    function cyl(rt, rb, h, mat, s = 20) {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, s), mat)
      m.castShadow = true; return m
    }

    function buildQueen(mat, gMat) {
      const g = new THREE.Group()
      g.add(lathe([[0,0],[0.9,0],[1.0,0.05],[1.0,0.18],[0.9,0.28],[0.75,0.36]], mat))
      const r1 = tor(0.78, 0.035, gMat); r1.position.y = 0.25; g.add(r1)
      g.add(lathe([[0.75,0.36],[0.62,0.52],[0.5,0.85],[0.44,1.1]], mat))
      g.add(lathe([[0.44,1.1],[0.54,1.38],[0.6,1.65],[0.62,1.85],[0.58,2.05],[0.48,2.2],[0.38,2.32]], mat))
      const r2 = tor(0.55, 0.03, gMat); r2.position.y = 1.85; g.add(r2)
      g.add(lathe([[0.38,2.32],[0.32,2.46],[0.3,2.62],[0.33,2.76],[0.4,2.86]], mat))
      const r3 = tor(0.42, 0.025, gMat); r3.position.y = 2.88; g.add(r3)
      const cb = cyl(0.46, 0.4, 0.18, mat); cb.position.y = 3.02; g.add(cb)
      const r4 = tor(0.44, 0.025, gMat); r4.position.y = 2.95; g.add(r4)
      const r5 = tor(0.44, 0.025, gMat); r5.position.y = 3.12; g.add(r5)
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2
        const sp = cyl(0.025, 0.04, 0.32, mat, 6); sp.position.set(Math.cos(a)*0.32, 3.28, Math.sin(a)*0.32); g.add(sp)
        const o = sph(0.055, gMat); o.position.set(Math.cos(a)*0.32, 3.46, Math.sin(a)*0.32); g.add(o)
      }
      const to = sph(0.1, gMat); to.position.y = 3.46; g.add(to)
      return g
    }

    function buildKing(mat, gMat) {
      const g = new THREE.Group()
      g.add(lathe([[0,0],[0.9,0],[1.0,0.05],[1.0,0.18],[0.9,0.28],[0.75,0.36]], mat))
      g.add(lathe([[0.75,0.36],[0.62,0.54],[0.48,0.92],[0.42,1.18]], mat))
      g.add(lathe([[0.42,1.18],[0.52,1.44],[0.56,1.7],[0.54,1.95],[0.44,2.12],[0.36,2.22]], mat))
      g.add(lathe([[0.36,2.22],[0.3,2.36],[0.28,2.54],[0.31,2.68],[0.38,2.76]], mat))
      const r = tor(0.4, 0.025, gMat); r.position.y = 2.78; g.add(r)
      const cb = cyl(0.44, 0.38, 0.16, mat); cb.position.y = 2.92; g.add(cb)
      const cv = cyl(0.04, 0.04, 0.44, gMat); cv.position.y = 3.22; g.add(cv)
      const ch = cyl(0.04, 0.04, 0.28, gMat); ch.rotation.z = Math.PI/2; ch.position.y = 3.34; g.add(ch)
      return g
    }

    function buildBishop(mat, gMat) {
      const g = new THREE.Group()
      g.add(lathe([[0,0],[0.78,0],[0.88,0.07],[0.88,0.18],[0.78,0.27],[0.65,0.34]], mat))
      g.add(lathe([[0.65,0.34],[0.54,0.5],[0.42,0.82],[0.36,1.1]], mat))
      g.add(lathe([[0.36,1.1],[0.46,1.32],[0.5,1.55],[0.46,1.78],[0.36,1.9],[0.28,2.0]], mat))
      g.add(lathe([[0.28,2.0],[0.22,2.18],[0.2,2.4],[0.24,2.6],[0.3,2.7]], mat))
      const head = sph(0.22, mat); head.position.y = 2.96; g.add(head)
      const tip = sph(0.06, gMat); tip.position.y = 3.22; g.add(tip)
      return g
    }

    function buildKnight(mat) {
      const g = new THREE.Group()
      g.add(lathe([[0,0],[0.78,0],[0.86,0.08],[0.86,0.2],[0.76,0.28],[0.64,0.35]], mat))
      const body = cyl(0.4, 0.58, 1.0, mat); body.position.y = 0.88; g.add(body)
      const neck = cyl(0.26, 0.35, 0.5, mat); neck.rotation.z = -0.28; neck.position.set(0.08, 1.6, 0); g.add(neck)
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.4, 0.3), mat)
      head.position.set(0.12, 2.0, 0); head.rotation.z = -0.18; head.castShadow = true; g.add(head)
      const snout = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.24, 0.26), mat)
      snout.position.set(0.28, 1.86, 0); snout.castShadow = true; g.add(snout)
      return g
    }

    function buildRook(mat, gMat) {
      const g = new THREE.Group()
      g.add(lathe([[0,0],[0.82,0],[0.92,0.07],[0.92,0.2],[0.82,0.28],[0.7,0.36]], mat))
      const shaft = cyl(0.56, 0.68, 1.4, mat); shaft.position.y = 1.06; g.add(shaft)
      const r = tor(0.58, 0.032, gMat); r.position.y = 1.82; g.add(r)
      const top = cyl(0.68, 0.56, 0.18, mat); top.position.y = 1.96; g.add(top)
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2
        const bat = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.24, 0.2), mat)
        bat.position.set(Math.cos(a)*0.46, 2.18, Math.sin(a)*0.46)
        bat.castShadow = true; g.add(bat)
      }
      return g
    }

    function buildPawn(mat) {
      const g = new THREE.Group()
      g.add(lathe([[0,0],[0.54,0],[0.6,0.07],[0.6,0.16],[0.52,0.24],[0.42,0.3]], mat))
      g.add(lathe([[0.42,0.3],[0.34,0.44],[0.26,0.66],[0.24,0.86],[0.26,1.0],[0.32,1.1],[0.28,1.22],[0.22,1.3]], mat))
      const head = sph(0.2, mat); head.position.y = 1.52; g.add(head)
      return g
    }

    // ── BOARD ──────────────────────────────────────────
    const boardGroup = new THREE.Group()
    const sq = 1.3
    const N = 8

    const borderMesh = new THREE.Mesh(new THREE.BoxGeometry(N * sq + 1.0, 0.16, N * sq + 1.0), borderMat)
    borderMesh.position.y = -0.08; borderMesh.receiveShadow = true; boardGroup.add(borderMesh)

    const innerBorderMesh = new THREE.Mesh(new THREE.BoxGeometry(N * sq + 0.5, 0.18, N * sq + 0.5), goldBorderMat)
    innerBorderMesh.position.y = -0.07; boardGroup.add(innerBorderMesh)

    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const isLight = (i + j) % 2 === 0
        const sqMesh = new THREE.Mesh(new THREE.BoxGeometry(sq - 0.01, 0.1, sq - 0.01), isLight ? lightSqMat : darkSqMat)
        sqMesh.position.set((i - N/2 + 0.5) * sq, 0.05, (j - N/2 + 0.5) * sq)
        sqMesh.receiveShadow = true; boardGroup.add(sqMesh)
      }
    }

    // offset board to the LEFT
    boardGroup.position.set(-7, 0, 0)
    scene.add(boardGroup)

    // ── PIECE GRID ─────────────────────────────────────
    // pieceGrid[col][row] = mesh or null
    const pieceGrid = Array.from({ length: 8 }, () => Array(8).fill(null))
    const sc = 0.65
    const yB = 0.1

    function colRowToXZ(col, row) {
      return {
        x: (col - N/2 + 0.5) * sq + boardGroup.position.x,
        z: (row - N/2 + 0.5) * sq
      }
    }

    function spawnPiece(piece, col, row) {
      const { x, z } = colRowToXZ(col, row)
      piece.scale.set(sc, sc, sc)
      piece.position.set(x, yB, z)
      scene.add(piece)
      pieceGrid[col][row] = piece
      return piece
    }

    // Place all pieces
    spawnPiece(buildRook(whiteMat, goldMat), 0, 0)
    spawnPiece(buildKnight(whiteMat), 1, 0)
    spawnPiece(buildBishop(whiteMat, goldMat), 2, 0)
    spawnPiece(buildQueen(whiteMat, goldMat), 3, 0)
    spawnPiece(buildKing(whiteMat, goldMat), 4, 0)
    spawnPiece(buildBishop(whiteMat, goldMat), 5, 0)
    spawnPiece(buildKnight(whiteMat), 6, 0)
    spawnPiece(buildRook(whiteMat, goldMat), 7, 0)
    for (let i = 0; i < 8; i++) spawnPiece(buildPawn(whiteMat), i, 1)

    spawnPiece(buildRook(blackMat, goldMat), 0, 7)
    spawnPiece(buildKnight(blackMat), 1, 7)
    spawnPiece(buildBishop(blackMat, goldMat), 2, 7)
    spawnPiece(buildQueen(blackMat, goldMat), 3, 7)
    spawnPiece(buildKing(blackMat, goldMat), 4, 7)
    spawnPiece(buildBishop(blackMat, goldMat), 5, 7)
    spawnPiece(buildKnight(blackMat), 6, 7)
    spawnPiece(buildRook(blackMat, goldMat), 7, 7)
    for (let i = 0; i < 8; i++) spawnPiece(buildPawn(blackMat), i, 6)

    // ── ENGLISH OPENING MOVES ─────────────────────────
    // Each move: [fromCol, fromRow, toCol, toRow]
    const moves = [
      [4, 1, 4, 3],   // 1. e4 (white pawn e2-e4)
      [2, 6, 2, 4],   // 1... c5 (black pawn c7-c5 - Sicilian)
      [6, 0, 5, 2],   // 2. Nf3 (white knight g1-f3)
      [1, 7, 2, 5],   // 2... Nc6 (black knight b8-c6)
      [5, 1, 5, 3],   // 3. d4 (white pawn f2-f4... actually d2-d4)
      [2, 4, 3, 3],   // 3... cxd4 (black pawn captures)
      [5, 2, 3, 3],   // 4. Nxd4 (white knight captures)
      [6, 7, 5, 5],   // 4... Nf6 (black knight g8-f6)
      [5, 0, 2, 3],   // 5. Nc3 (white knight b1-c3)
      [3, 6, 3, 4],   // 5... d6 (black pawn d7-d5)
      [2, 0, 4, 2],   // 6. Bc4 (white bishop c1-e3)
      [0, 6, 0, 4],   // 6... a6 (black pawn a7-a5)
      [3, 0, 7, 4],   // 7. Qd1-h5 (white queen move)
      [4, 6, 4, 5],   // 7... e6 (black pawn e7-e6)
    ]

    let moveIndex = 0
    let animating = false
    let movingPiece = null
    let moveTarget = null
    let moveProgress = 0
    let moveStart = null
    const MOVE_DURATION = 60  // frames
    const PAUSE_DURATION = 90 // frames between moves
    let pauseTimer = 0

    // ── PARTICLES ─────────────────────────────────────
    const pCount = 300
    const pGeo = new THREE.BufferGeometry()
    const pos = new Float32Array(pCount * 3)
    for (let i = 0; i < pCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 35
      pos[i * 3 + 1] = Math.random() * 20
      pos[i * 3 + 2] = (Math.random() - 0.5) * 35
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0xc9a84c, size: 0.06, transparent: true, opacity: 0.4,
    }))
    scene.add(particles)

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 0.98 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.15
    ground.receiveShadow = true
    scene.add(ground)

    // ── ANIMATE ────────────────────────────────────────
    let time = 0
    let animId

    function startNextMove() {
      if (moveIndex >= moves.length) moveIndex = 0
      const [fc, fr, tc, tr] = moves[moveIndex]
      const piece = pieceGrid[fc][fr]
      if (!piece) { moveIndex++; return }

      // remove captured piece if any
      if (pieceGrid[tc][tr]) {
        scene.remove(pieceGrid[tc][tr])
        pieceGrid[tc][tr] = null
      }

      pieceGrid[fc][fr] = null
      pieceGrid[tc][tr] = piece

      movingPiece = piece
      moveStart = { ...piece.position }
      moveTarget = colRowToXZ(tc, tr)
      moveProgress = 0
      animating = true
      moveIndex++
    }

    function animate() {
      animId = requestAnimationFrame(animate)
      time += 0.005

      if (animating && movingPiece) {
        moveProgress++
        const t = Math.min(moveProgress / MOVE_DURATION, 1)
        const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t // ease in-out

        movingPiece.position.x = moveStart.x + (moveTarget.x - moveStart.x) * ease
        movingPiece.position.z = moveStart.z + (moveTarget.z - moveStart.z) * ease
        // arc up
        movingPiece.position.y = yB + Math.sin(t * Math.PI) * 1.8

        if (t >= 1) {
          movingPiece.position.y = yB
          animating = false
          movingPiece = null
          pauseTimer = 0
        }
      } else {
        pauseTimer++
        if (pauseTimer >= PAUSE_DURATION) startNextMove()
      }

      // gentle camera drift — stays focused on board left side
      camera.position.x = -7 + Math.sin(time * 0.1) * 0.8
      camera.position.y = 14 + Math.sin(time * 0.08) * 1
      camera.position.z = 20 + Math.sin(time * 0.07) * 1.5
      camera.lookAt(-7, 0, 0)

      boardGlow.intensity = 1.2 + Math.sin(time * 1.2) * 0.4

      particles.rotation.y = time * 0.01
      const pa = pGeo.attributes.position.array
      for (let i = 0; i < pCount; i++) {
        pa[i * 3 + 1] += 0.006
        if (pa[i * 3 + 1] > 18) pa[i * 3 + 1] = 0
      }
      pGeo.attributes.position.needsUpdate = true

      renderer.render(scene, camera)
    }

    startNextMove()
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