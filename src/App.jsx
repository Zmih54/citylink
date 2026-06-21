import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Rates from './pages/Rates.jsx'
import News from './pages/News.jsx'
import NewsDetail from './pages/NewsDetail.jsx'
import Contacts from './pages/Contacts.jsx'
import Connection from './pages/Connection.jsx'
import Payment from './pages/Payment.jsx'
import Help from './pages/Help.jsx'
import Cabinet from './pages/Cabinet.jsx'
import NotFound from './pages/NotFound.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rates" element={<Rates />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/connection" element={<Connection />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/help" element={<Help />} />
          <Route path="/cabinet" element={<Cabinet />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </>
  )
}
