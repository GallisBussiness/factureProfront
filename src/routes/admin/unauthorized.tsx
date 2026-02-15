import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/admin/unauthorized')({
  component: UnauthorizedPage,
})

function UnauthorizedPage() {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
            <ShieldAlert className="h-10 w-10 text-red-600" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Accès refusé</h1>
          <p className="text-muted-foreground">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            Contactez un administrateur si vous pensez qu'il s'agit d'une erreur.
          </p>
        </div>

        <Button onClick={() => navigate({ to: '/admin' })}>
          <ArrowLeft className="h-4 w-4" />
          Retour au tableau de bord
        </Button>
      </div>
    </div>
  )
}
