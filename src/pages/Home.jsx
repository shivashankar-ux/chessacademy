import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ChessHeroScene from '../components/ChessHeroScene'
import styles from './Home.module.css'

const programs = [
  { icon: '♟', age: 'Under 6', title: 'Little Grandmasters', desc: 'Early exposure to chess fundamentals through fun, engaging sessions tailored for the youngest minds.' },
  { icon: '♞', age: 'Under 10', title: 'Rising Champions', desc: 'Structured training covering tactics, strategy and competitive thinking for growing players.' },
  { icon: '♝', age: 'Under 14', title: 'Tournament Ready', desc: 'Intensive preparation for district, state, and national tournaments with serious coaching.' },
  { icon: '♛', age: 'Above 14', title: 'Elite Development', desc: 'Advanced theory, endgame mastery, and high-level competitive strategy for aspiring champions.' },
]

const formats = [
  { icon: '🏛️', title: 'Group Classes', desc: 'Interactive academy sessions fostering teamwork and healthy competition.' },
  { icon: '🏠', title: 'Home Coaching', desc: 'Personalized lessons at your doorstep, tailored to your child\'s pace.' },
  { icon: '💻', title: 'Online Sessions', desc: 'Flexible virtual classes from anywhere, with the same expert coaching.' },
  { icon: '🏆', title: 'Tournament Prep', desc: 'Specialized preparation for competitive play at all levels.' },
]

const testimonials = [
  { name: 'Riya K.', quote: 'My son\'s confidence and chess skills have soared since joining. The coaches are truly exceptional.', stars: 5 },
  { name: 'Amit S.', quote: 'The coaches are incredibly patient and know exactly how to bring out the best in kids. Highly recommend!', stars: 5 },
  { name: 'Priya M.', quote: 'My daughter won her first district medal within 6 months. Check vs Mate is the real deal.', stars: 5 },
]

function useInView(threshold = 0.15) {
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

export default function Home() {
  const [statsRef, statsInView] = useInView()
  const [programsRef, programsInView] = useInView()
  const [coachRef, coachInView] = useInView()
  const [formatsRef, formatsInView] = useInView()
  const [testimonialsRef, testimonialsInView] = useInView()

  const [counts, setCounts] = useState({ kids: 0, years: 0, rating: 0, reviews: 0 })

  useEffect(() => {
    if (!statsInView) return
    const targets = { kids: 100, years: 12, rating: 49, reviews: 97 }
    const duration = 2000
    const start = performance.now()
    function tick(now) {
      const t = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setCounts({
        kids: Math.round(ease * targets.kids),
        years: Math.round(ease * targets.years),
        rating: Math.round(ease * targets.rating),
        reviews: Math.round(ease * targets.reviews),
      })
      if (t < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [statsInView])

  return (
    <main className={styles.main}>

      {/* ─── HERO ─────────────────────────────────────── */}
      <section className={styles.hero}>
        <ChessHeroScene />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span>⭐ 4.9 Google Rating · 97+ Reviews</span>
          </div>
          <h1 className={styles.heroTitle}>
            <span className={styles.heroTitleLine1}>Masters Are</span>
            <span className={styles.heroTitleLine2}>Born Here</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Where young minds learn to think moves ahead.<br />
            Expert chess coaching since 2013.
          </p>
          <div className={styles.heroCtas}>
            <a href="mailto:checkvsmate@gmail.com" className={styles.ctaPrimary}>
              Book Free Demo Class
            </a>
            <Link to="/gallery" className={styles.ctaSecondary}>
              View Our Gallery
            </Link>
          </div>
        </div>
        <div className={styles.heroScroll}>
          <div className={styles.scrollLine} />
          <span>Scroll</span>
        </div>
      </section>

      {/* ─── STATS ────────────────────────────────────── */}
      <section className={styles.stats} ref={statsRef}>
        <div className={styles.statsGrid}>
          <div className={`${styles.statItem} ${statsInView ? styles.visible : ''}`} style={{ animationDelay: '0ms' }}>
            <span className={styles.statNum}>{counts.kids}+</span>
            <span className={styles.statLabel}>Kids Trained</span>
          </div>
          <div className={`${styles.statItem} ${statsInView ? styles.visible : ''}`} style={{ animationDelay: '150ms' }}>
            <span className={styles.statNum}>{counts.years}+</span>
            <span className={styles.statLabel}>Years Coaching</span>
          </div>
          <div className={`${styles.statItem} ${statsInView ? styles.visible : ''}`} style={{ animationDelay: '300ms' }}>
            <span className={styles.statNum}>{(counts.rating / 10).toFixed(1)}</span>
            <span className={styles.statLabel}>Google Rating</span>
          </div>
          <div className={`${styles.statItem} ${statsInView ? styles.visible : ''}`} style={{ animationDelay: '450ms' }}>
            <span className={styles.statNum}>{counts.reviews}+</span>
            <span className={styles.statLabel}>Reviews</span>
          </div>
        </div>
      </section>

      {/* ─── ABOUT ────────────────────────────────────── */}
      <section className={styles.about}>
        <div className={styles.container}>
          <div className={styles.aboutInner}>
            <div className={styles.aboutText}>
              <p className={styles.sectionLabel}>About the Academy</p>
              <h2 className={styles.sectionTitle}>Chess Is More Than a Game</h2>
              <p className={styles.aboutBody}>
                Check vs Mate Chess Academy is a dedicated chess training institute focused on nurturing young minds through the royal game. With a proven training methodology and experienced coaching, we help children develop critical thinking, patience, and competitive skills that last a lifetime.
              </p>
              <p className={styles.aboutBody}>
                Our students have consistently delivered outstanding performances in <strong>district, state, and national-level tournaments</strong> across age categories U7, U9, U11, and U13.
              </p>
              <div className={styles.batchBadge}>
                <span>♟ Fresh Batches Starting Soon</span>
                <span className={styles.batchSub}>Under 6 · Under 10 · Under 14 · Above 14</span>
              </div>
            </div>
            <div className={styles.aboutBoard}>
              <div className={styles.miniBoard}>
                {Array.from({ length: 64 }, (_, i) => (
                  <div
                    key={i}
                    className={`${styles.sq} ${(Math.floor(i / 8) + i) % 2 === 0 ? styles.sqLight : styles.sqDark}`}
                  />
                ))}
                <div className={styles.boardPiece} style={{ top: '12.5%', left: '50%' }}>♛</div>
                <div className={styles.boardPiece} style={{ top: '37.5%', left: '25%' }}>♞</div>
                <div className={styles.boardPiece} style={{ top: '62.5%', left: '62.5%' }}>♝</div>
                <div className={styles.boardPiece} style={{ top: '87.5%', left: '37.5%' }}>♜</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PROGRAMS ─────────────────────────────────── */}
      <section className={styles.programs} ref={programsRef}>
        <div className={styles.container}>
          <p className={styles.sectionLabel}>Our Programs</p>
          <h2 className={styles.sectionTitle}>Chess Training for All Ages</h2>
          <div className={styles.programsGrid}>
            {programs.map((p, i) => (
              <div
                key={p.age}
                className={`${styles.programCard} ${programsInView ? styles.visible : ''}`}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className={styles.programIcon}>{p.icon}</div>
                <div className={styles.programAge}>{p.age}</div>
                <h3 className={styles.programTitle}>{p.title}</h3>
                <p className={styles.programDesc}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COACHES ──────────────────────────────────── */}
      <section className={styles.coaches} ref={coachRef}>
        <div className={styles.container}>
          <p className={styles.sectionLabel}>Meet the Coaches</p>
          <h2 className={styles.sectionTitle}>The Minds Behind the Masters</h2>
          <div className={styles.coachGrid}>
            <div className={`${styles.coachCard} ${coachInView ? styles.visible : ''}`} style={{ animationDelay: '0ms' }}>
              <div className={styles.coachAvatar}>♛</div>
              <h3 className={styles.coachName}>Puneet Manchanda</h3>
              <span className={styles.coachRole}>Founder & Head Coach</span>
              <p className={styles.coachDesc}>
                Founder of Check vs Mate Chess Academy (est. 2013), with 12+ years of full-time coaching experience. Has mentored hundreds of students across age groups and competitive levels, producing consistent district, state and national champions.
              </p>
              <div className={styles.coachSince}>Coaching since 2013</div>
            </div>
            <div className={`${styles.coachCard} ${coachInView ? styles.visible : ''}`} style={{ animationDelay: '200ms' }}>
              <div className={styles.coachAvatar}>♞</div>
              <h3 className={styles.coachName}>Chirag Atreja</h3>
              <span className={styles.coachRole}>Co-Founder & Coach</span>
              <p className={styles.coachDesc}>
                A passionate chess coach actively involved in training students since 2020, with a strong focus on concept clarity, structured preparation, and competitive mindset development. Known for his ability to make complex tactics accessible.
              </p>
              <div className={styles.coachSince}>Coaching since 2020</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FORMATS ──────────────────────────────────── */}
      <section className={styles.formats} ref={formatsRef}>
        <div className={styles.container}>
          <p className={styles.sectionLabel}>How We Train</p>
          <h2 className={styles.sectionTitle}>Flexible Training Formats</h2>
          <div className={styles.formatsGrid}>
            {formats.map((f, i) => (
              <div
                key={f.title}
                className={`${styles.formatCard} ${formatsInView ? styles.visible : ''}`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className={styles.formatIcon}>{f.icon}</span>
                <h3 className={styles.formatTitle}>{f.title}</h3>
                <p className={styles.formatDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─────────────────────────────── */}
      <section className={styles.testimonials} ref={testimonialsRef}>
        <div className={styles.container}>
          <p className={styles.sectionLabel}>What Parents Say</p>
          <h2 className={styles.sectionTitle}>Voices of the Community</h2>
          <div className={styles.testimonialsGrid}>
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className={`${styles.testimonialCard} ${testimonialsInView ? styles.visible : ''}`}
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className={styles.testimonialStars}>
                  {'★'.repeat(t.stars)}
                </div>
                <p className={styles.testimonialQuote}>"{t.quote}"</p>
                <span className={styles.testimonialName}>— {t.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ───────────────────────────────── */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaBannerBg} />
        <div className={styles.container}>
          <div className={styles.ctaBannerInner}>
            <span className={styles.ctaBannerIcon}>♛</span>
            <h2 className={styles.ctaBannerTitle}>Ready to Begin Your Chess Journey?</h2>
            <p className={styles.ctaBannerSub}>Fresh batches starting soon. Limited seats available.</p>
            <div className={styles.ctaBannerButtons}>
              <a href="mailto:checkvsmate@gmail.com" className={styles.ctaPrimary}>
                Book a Free Demo
              </a>
              <a href="tel:9810436745" className={styles.ctaSecondary}>
                Call Us: 9810436745
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────── */}
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
              <Link to="/">Home</Link>
              <Link to="/gallery">Gallery</Link>
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
