import './globals.css'

export const metadata = {
  title: 'Quantara — Discours vs Réalité',
  description: 'Détectez les incohérences entre discours et réalité financière',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="bg-[#020817] text-white antialiased">
        {children}
      </body>
    </html>
  )
}
