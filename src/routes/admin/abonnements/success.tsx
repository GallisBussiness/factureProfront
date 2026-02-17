import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Spin, Tag } from 'antd'
import { CheckCircle2, XCircle, ArrowLeft, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SubscriptionService } from '@/services/subscription.service'

export const Route = createFileRoute('/admin/abonnements/success')({
  component: SubscriptionSuccessPage,
  validateSearch: (search: Record<string, unknown>) => ({
    ref: (search.ref as string) || '',
  }),
})

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  COMPLETED: { color: 'green', label: 'Complété' },
  PENDING: { color: 'orange', label: 'En attente' },
  CANCELLED: { color: 'red', label: 'Annulé' },
  REFUNDED: { color: 'purple', label: 'Remboursé' },
}

function SubscriptionSuccessPage() {
  const navigate = useNavigate()
  const { ref } = Route.useSearch()

  const { data: payment, isLoading, isError } = useQuery({
    queryKey: ['payment', ref],
    queryFn: () => SubscriptionService.getPaymentByRef(ref),
    enabled: !!ref,
  })
  const formatCurrency = (value: number, devise = 'XOF') =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise }).format(value)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <Spin size="large" />
          <p className="text-muted-foreground">Vérification du paiement...</p>
        </div>
      </div>
    )
  }

  if (!ref || isError || !payment) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Paiement introuvable</h1>
            <p className="text-muted-foreground">
              La référence de paiement est invalide ou le paiement n'a pas été trouvé.
            </p>
          </div>
          <Button onClick={() => navigate({ to: '/abonnement' })}>
            <ArrowLeft className="h-4 w-4" />
            Retour aux plans
          </Button>
        </div>
      </div>
    )
  }

  const statusConf = STATUS_CONFIG[payment.statut] || { color: 'default', label: payment.statut }
  const isSuccess = payment.statut === 'COMPLETED'

  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="text-center space-y-6 max-w-lg w-full">
        <div className="flex justify-center">
          <div className={`h-20 w-20 rounded-full flex items-center justify-center ${isSuccess ? 'bg-green-100' : 'bg-orange-100'}`}>
            {isSuccess ? (
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            ) : (
              <CreditCard className="h-10 w-10 text-orange-600" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {isSuccess ? 'Paiement réussi !' : 'Paiement en cours'}
          </h1>
          <p className="text-muted-foreground">
            {isSuccess
              ? 'Votre abonnement est maintenant actif.'
              : 'Votre paiement est en cours de traitement.'}
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Montant</span>
                <span className="font-bold text-lg">
                  {formatCurrency(payment.montant, payment.devise)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Référence</span>
                <span className="font-mono text-xs">{payment.refCommand}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Méthode</span>
                <span>{payment.paymentMethod || 'En attente de confirmation'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Statut</span>
                <Tag color={statusConf.color}>{statusConf.label}</Tag>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span>{new Date(payment.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={() => navigate({ to: '/admin' })}>
          <ArrowLeft className="h-4 w-4" />
          Retour au tableau de bord
        </Button>
      </div>
    </div>
  )
}
