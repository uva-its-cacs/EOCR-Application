// import { useEffect, useState } from 'react'

// export default function App() {
//   const [status, setStatus] = useState('loading...')

//   useEffect(() => {
//     fetch('/api/health')
//       .then((r) => r.json())
//       .then((d) => setStatus(d.status))
//       .catch(() => setStatus('API unreachable'))
//   }, [])

//   return <h1>EOCR Application. API status: {status}</h1>
// }
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function App() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">EOCR Application</h1>
      <div className="mt-4 flex items-center gap-3">
        <Button>Styled button</Button>
        <Badge variant="secondary">Under review</Badge>
      </div>
    </div>
  )
}