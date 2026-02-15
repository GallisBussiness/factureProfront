import { createFileRoute } from '@tanstack/react-router'
import { useQueries } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NumberTicker } from '@/components/ui/number-ticker'
import { ClientService } from '@/services/client.service'
import { ProductService } from '@/services/product.service'
import { InvoiceService } from '@/services/invoice.service'
import { StockService } from '@/services/stock.service'
import type { Client } from '@/types/client'
import type { Product } from '@/types/product'
import type { Invoice } from '@/types/invoice'
import type { StockMovement } from '@/types/stock'
import { MovementType } from '@/types/stock'
import { 
  Users2, 
  Package, 
  CheckCircle2,
  Calendar,
  FileText,
  Warehouse,
  TrendingUp,
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react'

export const Route = createFileRoute('/admin/')({
  component: RouteComponent,
})

interface DashboardStats {
  totalClients: number
  clientsActifs: number
  clientsInactifs: number
  totalProduits: number
  produitsActifs: number
  produitsInactifs: number
  totalFactures: number
  chiffreAffaires: number
  facturesMoisEnCours: number
  totalMouvements: number
  mouvementsEntree: number
  mouvementsSortie: number
  alertesStock: Product[]
  recentClients: Client[]
  recentProduits: Product[]
  recentFactures: Invoice[]
  recentMouvements: StockMovement[]
}

function RouteComponent() {
  const results = useQueries({
    queries: [
      {
        queryKey: ['clients'],
        queryFn: () => ClientService.getAll(),
      },
      {
        queryKey: ['products'],
        queryFn: () => ProductService.getAll(),
      },
      {
        queryKey: ['invoices'],
        queryFn: () => InvoiceService.getAll(),
      },
      {
        queryKey: ['stock-movements'],
        queryFn: () => StockService.getAll(),
      },
    ],
  })

  const [clientsQuery, productsQuery, invoicesQuery, stockQuery] = results
  const isLoading = results.some((r) => r.isLoading)
  const isError = results.some((r) => r.isError)

  const stats = useMemo<DashboardStats>(() => {
    const clients = clientsQuery.data ?? []
    const produits = productsQuery.data ?? []
    const factures = (invoicesQuery.data ?? []) as Invoice[]
    const mouvements = (stockQuery.data ?? []) as StockMovement[]

    const clientsActifs = clients.filter((c: Client) => c.actif !== false).length
    const clientsInactifs = clients.filter((c: Client) => c.actif === false).length

    const produitsActifs = produits.filter((p: Product) => p.actif !== false).length
    const produitsInactifs = produits.filter((p: Product) => p.actif === false).length

    const chiffreAffaires = factures.reduce((sum: number, f: Invoice) => sum + (f.total ?? 0), 0)

    const now = new Date()
    const debutMois = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const facturesMoisEnCours = factures.filter((f: Invoice) => f.createdAt && f.createdAt >= debutMois).length

    const mouvementsEntree = mouvements.filter((m: StockMovement) => m.type === MovementType.ENTREE).length
    const mouvementsSortie = mouvements.filter((m: StockMovement) => m.type === MovementType.SORTIE).length

    const alertesStock = produits.filter(
      (p: Product) => p.seuilAlerte != null && p.quantiteStock != null && p.quantiteStock <= p.seuilAlerte
    )

    const recentClients = [...clients]
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .slice(0, 5)

    const recentProduits = [...produits]
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .slice(0, 5)

    const recentFactures = [...factures]
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .slice(0, 5)

    const recentMouvements = [...mouvements]
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .slice(0, 5)

    return {
      totalClients: clients.length,
      clientsActifs,
      clientsInactifs,
      totalProduits: produits.length,
      produitsActifs,
      produitsInactifs,
      totalFactures: factures.length,
      chiffreAffaires,
      facturesMoisEnCours,
      totalMouvements: mouvements.length,
      mouvementsEntree,
      mouvementsSortie,
      alertesStock,
      recentClients,
      recentProduits,
      recentFactures,
      recentMouvements,
    }
  }, [clientsQuery.data, productsQuery.data, invoicesQuery.data, stockQuery.data])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(value)

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">Erreur lors du chargement des statistiques</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de la facturation commerciale</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberTicker value={stats.totalClients} />
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.clientsActifs} actifs · {stats.clientsInactifs} inactifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberTicker value={stats.totalProduits} />
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.produitsActifs} actifs · {stats.produitsInactifs} inactifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Factures</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberTicker value={stats.totalFactures} />
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.facturesMoisEnCours} ce mois-ci
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chiffre d'affaires</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.chiffreAffaires)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total cumulé
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques stock */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mouvements stock</CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <NumberTicker value={stats.totalMouvements} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entrées / Sorties</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-green-600">
                <ArrowUpCircle className="inline h-4 w-4" /> {stats.mouvementsEntree}
              </span>
              <span className="text-lg font-bold text-red-600">
                <ArrowDownCircle className="inline h-4 w-4" /> {stats.mouvementsSortie}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertes stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              <NumberTicker value={stats.alertesStock.length} />
            </div>
            <p className="text-xs text-muted-foreground">
              produit(s) sous le seuil
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertes stock */}
      {stats.alertesStock.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Produits en alerte de stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.alertesStock.map((p) => (
                <div key={p._id} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{p.nom}</span>
                  <span className="text-orange-700 font-semibold">
                    Stock: {p.quantiteStock} / Seuil: {p.seuilAlerte}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Listes récentes */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users2 className="h-5 w-5" />
              Clients récents
            </CardTitle>
            <CardDescription>Les 5 derniers clients ajoutés</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentClients.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun client</p>
            ) : (
              <div className="space-y-3">
                {stats.recentClients.map((client) => (
                  <div key={client._id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                        {client.nom?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{client.nom}</p>
                        <p className="text-xs text-muted-foreground">{client.telephone || 'Pas de téléphone'}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      client.actif !== false
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {client.actif !== false ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Produits récents
            </CardTitle>
            <CardDescription>Les 5 derniers produits ajoutés</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentProduits.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun produit</p>
            ) : (
              <div className="space-y-3">
                {stats.recentProduits.map((produit) => (
                  <div key={produit._id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{produit.nom}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(produit.prix)} / {produit.unite.nom}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      produit.actif !== false
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {produit.actif !== false ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Factures et mouvements récents */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Factures récentes
            </CardTitle>
            <CardDescription>Les 5 dernières factures</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentFactures.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune facture</p>
            ) : (
              <div className="space-y-3">
                {stats.recentFactures.map((facture) => (
                  <div key={facture._id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div>
                      <p className="text-sm font-medium">N° {facture.numero}</p>
                      <p className="text-xs text-muted-foreground">
                        {facture.client?.nom || 'Client inconnu'} · {new Date(facture.createdAt || '').toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-blue-700">
                      {formatCurrency(facture.total ?? 0)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="h-5 w-5" />
              Mouvements récents
            </CardTitle>
            <CardDescription>Les 5 derniers mouvements de stock</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentMouvements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucun mouvement</p>
            ) : (
              <div className="space-y-3">
                {stats.recentMouvements.map((m) => (
                  <div key={m._id} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="flex items-center gap-2">
                      {m.type === MovementType.ENTREE ? (
                        <ArrowUpCircle className="h-4 w-4 text-green-500" />
                      ) : m.type === MovementType.SORTIE ? (
                        <ArrowDownCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{m.produitId?.nom || 'Produit inconnu'}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.motif || m.type} · {new Date(m.createdAt || '').toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${
                      m.type === MovementType.ENTREE ? 'text-green-600' :
                      m.type === MovementType.SORTIE ? 'text-red-600' : 'text-blue-600'
                    }`}>
                      {m.type === MovementType.ENTREE ? '+' : m.type === MovementType.SORTIE ? '-' : ''}{m.quantite}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Statut des entités
            </CardTitle>
            <CardDescription>Clients et produits actifs / inactifs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Clients actifs</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.totalClients > 0 ? Math.round((stats.clientsActifs / stats.totalClients) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${stats.totalClients > 0 ? (stats.clientsActifs / stats.totalClients) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.clientsActifs} actifs sur {stats.totalClients}
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Produits actifs</span>
                  <span className="text-sm text-muted-foreground">
                    {stats.totalProduits > 0 ? Math.round((stats.produitsActifs / stats.totalProduits) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${stats.totalProduits > 0 ? (stats.produitsActifs / stats.totalProduits) * 100 : 0}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.produitsActifs} actifs sur {stats.totalProduits}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
