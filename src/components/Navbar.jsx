import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <Link to="/" className={styles.logo}>
        <span className={styles.logoIcon}>♛</span>
        <div className={styles.logoText}>
          <span className={styles.logoMain}>Check vs Mate</span>
          <span className={styles.logoSub}>Chess Academy</span>
        </div>
      </Link>

      <div className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
        <Link to="/" className={location.pathname === '/' ? styles.active : ''}>Home</Link>
        <Link to="/gallery" className={location.pathname === '/gallery' ? styles.active : ''}>Gallery</Link>
        <a href="mailto:checkvsmate@gmail.com" className={styles.cta}>Book Free Demo</a>
      </div>

      <button
        className={`${styles.burger} ${menuOpen ? styles.burgerOpen : ''}`}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>
    </nav>
  )
}
