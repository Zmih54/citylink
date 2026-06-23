import Header from './Header.jsx'
import Footer from './Footer.jsx'
import SupportChat from './SupportChat.jsx'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <SupportChat />
    </div>
  )
}
