// import { ReactNode } from 'react'
// import NavBar from '@/components/NavBar'
// import SideBar from '@/components/SideBar'
// import { getApiLimitCount } from '@/lib/api-limit'
// import { checkSubscription } from '@/lib/subscription'

// const DashboardLayout = async ({ children }: { children: ReactNode }) => {
//   const apiLimitCount = await getApiLimitCount()
//   const isPro = await checkSubscription()

//   return (
//     <div className="h-full relative">
//       <div className="hidden h-full md:flex md:flex-col md:fixed md:inset-y-0 bg-gray-900 md:w-72">
//         <SideBar isPro={isPro} apiLimitCount={apiLimitCount} />
//       </div>

//       <main className="md:pl-72">
//         <NavBar />
//         {children}
//       </main>
//     </div>
//   )
// }

// export default DashboardLayout


// app/(dashboard)/(routes)/layout.tsx

import { Montserrat } from 'next/font/google'
//import './globals.css'
import { cn } from '@/lib/utils'
import SideBar from '@/components/sidebar'

const font = Montserrat({
  weight: '600',
  subsets: ['latin'],
})

export const metadata = {
  title: 'Dashboard | AI SaaS',
  description: 'Your personalized AI tools suite.',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative h-full">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 bg-gray-900">
        <SideBar />
      </div>

      <main className="md:pl-72 h-full">
        {children}
      </main>
    </div>
  )
}
