import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'

export function Layout() {
  const location = useLocation()

  useEffect(() => {
    const h1 = document.querySelector<HTMLElement>('#main-content h1')
    if (h1) h1.focus()
  }, [location.pathname])

  return (
    <>
      <a
        href="#main-content"
        className="skip-link"
      >
        Skip to main content
      </a>
      <header className="site-header">
        <span className="site-header__name">EOCR Application</span>
      </header>
      <main
        id="main-content"
        className="main-content"
      >
        <Outlet />
      </main>
    </>
  )
}
