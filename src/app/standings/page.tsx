import Header from '@/app/components/Header'
import StandingsSection from '@/app/components/StandingsSection'
import Footer from '@/app/components/Footer'

export default function StandingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Header />
      <div className="mt-8">
        <StandingsSection />
      </div>
      <Footer />
    </div>
  )
}
