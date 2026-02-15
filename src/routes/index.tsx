import { authClient } from '@/auth/auth-client';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Form, Input, Button, Typography, message } from 'antd';
import { useState } from 'react';
import { Users, FileText, BarChart3, Shield, Clock, Package, Receipt } from 'lucide-react';

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const session = await authClient.getSession()
    if (session.data?.user) {
      throw redirect({ to: '/admin' })
    }
  },
  component: App,
})

function App() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<LoginFormValues>();
  const navigate = useNavigate();

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const result = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      if (result.error) {
        message.error(result.error.message || 'Identifiants incorrects');
        return;
      }

      message.success('Connexion réussie');
      navigate({ to: '/admin' });
    } catch (error) {
      console.error('Login error:', error);
      message.error('Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Users, title: 'Gestion des clients', desc: 'Centralisez toutes les informations clients' },
    { icon: Package, title: 'Catalogue produits', desc: 'Gérez vos produits et stocks' },
    { icon: Receipt, title: 'Facturation', desc: 'Créez et suivez vos factures' },
    { icon: BarChart3, title: 'Tableaux de bord', desc: 'Indicateurs commerciaux en temps réel' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding RH */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-700 relative overflow-hidden">
        {/* Pattern de fond */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="relative z-10 flex flex-col justify-center w-full p-12 text-white">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <FileText className="w-8 h-8" />
              </div>
              <span className="text-2xl font-bold">FacturePro</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Facturation Commerciale
            </h1>
            <p className="text-lg text-emerald-100 max-w-md">
              Simplifiez la gestion de vos factures, clients et produits avec notre solution complète et intuitive.
            </p>
          </div>
          
          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            {features.map((feature, index) => (
              <div key={index} className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <feature.icon className="w-6 h-6 mb-2 text-emerald-200" />
                <h3 className="font-semibold text-sm">{feature.title}</h3>
                <p className="text-xs text-emerald-200 mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">FacturePro</span>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-200">
            <div className="text-center mb-6">
              <Title level={3} style={{ marginBottom: 8, color: '#1e293b' }}>
                Connexion
              </Title>
              <Text type="secondary">
                Accédez à votre espace de facturation
              </Text>
            </div>

            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="email"
                label={<span className="font-medium text-slate-700">Email professionnel</span>}
                rules={[
                  { required: true, message: 'Veuillez saisir votre email' },
                  { type: 'email', message: 'Email invalide' }
                ]}
              >
                <Input
                  placeholder="nom@entreprise.com"
                  style={{ borderRadius: 8, height: 44 }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={
                  <div className="flex justify-between w-full">
                    <span className="font-medium text-slate-700">Mot de passe</span>
                  </div>
                }
                rules={[{ required: true, message: 'Veuillez saisir votre mot de passe' }]}
              >
                <Input.Password
                  placeholder="••••••••"
                  style={{ borderRadius: 8, height: 44 }}
                />
              </Form.Item>

              <Form.Item style={{ marginTop: 24 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  style={{ 
                    height: 48, 
                    borderRadius: 8, 
                    fontSize: 15, 
                    fontWeight: 600,
                    backgroundColor: '#0d9488',
                    borderColor: '#0d9488'
                  }}
                >
                  Se connecter
                </Button>
              </Form.Item>
            </Form>

            {/* Security badges */}
            <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-1 text-slate-400 text-xs">
                <Shield className="w-3 h-3" />
                <span>SSL sécurisé</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-xs">
                <Clock className="w-3 h-3" />
                <span>Session 8h</span>
              </div>
            </div>

            {/* <div className="text-center mt-6">
              <Text type="secondary" style={{ fontSize: 14 }}>
                Pas encore de compte ?{' '}
                <RouterLink to="/register" className="text-teal-600 hover:text-teal-700 font-medium">
                  Demander un accès
                </RouterLink>
              </Text>
            </div> */}
          </div>

          <p className="text-center text-slate-400 text-xs mt-6">
            © {new Date().getFullYear()} FacturePro. Solution de facturation commerciale.
          </p>
        </div>
      </div>
    </div>
  )
}
