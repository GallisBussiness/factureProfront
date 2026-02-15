import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/abonnements/cancel')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/admin/abonnements/cancel"!</div>
}
