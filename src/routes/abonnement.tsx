import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Tag, message, Spin } from 'antd'
import { CheckCircle2, CreditCard, Crown, Zap, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SubscriptionService } from '@/services/subscription.service'
import { authClient, useSession } from '@/auth/auth-client'
import { env } from '@/env'
import type { SubscriptionPlan } from '@/types/subscription'

export const Route = createFileRoute('/abonnement')({
  beforeLoad: async () => {
    const session = await authClient.getSession()
    if (!session.data?.user) {
      throw redirect({ to: '/' })
    }
    return { user: session.data.user }
  },
  component: AbonnementPage,
})

const DUREE_LABELS: Record<string, string> = {
  MONTHLY: '/mois',
  QUARTERLY: '/trimestre',
  YEARLY: '/an',
}

const DUREE_COLORS: Record<string, string> = {
  MONTHLY: 'blue',
  QUARTERLY: 'purple',
  YEARLY: 'gold',
}

function AbonnementPage() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const userId = session?.user?.id
  const [subscribingPlan, setSubscribingPlan] = useState<string | null>(null)

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => SubscriptionService.getPlans(),
  })

  const { data: activeSubscription } = useQuery({
    queryKey: ['active-subscription', 'admin'],
    queryFn: () => SubscriptionService.getActiveSubscription('admin'),
    enabled: true,
  })

  const handleSubscribe = async (planId: string) => {
    if (!userId) {
      message.error('Utilisateur non connecté')
      return
    }

    const PayTechSDK = (window as any).PayTech
    if (!PayTechSDK) {
      message.error("Le module de paiement n'est pas chargé. Veuillez rafraîchir la page.")
      return
    }

    try {
      setSubscribingPlan(planId)
      const data = await SubscriptionService.subscribe(userId, planId)

      if (data.redirectUrl) {
        ;(new PayTechSDK({
          idTransaction: data.subscription?.refCommand || data.subscription?._id || planId,
        })).withOption({
          requestTokenUrl: `${env.VITE_APP_BACKEND}/subscriptions/subscribe`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          presentationMode: PayTechSDK.OPEN_IN_POPUP,
          didReceiveError: (error: string) => {
            message.error('Erreur paiement : ' + error)
            setSubscribingPlan(null)
          },
          didReceiveNonSuccessResponse: (jsonResponse: any) => {
            message.error(jsonResponse?.message || 'Erreur lors du paiement')
            setSubscribingPlan(null)
          },
        }).send()

        queryClient.invalidateQueries({ queryKey: ['active-subscription', 'admin'] })
      } else {
        message.success('Abonnement créé avec succès')
        queryClient.invalidateQueries({ queryKey: ['active-subscription', 'admin'] })
        navigate({ to: '/admin' })
      }
    } catch (err: any) {
      message.error(err?.message || 'Erreur lors de la souscription')
    } finally {
      setSubscribingPlan(null)
    }
  }

  const handleLogout = async () => {
    await authClient.signOut()
    navigate({ to: '/' })
  }

  const formatCurrency = (value: number, devise = 'XOF') =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: devise }).format(value)

  const activePlans = plans.filter((p: SubscriptionPlan) => p.actif !== false)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Logo" className="h-10 w-10 rounded-lg" />
            <span className="text-xl font-bold text-slate-800">FacturePro</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{session?.user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            Choisissez votre abonnement
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Pour accéder à votre espace de facturation, veuillez souscrire à un plan.
          </p>
        </div>

        {activeSubscription && (
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">
                Abonnement actif : {activeSubscription.planId?.nom || 'Plan'} — expire le{' '}
                {new Date(activeSubscription.dateFin).toLocaleDateString('fr-FR')}
              </span>
              <Button variant="outline" size="sm" className="ml-2" onClick={() => navigate({ to: '/admin' })}>
                Accéder à l'administration
              </Button>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activePlans.map((plan: SubscriptionPlan) => {
            const isCurrentPlan = activeSubscription?.planId?._id === plan._id

            return (
              <Card
                key={plan._id}
                className={`relative flex flex-col ${isCurrentPlan ? 'border-2 border-blue-500 shadow-lg' : ''}`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Tag color="blue" className="px-3 py-0.5 text-xs font-semibold">
                      Plan actuel
                    </Tag>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-2">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{plan.nom}</CardTitle>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col gap-4">
                  <div className="text-center">
                    <span className="text-3xl font-bold">
                      {formatCurrency(plan.prix, plan.devise)}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">
                      {DUREE_LABELS[plan.duree] || plan.duree}
                    </span>
                    <div className="mt-1">
                      <Tag color={DUREE_COLORS[plan.duree] || 'default'}>
                        {plan.duree === 'MONTHLY' ? 'Mensuel' : plan.duree === 'QUARTERLY' ? 'Trimestriel' : 'Annuel'}
                      </Tag>
                    </div>
                  </div>

                  {plan.fonctionnalites?.length > 0 && (
                    <ul className="space-y-2 flex-1">
                      {plan.fonctionnalites.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <Button
                    className="w-full mt-auto"
                    disabled={isCurrentPlan || subscribingPlan === plan._id}
                    onClick={() => handleSubscribe(plan._id)}
                  >
                    <CreditCard className="h-4 w-4" />
                    {subscribingPlan === plan._id
                      ? 'Paiement en cours...'
                      : isCurrentPlan
                        ? 'Plan actuel'
                        : "S'abonner"}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {activePlans.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Aucun plan d'abonnement disponible pour le moment.
          </div>
        )}
      </main>
    </div>
  )
}
