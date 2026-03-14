import { useRef, useEffect } from 'react'
import * as THREE from 'three'

// ── Minimal chess engine ──────────────────────────────────────────────────────
const W = 1, B = 2
const PAWN = 1, KNIGHT = 2, BISHOP = 3, ROOK = 4, QUEEN = 5, KING = 6

function initBoard() {
  const b = Array.from({ length: 8 }, () => Array(8).fill(null))
  const back = [ROOK, KNIGHT, BISHOP, QUEEN, KING, BISHOP, KNIGHT, ROOK]
  for (let c = 0; c < 8; c++) {
    b[0][c] = { type: back[c], color: W }
    b[1][c] = { type: PAWN, color: W }
    b[6][c] = { type: PAWN, color: B }
    b[7][c] = { type: back[c], color: B }
  }
  return b
}

function inBounds(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8 }

function getMoves(board, r, c) {
  const piece = board[r][c]
  if (!piece) return []
  const moves = []
  const { type, color } = piece
  const enemy = color === W ? B : W

  function push(nr, nc) {
    if (!inBounds(nr, nc)) return false
    const t = board[nr][nc]
    if (t && t.color === color) return false
    moves.push({ from: [r, c], to: [nr, nc], capture: !!t })
    return !t
  }

  if (type === PAWN) {
    const dir = color === W ? 1 : -1
    const start = color === W ? 1 : 6
    if (inBounds(r + dir, c) && !board[r + dir][c]) {
      moves.push({ from: [r, c], to: [r + dir, c], capture: false })
      if (r === start && !board[r + dir * 2][c])
        moves.push({ from: [r, c], to: [r + dir * 2, c], capture: false })
    }
    for (const dc of [-1, 1])
      if (inBounds(r + dir, c + dc) && board[r + dir][c + dc]?.color === enemy)
        moves.push({ from: [r, c], to: [r + dir, c + dc], capture: true })
  } else if (type === KNIGHT) {
    for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) push(r+dr, c+dc)
  } else if (type === BISHOP || type === QUEEN) {
    for (const [dr, dc] of [[-1,-1],[-1,1],[1,-1],[1,1]])
      for (let i = 1; i < 8; i++) if (!push(r+dr*i, c+dc*i)) break
  }
  if (type === ROOK || type === QUEEN) {
    for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]])
      for (let i = 1; i < 8; i++) if (!push(r+dr*i, c+dc*i)) break
  }
  if (type === KING)
    for (const [dr, dc] of [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]]) push(r+dr, c+dc)
  return moves
}

function getAllMoves(board, color) {
  const all = []
  for (let r = 0; r < 8; r++)
    for (let c = 0; c < 8; c++)
      if (board[r][c]?.color === color) all.push(...getMoves(board, r, c))
  return all
}

function applyMove(board, move) {
  const nb = board.map(r => r.map(p => p ? { ...p } : null))
  nb[move.to[0]][move.to[1]] = nb[move.from[0]][move.from[1]]
  nb[move.from[0]][move.from[1]] = null
  if (nb[move.to[0]][move.to[1]]?.type === PAWN && (move.to[0] === 7 || move.to[0] === 0))
    nb[move.to[0]][move.to[1]].type = QUEEN
  return nb
}

function pickMove(board, color) {
  const moves = getAllMoves(board, color)
  if (!moves.length) return null
  const captures = moves.filter(m => m.capture)
  const pool = captures.length ? captures : moves
  return pool[Math.floor(Math.random() * pool.length)]
}

// ── THREE.js component ────────────────────────────────────────────────────────
export default function ChessBoard3D() {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const W3 = mount.clientWidth, H3 = mount.clientHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(W3, H3)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.3
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(40, W3/H3, 0.1, 100)
    camera.position.set(0, 16, 18)
    camera.lookAt(0, 0, 0)

    scene.add(new THREE.AmbientLight(0x222233, 4))
    const sun = new THREE.DirectionalLight(0xffd27a, 3)
    sun.position.set(-8, 20, 12); sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    Object.assign(sun.shadow.camera, { left:-15, right:15, top:15, bottom:-15, near:1, far:50 })
    scene.add(sun)
    const fill = new THREE.DirectionalLight(0x4466cc, 0.6); fill.position.set(10,5,-5); scene.add(fill)
    const boardGlow = new THREE.PointLight(0xc9a84c, 2, 30); boardGlow.position.set(0,5,0); scene.add(boardGlow)

    const whiteMat = new THREE.MeshStandardMaterial({ color:0xf0e6d0, roughness:0.1, metalness:0.05 })
    const blackMat = new THREE.MeshStandardMaterial({ color:0x1a1a2e, roughness:0.15, metalness:0.3 })
    const goldMat  = new THREE.MeshStandardMaterial({ color:0xc9a84c, roughness:0.05, metalness:1, emissive:0xc9a84c, emissiveIntensity:0.12 })
    const lightSqMat = new THREE.MeshStandardMaterial({ color:0xd4a85a, roughness:0.35 })
    const darkSqMat  = new THREE.MeshStandardMaterial({ color:0x2c1a0a, roughness:0.5 })
    const borderMat  = new THREE.MeshStandardMaterial({ color:0x5c2e00, roughness:0.4, metalness:0.3 })
    const goldBorderMat = new THREE.MeshStandardMaterial({ color:0x8a6010, roughness:0.2, metalness:0.6 })

    function lathe(pts, mat, segs=36) { const g=new THREE.LatheGeometry(pts.map(([x,y])=>new THREE.Vector2(x,y)),segs); const m=new THREE.Mesh(g,mat); m.castShadow=true; m.receiveShadow=true; return m }
    function tor(r,t,mat) { const m=new THREE.Mesh(new THREE.TorusGeometry(r,t,10,40),mat); m.rotation.x=Math.PI/2; m.castShadow=true; return m }
    function sph(r,mat) { const m=new THREE.Mesh(new THREE.SphereGeometry(r,20,20),mat); m.castShadow=true; return m }
    function cyl(rt,rb,h,mat,s=20) { const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,s),mat); m.castShadow=true; return m }

    function buildQueen(mat,gMat) {
      const g=new THREE.Group()
      g.add(lathe([[0,0],[0.9,0],[1.0,0.05],[1.0,0.18],[0.9,0.28],[0.75,0.36]],mat))
      const r1=tor(0.78,0.035,gMat);r1.position.y=0.25;g.add(r1)
      g.add(lathe([[0.75,0.36],[0.62,0.52],[0.5,0.85],[0.44,1.1]],mat))
      g.add(lathe([[0.44,1.1],[0.54,1.38],[0.6,1.65],[0.62,1.85],[0.58,2.05],[0.48,2.2],[0.38,2.32]],mat))
      const r2=tor(0.55,0.03,gMat);r2.position.y=1.85;g.add(r2)
      g.add(lathe([[0.38,2.32],[0.32,2.46],[0.3,2.62],[0.33,2.76],[0.4,2.86]],mat))
      const r3=tor(0.42,0.025,gMat);r3.position.y=2.88;g.add(r3)
      const cb=cyl(0.46,0.4,0.18,mat);cb.position.y=3.02;g.add(cb)
      for(let i=0;i<5;i++){const a=(i/5)*Math.PI*2;const sp=cyl(0.025,0.04,0.32,mat,6);sp.position.set(Math.cos(a)*0.32,3.28,Math.sin(a)*0.32);g.add(sp);const o=sph(0.055,gMat);o.position.set(Math.cos(a)*0.32,3.46,Math.sin(a)*0.32);g.add(o)}
      const to=sph(0.1,gMat);to.position.y=3.46;g.add(to);return g
    }
    function buildKing(mat,gMat) {
      const g=new THREE.Group()
      g.add(lathe([[0,0],[0.9,0],[1.0,0.05],[1.0,0.18],[0.9,0.28],[0.75,0.36]],mat))
      g.add(lathe([[0.75,0.36],[0.62,0.54],[0.48,0.92],[0.42,1.18]],mat))
      g.add(lathe([[0.42,1.18],[0.52,1.44],[0.56,1.7],[0.54,1.95],[0.44,2.12],[0.36,2.22]],mat))
      g.add(lathe([[0.36,2.22],[0.3,2.36],[0.28,2.54],[0.31,2.68],[0.38,2.76]],mat))
      const r=tor(0.4,0.025,gMat);r.position.y=2.78;g.add(r)
      const cb=cyl(0.44,0.38,0.16,mat);cb.position.y=2.92;g.add(cb)
      const cv=cyl(0.04,0.04,0.44,gMat);cv.position.y=3.22;g.add(cv)
      const ch=cyl(0.04,0.04,0.28,gMat);ch.rotation.z=Math.PI/2;ch.position.y=3.34;g.add(ch);return g
    }
    function buildBishop(mat,gMat) {
      const g=new THREE.Group()
      g.add(lathe([[0,0],[0.78,0],[0.88,0.07],[0.88,0.18],[0.78,0.27],[0.65,0.34]],mat))
      g.add(lathe([[0.65,0.34],[0.54,0.5],[0.42,0.82],[0.36,1.1]],mat))
      g.add(lathe([[0.36,1.1],[0.46,1.32],[0.5,1.55],[0.46,1.78],[0.36,1.9],[0.28,2.0]],mat))
      g.add(lathe([[0.28,2.0],[0.22,2.18],[0.2,2.4],[0.24,2.6],[0.3,2.7]],mat))
      const head=sph(0.22,mat);head.position.y=2.96;g.add(head)
      const tip=sph(0.06,gMat);tip.position.y=3.22;g.add(tip);return g
    }
    function buildKnight(mat) {
      const g=new THREE.Group()
      g.add(lathe([[0,0],[0.78,0],[0.86,0.08],[0.86,0.2],[0.76,0.28],[0.64,0.35]],mat))
      const body=cyl(0.4,0.58,1.0,mat);body.position.y=0.88;g.add(body)
      const neck=cyl(0.26,0.35,0.5,mat);neck.rotation.z=-0.28;neck.position.set(0.08,1.6,0);g.add(neck)
      const head=new THREE.Mesh(new THREE.BoxGeometry(0.44,0.4,0.3),mat);head.position.set(0.12,2.0,0);head.rotation.z=-0.18;head.castShadow=true;g.add(head)
      const snout=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.24,0.26),mat);snout.position.set(0.28,1.86,0);snout.castShadow=true;g.add(snout);return g
    }
    function buildRook(mat,gMat) {
      const g=new THREE.Group()
      g.add(lathe([[0,0],[0.82,0],[0.92,0.07],[0.92,0.2],[0.82,0.28],[0.7,0.36]],mat))
      const shaft=cyl(0.56,0.68,1.4,mat);shaft.position.y=1.06;g.add(shaft)
      const r=tor(0.58,0.032,gMat);r.position.y=1.82;g.add(r)
      const top=cyl(0.68,0.56,0.18,mat);top.position.y=1.96;g.add(top)
      for(let i=0;i<4;i++){const a=(i/4)*Math.PI*2;const bat=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.24,0.2),mat);bat.position.set(Math.cos(a)*0.46,2.18,Math.sin(a)*0.46);bat.castShadow=true;g.add(bat)}
      return g
    }
    function buildPawn(mat) {
      const g=new THREE.Group()
      g.add(lathe([[0,0],[0.54,0],[0.6,0.07],[0.6,0.16],[0.52,0.24],[0.42,0.3]],mat))
      g.add(lathe([[0.42,0.3],[0.34,0.44],[0.26,0.66],[0.24,0.86],[0.26,1.0],[0.32,1.1],[0.28,1.22],[0.22,1.3]],mat))
      const head=sph(0.2,mat);head.position.y=1.52;g.add(head);return g
    }

    // Board
    const boardGroup = new THREE.Group()
    const SQ = 1.3, N = 8
    const brd = new THREE.Mesh(new THREE.BoxGeometry(N*SQ+1.0,0.16,N*SQ+1.0), borderMat)
    brd.position.y=-0.08; brd.receiveShadow=true; boardGroup.add(brd)
    const ib = new THREE.Mesh(new THREE.BoxGeometry(N*SQ+0.5,0.18,N*SQ+0.5), goldBorderMat)
    ib.position.y=-0.07; boardGroup.add(ib)
    for(let i=0;i<N;i++) for(let j=0;j<N;j++) {
      const sq=new THREE.Mesh(new THREE.BoxGeometry(SQ-0.01,0.1,SQ-0.01),(i+j)%2===0?lightSqMat:darkSqMat)
      sq.position.set((i-N/2+0.5)*SQ,0.05,(j-N/2+0.5)*SQ); sq.receiveShadow=true; boardGroup.add(sq)
    }
    scene.add(boardGroup)

    // Particles
    const pCount=300, pGeo=new THREE.BufferGeometry(), pPos=new Float32Array(pCount*3)
    for(let i=0;i<pCount;i++){pPos[i*3]=(Math.random()-0.5)*25;pPos[i*3+1]=Math.random()*15;pPos[i*3+2]=(Math.random()-0.5)*25}
    pGeo.setAttribute('position',new THREE.BufferAttribute(pPos,3))
    scene.add(new THREE.Points(pGeo,new THREE.PointsMaterial({color:0xc9a84c,size:0.055,transparent:true,opacity:0.5})))
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.MeshStandardMaterial({color:0x050505,roughness:0.98}))
    ground.rotation.x=-Math.PI/2; ground.position.y=-0.12; ground.receiveShadow=true; scene.add(ground)

    const YB=0.1, SC=0.65
    let pieceMap=Array.from({length:8},()=>Array(8).fill(null))

    function colRow2World(r,c){ return new THREE.Vector3((c-N/2+0.5)*SQ, YB, (r-N/2+0.5)*SQ) }

    function buildMesh(type,color){
      const mat=color===W?whiteMat:blackMat
      switch(type){
        case PAWN: return buildPawn(mat)
        case KNIGHT: return buildKnight(mat)
        case BISHOP: return buildBishop(mat,goldMat)
        case ROOK: return buildRook(mat,goldMat)
        case QUEEN: return buildQueen(mat,goldMat)
        case KING: return buildKing(mat,goldMat)
        default: return new THREE.Group()
      }
    }

    function spawnBoard(board){
      for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(pieceMap[r][c]){scene.remove(pieceMap[r][c]);pieceMap[r][c]=null}
      for(let r=0;r<8;r++) for(let c=0;c<8;c++){
        const p=board[r][c]; if(!p) continue
        const mesh=buildMesh(p.type,p.color)
        mesh.scale.set(SC,SC,SC); mesh.position.copy(colRow2World(r,c))
        boardGroup.add(mesh); pieceMap[r][c]=mesh
      }
    }

    const anims=[]
    let boardState=initBoard(), currentTurn=W, moveTimer=0
    const MOVE_INTERVAL=0.45, ANIM_DURATION=0.35
    let gameOver=false, resetTimer=0
    spawnBoard(boardState)

    function easeInOut(t){ return t<0.5?2*t*t:-1+(4-2*t)*t }

    function triggerMove(){
      const move=pickMove(boardState,currentTurn)
      if(!move){gameOver=true;return}
      const [fr,fc]=move.from, [tr,tc]=move.to
      const movingMesh=pieceMap[fr][fc]
      if(!movingMesh) return
if(move.capture&&pieceMap[tr][tc]){scene.remove(pieceMap[tr][tc]);pieceMap[tr][tc]=null}      const fromPos=colRow2World(fr,fc).clone()
      const toPos=colRow2World(tr,tc).clone()
      boardState=applyMove(boardState,move)
      pieceMap[fr][fc]=null; pieceMap[tr][tc]=movingMesh
      anims.push({mesh:movingMesh,from:fromPos,to:toPos,arcHeight:2.2+Math.random()*1.5,duration:ANIM_DURATION,elapsed:0})
      let wK=false,bK=false
      for(let r=0;r<8;r++) for(let c=0;c<8;c++){const p=boardState[r][c];if(p?.type===KING){if(p.color===W)wK=true;else bK=true}}
      if(!wK||!bK){gameOver=true;return}
      currentTurn=currentTurn===W?B:W
    }

    function resetGame(){
      for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(pieceMap[r][c]){boardGroup.remove(pieceMap[r][c]);pieceMap[r][c]=null}
      anims.length=0; boardState=initBoard(); currentTurn=W; gameOver=false; moveTimer=0
      spawnBoard(boardState)
    }

    let time=0, animId, lastT=performance.now()

    function animate(){
      animId=requestAnimationFrame(animate)
      const now=performance.now()
      const dt=Math.min((now-lastT)/1000,0.05); lastT=now; time+=dt

      boardGroup.rotation.y=time*0.15
      camera.position.x=Math.sin(time*0.3)*4
      camera.position.y=16+Math.sin(time*0.2)*1.5
      camera.position.z=18+Math.cos(time*0.25)*2
      camera.lookAt(0,0,0)

      const pa=pGeo.attributes.position.array
      for(let i=0;i<pCount;i++){pa[i*3+1]+=0.005;if(pa[i*3+1]>15)pa[i*3+1]=0}
      pGeo.attributes.position.needsUpdate=true
      boardGlow.intensity=1.8+Math.sin(time*1.5)*0.5

      for(let i=anims.length-1;i>=0;i--){
        const a=anims[i]; a.elapsed+=dt
        const t=Math.min(a.elapsed/a.duration,1), et=easeInOut(t)
        a.mesh.position.lerpVectors(a.from,a.to,et)
        a.mesh.position.y=a.from.y+(a.to.y-a.from.y)*et+Math.sin(Math.PI*t)*a.arcHeight
        if(t>=1) anims.splice(i,1)
      }

      const animSet=new Set(anims.map(a=>a.mesh))
      for(let r=0;r<8;r++) for(let c=0;c<8;c++){
        const m=pieceMap[r][c]
        if(m&&!animSet.has(m)) m.position.y=YB+Math.sin(time*0.8+(r*8+c)*0.4)*0.03
      }

      if(!gameOver){ moveTimer+=dt; if(moveTimer>=MOVE_INTERVAL&&anims.length===0){moveTimer=0;triggerMove()} }
      else { resetTimer+=dt; if(resetTimer>=2.5){resetTimer=0;resetGame()} }

      renderer.render(scene,camera)
    }
    animate()

    function onResize(){ const w=mount.clientWidth,h=mount.clientHeight; camera.aspect=w/h; camera.updateProjectionMatrix(); renderer.setSize(w,h) }
    window.addEventListener('resize',onResize)
    return ()=>{ cancelAnimationFrame(animId); window.removeEventListener('resize',onResize); if(mount.contains(renderer.domElement))mount.removeChild(renderer.domElement); renderer.dispose() }
  }, [])

  return <div ref={mountRef} style={{width:'100%',height:'100%',position:'absolute',inset:0}} />
}