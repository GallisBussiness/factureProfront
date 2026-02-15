import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Table, Modal, Form, Input, InputNumber, Select, Switch, message, Popconfirm, Tag, Space, Badge } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Plus, Pencil, Trash2, Package, Search, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductService } from '@/services/product.service'
import { UniteService } from '@/services/unite.service'
import type { Product, CreateProductDto, UpdateProductDto } from '@/types/product'
import type { Unite } from '@/types/unite'
import { useSession } from '@/auth/auth-client'

export const Route = createFileRoute('/admin/produits/')({
  component: ProductsPage,
})

function ProductsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'admin'

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => ProductService.getAll(),
  })

  const { data: unites = [] } = useQuery({
    queryKey: ['unites'],
    queryFn: () => UniteService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateProductDto) => ProductService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      message.success('Produit créé avec succès')
      handleCloseModal()
    },
    onError: () => message.error('Erreur lors de la création du produit'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
      ProductService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      message.success('Produit mis à jour avec succès')
      handleCloseModal()
    },
    onError: () => message.error('Erreur lors de la mise à jour du produit'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ProductService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      message.success('Produit supprimé avec succès')
    },
    onError: () => message.error('Erreur lors de la suppression du produit'),
  })

  const handleOpenCreate = () => {
    setEditingProduct(null)
    form.resetFields()
    form.setFieldsValue({ actif: true, quantiteStock: 0, seuilAlerte: 0 })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product)
    form.setFieldsValue(product)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingProduct(null)
    form.resetFields()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingProduct) {
        updateMutation.mutate({ id: editingProduct._id, data: values })
      } else {
        createMutation.mutate(values)
      }
    } catch {
      // validation errors handled by antd
    }
  }

  const filteredProducts = searchText
    ? products.filter(
        (p) =>
          p.nom?.toLowerCase().includes(searchText.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchText.toLowerCase())
      )
    : products

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(value)

  const columns: ColumnsType<Product> = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      sorter: (a, b) => a.nom.localeCompare(b.nom),
    },
    {
      title: 'Prix',
      dataIndex: 'prix',
      key: 'prix',
      render: (val) => formatCurrency(val),
      sorter: (a, b) => a.prix - b.prix,
      align: 'right',
    },
    {
      title: 'Unité',
      dataIndex: ['unite', 'nom'],
      key: 'unite',
      width: 100,
    },
    {
      title: 'Stock',
      dataIndex: 'quantiteStock',
      key: 'quantiteStock',
      render: (val, record) => {
        const isLow = record.seuilAlerte != null && val != null && val <= record.seuilAlerte
        return val != null ? (
          <Badge
            count={isLow ? <AlertTriangle className="h-3 w-3 text-orange-500" /> : 0}
            offset={[8, 0]}
          >
            <span className={isLow ? 'text-orange-600 font-semibold' : ''}>
              {val}
            </span>
          </Badge>
        ) : (
          '-'
        )
      },
      sorter: (a, b) => (a.quantiteStock ?? 0) - (b.quantiteStock ?? 0),
      align: 'center',
    },
    {
      title: 'Statut',
      dataIndex: 'actif',
      key: 'actif',
      render: (val) =>
        val !== false ? (
          <Tag color="green">Actif</Tag>
        ) : (
          <Tag color="red">Inactif</Tag>
        ),
      filters: [
        { text: 'Actif', value: true },
        { text: 'Inactif', value: false },
      ],
      onFilter: (value, record) => (record.actif !== false) === value,
      width: 90,
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
            onClick={() => handleOpenEdit(record)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          {isAdmin && (
            <Popconfirm
              title="Supprimer ce produit ?"
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
            <Package className="h-8 w-8" />
            Produits
          </h1>
          <p className="text-muted-foreground">
            Gestion du catalogue de produits
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" />
          Nouveau produit
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un produit..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredProducts}
        rowKey="_id"
        loading={isLoading}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `${total} produit(s)` }}
        bordered
        size="middle"
        scroll={{ x: 900 }}
      />

      <Modal
        title={editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText={editingProduct ? 'Modifier' : 'Créer'}
        cancelText="Annuler"
        destroyOnClose
        width={600}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="nom"
            label="Nom"
            rules={[{ required: true, message: 'Le nom est requis' }]}
          >
            <Input placeholder="Nom du produit" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="Description du produit" rows={2} />
          </Form.Item>

          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item
              name="prix"
              label="Prix"
              rules={[
                { required: true, message: 'Le prix est requis' },
                { type: 'number', min: 0, message: 'Le prix doit être positif' },
              ]}
            >
              <InputNumber
                placeholder="0"
                className="w-full"
                addonAfter="FCFA"
                min={0}
              />
            </Form.Item>

            <Form.Item
              name="unite"
              label="Unité"
              rules={[{ required: true, message: "L'unité est requise" }]}
            >
              <Select
                placeholder="Sélectionnez une unité"
                showSearch
                optionFilterProp="label"
                options={unites.map((u: Unite) => ({
                  value: u._id,
                  label: u.nom,
                }))}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item name="quantiteStock" label="Quantité en stock">
              <InputNumber placeholder="0" className="w-full" min={0} />
            </Form.Item>

            <Form.Item name="seuilAlerte" label="Seuil d'alerte">
              <InputNumber placeholder="0" className="w-full" min={0} />
            </Form.Item>
          </div>

          <Form.Item name="actif" label="Actif" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
