import Navbar         from '../../components/Navbar'
import Hero           from '../../components/Hero'
import UploadZone     from '../../components/UploadZone'
import PopularReports from '../../components/PopularReports'
import FeatureCards   from '../../components/FeatureCards'
import WhySection     from '../../components/WhySection'
import Footer         from '../../components/Footer'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-950/20 to-[#020817]">
      <Navbar />
      <Hero />
      <UploadZone />
      <PopularReports />
      <FeatureCards />
      <WhySection />
      <Footer />
    </main>
  )
}
