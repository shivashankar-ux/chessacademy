import { useState, useEffect, useRef } from 'react'
import styles from './Gallery.module.css'

// Gallery categories with chess-themed placeholder images
const galleryItems = [
  {
    id: 1, category: 'tournaments', title: 'District Championship 2024',
    desc: 'Our students dominating the district level tournament',
    img: 'https://images.unsplash.com/photo-1560174038-da43ac74f01b?w=800&q=80',
  },
  {
    id: 2, category: 'training', title: 'Academy Training Session',
    desc: 'Focused training at our state-of-the-art facility',
    img: 'https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=800&q=80',
  },
  {
    id: 3, category: 'winners', title: 'National Level Winners',
    desc: 'Celebrating our national level champions',
    img: 'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=800&q=80',
  },
  {
    id: 4, category: 'training', title: 'Young Grandmasters in Making',
    desc: 'Under 6 batch sharpening their skills',
    img: 'https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?w=800&q=80',
  },
  {
    id: 5, category: 'tournaments', title: 'State Championship',
    desc: 'Representing Delhi at the state championship',
    img: 'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&q=80',
  },
  {
    id: 6, category: 'winners', title: 'Trophy Room',
    desc: 'A collection of our achievements over the years',
    img: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
  },
  {
    id: 7, category: 'training', title: 'Online Session',
    desc: 'Virtual coaching reaching students everywhere',
    img: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800&q=80',
  },
  {
    id: 8, category: 'tournaments', title: 'Under 11 Category',
    desc: 'U11 players competing at the highest level',
    img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
  },
  {
    id: 9, category: 'winners', title: 'Puneet Manchanda with Champions',
    desc: 'Coach Puneet with our medal-winning students',
    img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
  },
  {
    id: 10, category: 'training', title: 'Group Analysis Session',
    desc: 'Breaking down famous games together',
    img: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80',
  },
  {
    id: 11, category: 'tournaments', title: 'National U13 Tournament',
    desc: 'Our U13 team at the nationals',
    img: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&q=80',
  },
  {
    id: 12, category: 'winners', title: 'Annual Prize Distribution',
    desc: 'Celebrating the year\'s achievements',
    img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
  },
]

const categories = [
  { key: 'all', label: 'All' },
  { key: 'tournaments', label: 'Tournaments' },
  { key: 'training', label: 'Training' },
  { key: 'winners', label: 'Winners' },
]

function useInView(threshold = 0.1) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setInView(true)
    }, { threshold })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])
  return [ref, inView]
}

export default function Gallery() {
  const [active, setActive] = useState('all')
  const [lightbox, setLightbox] = useState(null)
  const [headerRef, headerInView] = useInView()

  const filtered = active === 'all'
    ? galleryItems
    : galleryItems.filter(i => i.category === active)

  // Close lightbox on ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setLightbox(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const goNext = () => {
    const idx = filtered.findIndex(i => i.id === lightbox.id)
    setLightbox(filtered[(idx + 1) % filtered.length])
  }
  const goPrev = () => {
    const idx = filtered.findIndex(i => i.id === lightbox.id)
    setLightbox(filtered[(idx - 1 + filtered.length) % filtered.length])
  }

  return (
    <main className={styles.main}>

      {/* ─── HEADER ────────────────────────────────── */}
      <section className={styles.header} ref={headerRef}>
        <div className={styles.headerBg} />
        <div className={styles.headerContent}>
          <p className={`${styles.headerLabel} ${headerInView ? styles.visible : ''}`}>Our Story in Photos</p>
          <h1 className={`${styles.headerTitle} ${headerInView ? styles.visible : ''}`}>
            The <em>Gallery</em>
          </h1>
          <p className={`${styles.headerSub} ${headerInView ? styles.visible : ''}`}>
            Champions made, tournaments won, memories forged.
          </p>
        </div>
        <div className={styles.headerChessRow}>
          {'♜♞♝♛♚♝♞♜'.split('').map((p, i) => (
            <span key={i} style={{ animationDelay: `${i * 0.15}s` }}>{p}</span>
          ))}
        </div>
      </section>

      {/* ─── FILTER ────────────────────────────────── */}
      <div className={styles.filterBar}>
        {categories.map(c => (
          <button
            key={c.key}
            className={`${styles.filterBtn} ${active === c.key ? styles.filterActive : ''}`}
            onClick={() => setActive(c.key)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* ─── GRID ──────────────────────────────────── */}
      <section className={styles.grid}>
        <div className={styles.gridInner}>
          {filtered.map((item, i) => (
            <GalleryItem key={item.id} item={item} index={i} onClick={() => setLightbox(item)} />
          ))}
        </div>
      </section>

      {/* ─── LIGHTBOX ──────────────────────────────── */}
      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)}>
          <div className={styles.lightboxInner} onClick={e => e.stopPropagation()}>
            <button className={styles.lightboxClose} onClick={() => setLightbox(null)}>✕</button>
            <button className={`${styles.lightboxNav} ${styles.lightboxPrev}`} onClick={goPrev}>‹</button>
            <div className={styles.lightboxImageWrap}>
              <img src={lightbox.img} alt={lightbox.title} className={styles.lightboxImage} />
            </div>
            <div className={styles.lightboxInfo}>
              <span className={styles.lightboxCategory}>{lightbox.category}</span>
              <h3 className={styles.lightboxTitle}>{lightbox.title}</h3>
              <p className={styles.lightboxDesc}>{lightbox.desc}</p>
            </div>
            <button className={`${styles.lightboxNav} ${styles.lightboxNext}`} onClick={goNext}>›</button>
          </div>
        </div>
      )}

      {/* ─── FOOTER ────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
              <span className={styles.footerIcon}>♛</span>
              <div>
                <div className={styles.footerName}>Check vs Mate Chess Academy</div>
                <div className={styles.footerTagline}>Where young minds sharpen</div>
              </div>
            </div>
            <div className={styles.footerLinks}>
              <a href="/">Home</a>
              <a href="/gallery">Gallery</a>
              <a href="mailto:checkvsmate@gmail.com">checkvsmate@gmail.com</a>
              <a href="tel:9810436745">9810436745</a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span>© 2025 Check vs Mate Chess Academy. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </main>
  )
}

function GalleryItem({ item, index, onClick }) {
  const [ref, inView] = useInView(0.05)
  return (
    <div
      ref={ref}
      className={`${styles.galleryItem} ${inView ? styles.visible : ''}`}
      style={{ animationDelay: `${(index % 4) * 80}ms` }}
      onClick={onClick}
    >
      <div className={styles.galleryImageWrap}>
        <img src={item.img} alt={item.title} className={styles.galleryImage} loading="lazy" />
        <div className={styles.galleryOverlay}>
          <div className={styles.galleryOverlayContent}>
            <span className={styles.galleryCat}>{item.category}</span>
            <h3 className={styles.galleryTitle}>{item.title}</h3>
            <span className={styles.galleryViewIcon}>⊕</span>
          </div>
        </div>
      </div>
    </div>
  )
}
