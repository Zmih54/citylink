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
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import AdminTariffs from './pages/admin/Tariffs.jsx'
import Subscribers from './pages/admin/Subscribers.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [pathname])
  return null
}

// Public-facing site wrapped in the marketing layout (header + footer).
function PublicSite() {
  return (
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
  )
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Admin area — no marketing layout, guarded inside AdminLayout */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="tariffs" element={<AdminTariffs />} />
          <Route path="subscribers" element={<Subscribers />} />
        </Route>
        {/* Everything else is the public site */}
        <Route path="/*" element={<PublicSite />} />
      </Routes>
    </>
  )
}
