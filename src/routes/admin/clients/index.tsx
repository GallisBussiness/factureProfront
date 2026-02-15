import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Table, Modal, Form, Input, Switch, message, Popconfirm, Tag, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Plus, Pencil, Trash2, Users2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ClientService } from '@/services/client.service'
import type { Client, CreateClientDto, UpdateClientDto } from '@/types/client'
import { useSession } from '@/auth/auth-client'

export const Route = createFileRoute('/admin/clients/')({
  component: ClientsPage,
})

function ClientsPage() {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [searchText, setSearchText] = useState('')
  const [form] = Form.useForm()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'admin'

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: () => ClientService.getAll(),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateClientDto) => ClientService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      message.success('Client créé avec succès')
      handleCloseModal()
    },
    onError: () => message.error('Erreur lors de la création du client'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientDto }) =>
      ClientService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      message.success('Client mis à jour avec succès')
      handleCloseModal()
    },
    onError: () => message.error('Erreur lors de la mise à jour du client'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ClientService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      message.success('Client supprimé avec succès')
    },
    onError: () => message.error('Erreur lors de la suppression du client'),
  })

  const handleOpenCreate = () => {
    setEditingClient(null)
    form.resetFields()
    form.setFieldsValue({ actif: true })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (client: Client) => {
    setEditingClient(client)
    form.setFieldsValue(client)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingClient(null)
    form.resetFields()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (editingClient) {
        updateMutation.mutate({ id: editingClient._id, data: values })
      } else {
        createMutation.mutate(values)
      }
    } catch {
      // validation errors handled by antd
    }
  }

  const filteredClients = clients.filter(
    (c) =>
      c.nom?.toLowerCase().includes(searchText.toLowerCase()) ||
      c.telephone?.toLowerCase().includes(searchText.toLowerCase())
  )

  const columns: ColumnsType<Client> = [
    {
      title: 'Nom',
      dataIndex: 'nom',
      key: 'nom',
      sorter: (a, b) => a.nom.localeCompare(b.nom),
    },
    {
      title: 'Téléphone',
      dataIndex: 'telephone',
      key: 'telephone',
      render: (val) => val || '-',
    },
    {
      title: 'Adresse',
      dataIndex: 'adresse',
      key: 'adresse',
      render: (val) => val || '-',
      responsive: ['lg'],
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
              title="Supprimer ce client ?"
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
            <Users2 className="h-8 w-8" />
            Clients
          </h1>
          <p className="text-muted-foreground">
            Gestion des clients de l'entreprise
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" />
          Nouveau client
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un client..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredClients}
        rowKey="_id"
        loading={isLoading}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `${total} client(s)` }}
        bordered
        size="middle"
      />

      <Modal
        title={editingClient ? 'Modifier le client' : 'Nouveau client'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={handleCloseModal}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        okText={editingClient ? 'Modifier' : 'Créer'}
        cancelText="Annuler"
        destroyOnClose
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="nom"
            label="Nom"
            rules={[{ required: true, message: 'Le nom est requis' }]}
          >
            <Input placeholder="Nom du client" />
          </Form.Item>


          <Form.Item name="telephone" label="Téléphone">
            <Input placeholder="Numéro de téléphone" />
          </Form.Item>

          <Form.Item name="adresse" label="Adresse">
            <Input.TextArea placeholder="Adresse complète" rows={2} />
          </Form.Item>

          <Form.Item name="actif" label="Actif" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
