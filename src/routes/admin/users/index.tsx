import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  Table,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  message,
  Popconfirm,
  Space,
  Avatar,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  Plus,
  Trash2,
  Search,
  ShieldCheck,
  UserCog,
  Ban,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserService } from '@/services/user.service'
import type { UserData, CreateUserData } from '@/services/user.service'
import dayjs from 'dayjs'

export const Route = createFileRoute('/admin/users/')({
  component: UsersPage,
})

function UsersPage() {
  const queryClient = useQueryClient()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [searchText, setSearchText] = useState('')
  const [createForm] = Form.useForm()
  const [roleForm] = Form.useForm()

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => UserService.listUsers({ limit: 100 }),
  })

  const users = usersData?.users ?? []

  const createMutation = useMutation({
    mutationFn: (data: CreateUserData) => UserService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      message.success('Utilisateur créé avec succès')
      setIsCreateModalOpen(false)
      createForm.resetFields()
    },
    onError: (err: any) => message.error(err?.message || "Erreur lors de la création"),
  })

  const setRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      UserService.setRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      message.success('Rôle modifié avec succès')
      setIsRoleModalOpen(false)
      setSelectedUser(null)
    },
    onError: () => message.error('Erreur lors de la modification du rôle'),
  })

  const banMutation = useMutation({
    mutationFn: (userId: string) => UserService.banUser(userId, 'Banni par admin'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      message.success('Utilisateur banni')
    },
    onError: () => message.error('Erreur lors du bannissement'),
  })

  const unbanMutation = useMutation({
    mutationFn: (userId: string) => UserService.unbanUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      message.success('Utilisateur débanni')
    },
    onError: () => message.error('Erreur lors du débannissement'),
  })

  const removeMutation = useMutation({
    mutationFn: (userId: string) => UserService.removeUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      message.success('Utilisateur supprimé')
    },
    onError: () => message.error('Erreur lors de la suppression'),
  })

  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields()
      createMutation.mutate(values)
    } catch {
      // validation errors handled by antd
    }
  }

  const handleRoleSubmit = async () => {
    try {
      const values = await roleForm.validateFields()
      if (selectedUser) {
        setRoleMutation.mutate({ userId: selectedUser.id, role: values.role })
      }
    } catch {
      // validation errors handled by antd
    }
  }

  const handleOpenRoleModal = (user: UserData) => {
    setSelectedUser(user)
    roleForm.setFieldsValue({ role: user.role || 'user' })
    setIsRoleModalOpen(true)
  }

  const filteredUsers = searchText
    ? users.filter(
        (u: UserData) =>
          u.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          u.email?.toLowerCase().includes(searchText.toLowerCase())
      )
    : users

  const columns: ColumnsType<UserData> = [
    {
      title: 'Utilisateur',
      key: 'user',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar src={record.image} size={36}>
            {record.name?.[0]?.toUpperCase() || '?'}
          </Avatar>
          <div>
            <p className="text-sm font-medium leading-none">{record.name}</p>
            <p className="text-xs text-muted-foreground">{record.email}</p>
          </div>
        </div>
      ),
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
    },
    {
      title: 'Rôle',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'blue' : 'default'}>
          {role === 'admin' ? 'Admin' : 'Utilisateur'}
        </Tag>
      ),
      filters: [
        { text: 'Admin', value: 'admin' },
        { text: 'Utilisateur', value: 'user' },
      ],
      onFilter: (value, record) => (record.role || 'user') === value,
    },
    {
      title: 'Statut',
      key: 'status',
      width: 120,
      render: (_, record) => (
        record.banned ? (
          <Tag color="red">Banni</Tag>
        ) : record.emailVerified ? (
          <Tag color="green">Vérifié</Tag>
        ) : (
          <Tag color="orange">Non vérifié</Tag>
        )
      ),
    },
    {
      title: 'Créé le',
      key: 'createdAt',
      width: 130,
      render: (_, record) => dayjs(record.createdAt).format('DD/MM/YYYY'),
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => handleOpenRoleModal(record)}
            title="Changer le rôle"
          >
            <ShieldCheck className="h-4 w-4" />
          </Button>

          {record.banned ? (
            <Popconfirm
              title="Débannir cet utilisateur ?"
              onConfirm={() => unbanMutation.mutate(record.id)}
              okText="Oui"
              cancelText="Non"
            >
              <Button variant="ghost" size="icon-sm" title="Débannir">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Bannir cet utilisateur ?"
              description="L'utilisateur ne pourra plus se connecter."
              onConfirm={() => banMutation.mutate(record.id)}
              okText="Oui"
              cancelText="Non"
            >
              <Button variant="ghost" size="icon-sm" title="Bannir">
                <Ban className="h-4 w-4 text-orange-500" />
              </Button>
            </Popconfirm>
          )}

          <Popconfirm
            title="Supprimer cet utilisateur ?"
            description="Cette action est irréversible."
            onConfirm={() => removeMutation.mutate(record.id)}
            okText="Oui"
            cancelText="Non"
          >
            <Button variant="ghost" size="icon-sm">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <UserCog className="h-8 w-8" />
            Utilisateurs
          </h1>
          <p className="text-muted-foreground">
            Gestion des comptes utilisateurs
          </p>
        </div>
        <Button onClick={() => { createForm.resetFields(); setIsCreateModalOpen(true) }}>
          <Plus className="h-4 w-4" />
          Nouvel utilisateur
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom ou email..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredUsers}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `${total} utilisateur(s)`,
        }}
        bordered
        size="middle"
      />

      {/* Modal création */}
      <Modal
        title="Nouvel utilisateur"
        open={isCreateModalOpen}
        onOk={handleCreateSubmit}
        onCancel={() => { setIsCreateModalOpen(false); createForm.resetFields() }}
        confirmLoading={createMutation.isPending}
        okText="Créer"
        cancelText="Annuler"
        destroyOnClose
        width={500}
      >
        <Form form={createForm} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Nom complet"
            rules={[{ required: true, message: 'Le nom est requis' }]}
          >
            <Input placeholder="Nom complet" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "L'email est requis" },
              { type: 'email', message: "L'email n'est pas valide" },
            ]}
          >
            <Input placeholder="email@exemple.com" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mot de passe"
            rules={[
              { required: true, message: 'Le mot de passe est requis' },
              { min: 6, message: '6 caractères minimum' },
            ]}
          >
            <Input.Password placeholder="Mot de passe" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Rôle"
            initialValue="user"
          >
            <Select
              options={[
                { value: 'user', label: 'Utilisateur' },
                { value: 'admin', label: 'Administrateur' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal changement de rôle */}
      <Modal
        title={`Modifier le rôle de ${selectedUser?.name || ''}`}
        open={isRoleModalOpen}
        onOk={handleRoleSubmit}
        onCancel={() => { setIsRoleModalOpen(false); setSelectedUser(null) }}
        confirmLoading={setRoleMutation.isPending}
        okText="Modifier"
        cancelText="Annuler"
        destroyOnClose
        width={400}
      >
        <Form form={roleForm} layout="vertical" className="mt-4">
          <Form.Item
            name="role"
            label="Rôle"
            rules={[{ required: true, message: 'Le rôle est requis' }]}
          >
            <Select
              options={[
                { value: 'user', label: 'Utilisateur' },
                { value: 'admin', label: 'Administrateur' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
