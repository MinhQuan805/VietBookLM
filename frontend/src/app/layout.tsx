import { SWRConfigProvider } from '@/components/SWRConfigProvider'
import "./global.css"
import "katex/dist/katex.min.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SWRConfigProvider>
          {children}
        </SWRConfigProvider>
      </body>
    </html>
  )
}
