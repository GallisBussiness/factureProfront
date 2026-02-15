import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { authClient } from "@/auth/auth-client"
import { SubscriptionService } from "@/services/subscription.service"

export const Route = createFileRoute('/admin')({
  beforeLoad: async ({ location }) => {
    const session = await authClient.getSession()
    if (!session.data?.user) {
      throw redirect({ to: '/' })
    }

    const user = session.data.user
    const isSuccessPage = location.pathname.startsWith('/admin/abonnements/success')

    if (!isSuccessPage) {
      const subscription = await SubscriptionService.getActiveSubscription(user.id)
      if (!subscription) {
        throw redirect({ to: '/abonnement' })
      }
    }

    return { user }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
   <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="w-8/12">
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  </div>
}
