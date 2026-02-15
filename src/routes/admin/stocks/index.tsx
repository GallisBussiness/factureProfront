import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Tag,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  Plus,
  Warehouse,
  Search,
  ArrowDownCircle,
  ArrowUpCircle,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StockService } from '@/services/stock.service'
import { ProductService } from '@/services/product.service'
import type { StockMovement, CreateStockMovementDto, MovementType } from '@/types/stock'
import type { Product } from '@/types/product'
import dayjs from 'dayjs'

export const Route = createFileRoute('/admin/stocks/')({
  component: StocksPage,
})

const TYPE_CONFIG: Record<MovementType, { color: string; label: string; icon: typeof ArrowDownCircle }> = {
  ENTREE: { color: 'green', label: 'Entrée', icon: ArrowDownCircle },
  SORTIE: { color: 'red', label: 'Sortie', icon: ArrowUpCircle },
  AJUSTEMENT: { color: 'blue', label: 'Ajustement', icon: RefreshCw },
}

function StocksPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [filterType, setFilterType] = useState<MovementType | undefined>()
  const [form] = Form.useForm()

  const { data: movements = [], isLoading } = useQuery({
    queryKey: ['stock-movements', filterType],
    queryFn: () => StockService.getAll(filterType ? { type: filterType } : undefined),
  })

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => ProductService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateStockMovementDto) => StockService.createMovement(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      message.success('Mouvement de stock enregistré')
      handleCloseModal()
    },
    onError: () => message.error('Erreur lors de l\'enregistrement du mouvement'),
  })

  const handleOpenModal = () => {
    form.resetFields()
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    form.resetFields()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      createMutation.mutate(values)
    } catch {
      // validation errors handled by antd
    }
  }

  const filteredMovements = searchText
    ? movements.filter(
        (m: StockMovement) =>
          m.produit?.nom?.toLowerCase().includes(searchText.toLowerCase()) ||
          m.motif?.toLowerCase().includes(searchText.toLowerCase())
      )
    : movements

  const columns: ColumnsType<StockMovement> = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (val) => val ? dayjs(val).format('DD/MM/YYYY HH:mm') : '-',
      sorter: (a, b) =>
        new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime(),
      defaultSortOrder: 'descend',
      width: 160,
    },
    {
      title: 'Produit',
      key: 'produit',
      render: (_, record) =>
        record.produit?.nom
          || (typeof record.produitId === 'object' ? (record.produitId as any)?.nom : record.produitId),
      sorter: (a, b) =>
        (a.produit?.nom || '').localeCompare(b.produit?.nom || ''),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (val: MovementType) => {
        const config = TYPE_CONFIG[val]
        if (!config) return <Tag>{val}</Tag>
        const Icon = config.icon
        return (
          <Tag color={config.color} className="flex items-center gap-1 w-fit">
            <Icon className="h-3 w-3" />
            {config.label}
          </Tag>
        )
      },
      filters: [
        { text: 'Entrée', value: 'ENTREE' },
        { text: 'Sortie', value: 'SORTIE' },
        { text: 'Ajustement', value: 'AJUSTEMENT' },
      ],
      onFilter: (value, record) => record.type === value,
      width: 150,
    },
    {
      title: 'Quantité',
      dataIndex: 'quantite',
      key: 'quantite',
      render: (val, record) => {
        const isPositive = record.type === 'ENTREE'
        const isNegative = record.type === 'SORTIE'
        return (
          <span
            className={`font-semibold ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-blue-600'}`}
          >
            {isPositive ? '+' : isNegative ? '-' : '±'}{val}
          </span>
        )
      },
      sorter: (a, b) => a.quantite - b.quantite,
      align: 'center',
      width: 120,
    },
    {
      title: 'Stock actuel',
      key: 'stockActuel',
      render: (_, record) => (
        <span className="font-medium">
          {record.produit?.quantiteStock ?? '-'}
        </span>
      ),
      align: 'center',
      width: 120,
    },
    {
      title: 'Motif',
      dataIndex: 'motif',
      key: 'motif',
      render: (val) => val || '-',
      ellipsis: true,
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Warehouse className="h-8 w-8" />
            Gestion des stocks
          </h1>
          <p className="text-muted-foreground">
            Mouvements d'entrée, sortie et ajustement de stock
          </p>
        </div>
        <Button onClick={handleOpenModal}>
          <Plus className="h-4 w-4" />
          Nouveau mouvement
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par produit ou motif..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </div>
        <Select
          placeholder="Filtrer par type"
          allowClear
          value={filterType}
          onChange={(val) => setFilterType(val)}
          className="w-48"
          options={[
            { value: 'ENTREE', label: 'Entrée' },
            { value: 'SORTIE', label: 'Sortie' },
            { value: 'AJUSTEMENT', label: 'Ajustement' },
          ]}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredMovements}
        rowKey="_id"
        loading={isLoading}
        pagination={{
          pageSize: 15,
          showSizeChanger: true,
          showTotal: (total) => `${total} mouvement(s)`,
        }}
        bordered
        size="middle"
        scroll={{ x: 900 }}
      />

      {/* Modal Création */}
      <Modal
        title="Nouveau mouvement de stock"
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        confirmLoading={createMutation.isPending}
        okText="Enregistrer"
        cancelText="Annuler"
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="produitId"
            label="Produit"
            rules={[{ required: true, message: 'Le produit est requis' }]}
          >
            <Select
              placeholder="Sélectionnez un produit"
              showSearch
              optionFilterProp="label"
              options={products.map((p: Product) => ({
                value: p._id,
                label: `${p.nom} (stock: ${p.quantiteStock ?? 0})`,
              }))}
            />
          </Form.Item>

          <div className="grid grid-cols-2 gap-x-4">
            <Form.Item
              name="type"
              label="Type de mouvement"
              rules={[{ required: true, message: 'Le type est requis' }]}
            >
              <Select
                placeholder="Type"
                options={[
                  { value: 'ENTREE', label: '↓ Entrée' },
                  { value: 'SORTIE', label: '↑ Sortie' },
                  { value: 'AJUSTEMENT', label: '↔ Ajustement' },
                ]}
              />
            </Form.Item>

            <Form.Item
              name="quantite"
              label="Quantité"
              rules={[
                { required: true, message: 'La quantité est requise' },
                { type: 'number', min: 1, message: 'Minimum 1' },
              ]}
            >
              <InputNumber min={1} className="w-full" placeholder="Quantité" />
            </Form.Item>
          </div>

          <Form.Item name="motif" label="Motif">
            <Input.TextArea
              placeholder="Raison du mouvement (ex: réapprovisionnement, vente, inventaire...)"
              rows={2}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
