import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import {
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  message,
  Popconfirm,
  Divider,
  Space,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  Plus,
  Trash2,
  FileText,
  Search,
  Eye,
  MinusCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InvoiceService } from '@/services/invoice.service'
import { ClientService } from '@/services/client.service'
import { ProductService } from '@/services/product.service'
import type { Invoice, CreateInvoiceDto } from '@/types/invoice'
import type { Client } from '@/types/client'
import type { Product } from '@/types/product'
import { useSession } from '@/auth/auth-client'
import dayjs from 'dayjs'

export const Route = createFileRoute('/admin/factures/')({
  component: FacturesPage,
})

function FacturesPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'admin'
  const lignesWatch = Form.useWatch('lignes', form) || []
  const totalLignes = useMemo(() => {
    return lignesWatch.reduce((sum: number, l: any) => {
      const prix = Number(l?.prixUnitaire) || 0
      const qte = Number(l?.quantite) || 0
      return sum + prix * qte
    }, 0)
  }, [lignesWatch])

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => InvoiceService.getAll(),
  })

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => ClientService.getAll(),
  })

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => ProductService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateInvoiceDto) => InvoiceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      message.success('Facture créée avec succès')
      handleCloseCreateModal()
    },
    onError: () => message.error('Erreur lors de la création de la facture'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => InvoiceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      message.success('Facture supprimée')
    },
    onError: () => message.error('Erreur lors de la suppression'),
  })

  const handleOpenCreate = () => {
    form.resetFields()
    form.setFieldsValue({
      dateEmission: dayjs(),
      dateEcheance: dayjs().add(30, 'day'),
      lignes: [{}],
    })
    setIsCreateModalOpen(true)
  }

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false)
    form.resetFields()
  }

  const handleSubmitCreate = async () => {
    try {
      const values = await form.validateFields()
      const dto: CreateInvoiceDto = {
        clientId: values.clientId,
        dateEmission: values.dateEmission.format('YYYY-MM-DD'),
        dateEcheance: values.dateEcheance.format('YYYY-MM-DD'),
        notes: values.notes,
        lignes: values.lignes.map((l: any) => ({
          produitId: l.produitId,
          prixUnitaire: l.prixUnitaire,
          quantite: l.quantite,
        })),
      }
      createMutation.mutate(dto)
    } catch {
      // validation errors handled by antd
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(value)

  const filteredInvoices = searchText
    ? invoices.filter(
        (inv: Invoice) =>
          inv.numero?.toLowerCase().includes(searchText.toLowerCase()) ||
          inv.client?.nom?.toLowerCase().includes(searchText.toLowerCase())
      )
    : invoices

  const columns: ColumnsType<Invoice> = [
    {
      title: 'N° Facture',
      dataIndex: 'numero',
      key: 'numero',
      sorter: (a, b) => (a.numero || '').localeCompare(b.numero || ''),
      width: 140,
    },
    {
      title: 'Client',
      key: 'client',
      render: (_, record) => record.client?.nom || (typeof record.clientId === 'object' ? (record.clientId as any)?.nom : record.clientId),
      sorter: (a, b) => (a.client?.nom || '').localeCompare(b.client?.nom || ''),
    },
    {
      title: 'Date émission',
      dataIndex: 'dateEmission',
      key: 'dateEmission',
      render: (val) => val ? dayjs(val).format('DD/MM/YYYY') : '-',
      sorter: (a, b) => new Date(a.dateEmission).getTime() - new Date(b.dateEmission).getTime(),
      width: 130,
    },
    {
      title: 'Échéance',
      dataIndex: 'dateEcheance',
      key: 'dateEcheance',
      render: (val) => val ? dayjs(val).format('DD/MM/YYYY') : '-',
      width: 130,
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (val) => formatCurrency(val ?? 0),
      sorter: (a, b) => (a.total ?? 0) - (b.total ?? 0),
      align: 'right',
      width: 140,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => navigate({ to: `/admin/factures/${record._id}` })}
            title="Détails"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {isAdmin && (
            <Popconfirm
              title="Supprimer cette facture ?"
              description="Cette action est irréversible."
              onConfirm={() => deleteMutation.mutate(record._id)}
              okText="Oui"
              cancelText="Non"
            >
              <Button variant="ghost" size="icon-sm">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Factures
          </h1>
          <p className="text-muted-foreground">
            Gestion des factures commerciales
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" />
          Nouvelle facture
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une facture..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredInvoices}
        rowKey="_id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `${total} facture(s)`,
        }}
        bordered
        size="middle"
        scroll={{ x: 900 }}
      />

      {/* Modal Création */}
      <Modal
        title="Nouvelle facture"
        open={isCreateModalOpen}
        onOk={handleSubmitCreate}
        onCancel={handleCloseCreateModal}
        confirmLoading={createMutation.isPending}
        okText="Créer"
        cancelText="Annuler"
        width={700}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item
              name="clientId"
              label="Client"
              rules={[{ required: true, message: 'Le client est requis' }]}
            >
              <Select
                placeholder="Sélectionnez un client"
                showSearch
                optionFilterProp="label"
                options={clients.map((c: Client) => ({
                  value: c._id,
                  label: c.nom,
                }))}
              />
            </Form.Item>

            <div className="grid grid-cols-2 gap-x-4">
              <Form.Item
                name="dateEmission"
                label="Date émission"
                rules={[{ required: true, message: 'Requis' }]}
              >
                <DatePicker className="w-full" format="DD/MM/YYYY" />
              </Form.Item>

              <Form.Item
                name="dateEcheance"
                label="Date échéance"
                rules={[{ required: true, message: 'Requis' }]}
              >
                <DatePicker className="w-full" format="DD/MM/YYYY" />
              </Form.Item>
            </div>
          </div>

          <Divider plain>
            Lignes de facture
          </Divider>

          <Form.List name="lignes" rules={[{
            validator: async (_, lignes) => {
              if (!lignes || lignes.length < 1) {
                return Promise.reject(new Error('Au moins une ligne est requise'))
              }
            },
          }]}>
            {(fields, { add, remove }) => (
              <div className="space-y-3">
                {fields.map(({ key, name, ...restField }) => {
                  const lignes = form.getFieldValue('lignes') || []
                  const usedProductIds = lignes
                    .map((l: any, i: number) => i !== name ? l?.produitId : null)
                    .filter(Boolean)

                  return (
                  <div
                    key={key}
                    className="grid grid-cols-12 gap-2 items-start bg-slate-50 p-3 rounded-lg"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, 'produitId']}
                      className="col-span-5 mb-0"
                      rules={[{ required: true, message: 'Requis' }]}
                    >
                      <Select
                        placeholder="Produit"
                        showSearch
                        optionFilterProp="label"
                        options={products
                          .filter((p: Product) => !usedProductIds.includes(p._id))
                          .map((p: Product) => ({
                            value: p._id,
                            label: `${p.nom} (${formatCurrency(p.prix)} / ${p.unite?.nom})`,
                          }))}
                        onChange={(productId: string) => {
                          const product = products.find((p: Product) => p._id === productId)
                          if (!product) return

                          const currentLignes = form.getFieldValue('lignes') || []
                          const existingIdx = currentLignes.findIndex(
                            (l: any, i: number) => i !== name && l?.produitId === productId
                          )

                          if (existingIdx !== -1) {
                            currentLignes[existingIdx].quantite = (currentLignes[existingIdx].quantite || 1) + (currentLignes[name]?.quantite || 1)
                            currentLignes[name] = {}
                            form.setFieldsValue({ lignes: currentLignes })
                            remove(name)
                            message.info('Produit déjà présent — quantité augmentée sur la ligne existante')
                          } else {
                            currentLignes[name].prixUnitaire = product.prix * (product.unite?.nombre ?? 1)
                            form.setFieldsValue({ lignes: currentLignes })
                          }
                        }}
                      />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'prixUnitaire']}
                      className="col-span-3 mb-0"
                      rules={[{ required: true, message: 'Requis' }]}
                    >
                      <InputNumber placeholder="Prix unitaire" min={0} className="w-full" addonAfter="F" />
                    </Form.Item>

                    <Form.Item
                      {...restField}
                      name={[name, 'quantite']}
                      className="col-span-2 mb-0"
                      rules={[{ required: true, message: 'Requis' }]}
                    >
                      <InputNumber placeholder="Quantité" min={1} className="w-full" />
                    </Form.Item>

                    <div className="col-span-2 flex items-center justify-center pt-1">
                      {fields.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => remove(name)}
                        >
                          <MinusCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                )})}

                <Button
                  variant="outline"
                  onClick={() => add()}
                  className="w-full"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter une ligne
                </Button>
              </div>
            )}
          </Form.List>

          <div className="flex justify-end items-center gap-2 mt-2 px-3 py-2 bg-blue-50 rounded-lg">
            <span className="text-sm font-medium text-muted-foreground">Total :</span>
            <span className="text-lg font-bold text-blue-700">{formatCurrency(totalLignes)}</span>
          </div>

          <Form.Item name="notes" label="Notes" className="mt-4">
            <Input.TextArea placeholder="Notes ou conditions particulières" rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
