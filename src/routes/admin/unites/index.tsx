import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Table, Modal, Form, Input, InputNumber, message, Popconfirm, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Plus, Pencil, Trash2, Ruler, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UniteService } from '@/services/unite.service'
import type { Unite, CreateUniteDto, UpdateUniteDto } from '@/types/unite'
import { useSession } from '@/auth/auth-client'

export const Route = createFileRoute('/admin/unites/')({
  component: UnitesPage,
})

function UnitesPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUnite, setEditingUnite] = useState<Unite | null>(null)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'admin'

  const { data: unites = [], isLoading } = useQuery({
    queryKey: ['unites'],
    queryFn: () => UniteService.getAll(),
  })

  console.log(unites)

  const createMutation = useMutation({
    mutationFn: (data: CreateUniteDto) => UniteService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unites'] })
      message.success('Unité créée avec succès')
      handleCloseModal()
    },
    onError: () => message.error("Erreur lors de la création de l'unité"),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUniteDto }) =>
      UniteService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unites'] })
      message.success('Unité modifiée avec succès')
      handleCloseModal()
    },
    onError: () => message.error("Erreur lors de la modification de l'unité"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => UniteService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unites'] })
      message.success('Unité supprimée avec succès')
    },
    onError: () => message.error("Erreur lors de la suppression de l'unité"),
  })

  const handleOpenCreate = () => {
    setEditingUnite(null)
    form.resetFields()
    form.setFieldsValue({ nombre: 1 })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (unite: Unite) => {
    setEditingUnite(unite)
    form.setFieldsValue(unite)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingUnite(null)
    form.resetFields()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingUnite) {
        updateMutation.mutate({ id: editingUnite._id, data: values })
      } else {
        createMutation.mutate(values)
      }
    } catch {
      // validation errors handled by antd
    }
  }

  const filteredUnites = searchText
    ? unites.filter(
        (u: Unite) =>
          u.nom?.toLowerCase().includes(searchText.toLowerCase()) ||
          u.description?.toLowerCase().includes(searchText.toLowerCase())
      )
    : unites

  const columns: ColumnsType<Unite> = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      sorter: (a, b) => a.nom.localeCompare(b.nom),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (val) => val || '-',
      responsive: ['md'],
    },
    {
      title: 'Nombre',
      dataIndex: 'nombre',
      key: 'nombre',
      sorter: (a, b) => a.nombre - b.nombre,
      align: 'center',
      width: 120,
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
              title="Supprimer cette unité ?"
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
            <Ruler className="h-8 w-8" />
            Unités
          </h1>
          <p className="text-muted-foreground">
            Gestion des unités de mesure
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" />
          Nouvelle unité
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une unité..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredUnites}
        rowKey="_id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `${total} unité(s)`,
        }}
        bordered
        size="middle"
      />

      <Modal
        title={editingUnite ? "Modifier l'unité" : 'Nouvelle unité'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText={editingUnite ? 'Modifier' : 'Créer'}
        cancelText="Annuler"
        destroyOnClose
        width={500}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="nom"
            label="Nom"
            rules={[{ required: true, message: "Le nom est requis" }]}
          >
            <Input placeholder="kg, pièce, litre..." />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea placeholder="Description de l'unité" rows={2} />
          </Form.Item>

          <Form.Item
            name="nombre"
            label="Nombre"
            rules={[
              { required: true, message: 'Le nombre est requis' },
              { type: 'number', min: 0, message: 'Le nombre doit être positif' },
            ]}
          >
            <InputNumber placeholder="1" className="w-full" min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
