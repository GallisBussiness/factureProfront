import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Table,
  message,
  Popconfirm,
  Spin,
} from 'antd'
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  Banknote,
  Printer,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { InvoiceService } from '@/services/invoice.service'
import type { InvoiceLine } from '@/types/invoice'
import { generateInvoicePdf } from '@/lib/generate-invoice-pdf'
import { useSession } from '@/auth/auth-client'
import dayjs from 'dayjs'

export const Route = createFileRoute('/admin/factures/$factureId')({
  component: FactureDetailPage,
})

function FactureDetailPage() {
  const { factureId } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'admin'

  const { data: invoice, isLoading, isError } = useQuery({
    queryKey: ['invoices', factureId],
    queryFn: () => InvoiceService.getOne(factureId),
  })

  const deleteMutation = useMutation({
    mutationFn: () => InvoiceService.delete(factureId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      message.success('Facture supprimée')
      navigate({ to: '/admin/factures' })
    },
    onError: () => message.error('Erreur lors de la suppression'),
  })

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(value)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Spin size="large" />
      </div>
    )
  }

  if (isError || !invoice) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="ghost" onClick={() => navigate({ to: '/admin/factures' })}>
          <ArrowLeft className="h-4 w-4" />
          Retour aux factures
        </Button>
        <div className="text-center py-20 text-destructive">
          Facture introuvable ou erreur de chargement.
        </div>
      </div>
    )
  }

  const lineColumns = [
    {
      title: 'Produit',
      key: 'produit',
      render: (_: unknown, line: InvoiceLine) =>
        line.produit?.nom
          || (typeof line.produitId === 'object' ? (line.produitId as any)?.nom : line.produitId),
    },
    {
      title: 'Qté',
      dataIndex: 'quantite',
      width: 80,
      align: 'center' as const,
    },
    {
      title: 'Prix unitaire',
      dataIndex: 'prixUnitaire',
      render: (val: number) => formatCurrency(val ?? 0),
      align: 'right' as const,
      width: 140,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      render: (val: number) => formatCurrency(val ?? 0),
      align: 'right' as const,
      width: 140,
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/admin/factures' })}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Facture {invoice.numero}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Créée le {dayjs(invoice.createdAt).format('DD/MM/YYYY')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => generateInvoicePdf(invoice)}>
            <Printer className="h-4 w-4" />
            Imprimer
          </Button>
          {isAdmin && (
            <Popconfirm
              title="Supprimer cette facture ?"
              description="Cette action est irréversible."
              onConfirm={() => deleteMutation.mutate()}
              okText="Oui"
              cancelText="Non"
            >
              <Button variant="destructive" disabled={deleteMutation.isPending}>
                Supprimer
              </Button>
            </Popconfirm>
          )}
        </div>
      </div>

      {/* Infos principales */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Client
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">{invoice.client?.nom || (typeof invoice.clientId === 'object' ? (invoice.clientId as any)?.nom : invoice.clientId)}</p>
            {invoice.client?.telephone && (
              <p className="text-sm text-muted-foreground">{invoice.client.telephone}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Dates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Émission</span>
                <span className="font-medium">{dayjs(invoice.dateEmission).format('DD/MM/YYYY')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Échéance</span>
                <span className="font-medium">
                  {dayjs(invoice.dateEcheance).format('DD/MM/YYYY')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              Montants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-sm font-bold border-t pt-1 mt-1">
                <span>Total</span>
                <span>{formatCurrency(invoice.total?? 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm">
              <span className="font-medium">Notes :</span> {invoice.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Lignes de facture */}
      <Card>
        <CardHeader>
          <CardTitle>Lignes de facture ({invoice.lignes?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            dataSource={invoice.lignes || []}
            rowKey={(_: InvoiceLine, index?: number) => String(index)}
            columns={lineColumns}
            pagination={false}
            size="small"
            bordered
            scroll={{ x: 500 }}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={2} className="text-right font-bold">
                    Total
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} className="text-right font-bold">
                    {formatCurrency(invoice.total ?? 0)}
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </CardContent>
      </Card>
    </div>
  )
}
