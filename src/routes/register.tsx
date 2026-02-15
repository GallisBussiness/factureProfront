import { authClient } from '@/auth/auth-client';
import { createFileRoute, redirect, useNavigate, Link } from '@tanstack/react-router'
import { Form, Input, Button, Typography, message } from 'antd';
import { useState } from 'react';
import { FileText, CheckCircle, Package, Receipt, Shield } from 'lucide-react';

const { Title, Text } = Typography;

interface RegisterFormValues {
  name: string;
  email: string;
  department: string;
  password: string;
  confirmPassword: string;
}

export const Route = createFileRoute('/register')({
  beforeLoad: async () => {
    const session = await authClient.getSession()
    if (session.data?.user) {
      throw redirect({ to: '/admin' })
    }
  },
  component: RegisterPage,
})

function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<RegisterFormValues>();
  const navigate = useNavigate();

  const onFinish = async (values: RegisterFormValues) => {
    if (values.password !== values.confirmPassword) {
      message.error('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      const result = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (result.error) {
        message.error(result.error.message || 'Erreur lors de l\'inscription');
        return;
      }

      message.success('Demande envoyée ! Un administrateur validera votre accès.');
      navigate({ to: '/' });
    } catch (error) {
      console.error('Register error:', error);
      message.error('Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: Receipt, text: 'Créez et gérez vos factures' },
    { icon: Package, text: 'Catalogue produits et stocks' },
    { icon: FileText, text: 'Suivi des devis et paiements' },
    { icon: Shield, text: 'Données sécurisées et confidentielles' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding RH */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-teal-600 via-emerald-600 to-green-700 relative overflow-hidden">
        {/* Pattern de fond */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-register" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-register)" />
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
              Créez votre compte
            </h1>
            <p className="text-lg text-emerald-100 max-w-md">
              Demandez un accès à la plateforme de facturation en quelques clics.
            </p>
          </div>
          
          {/* Benefits */}
          <div className="space-y-4 mt-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <benefit.icon className="w-5 h-5 text-emerald-200" />
                </div>
                <span className="text-emerald-100">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* Trust badge */}
          <div className="mt-12 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-300" />
              <div>
                <p className="font-semibold text-sm">Validation par l'administrateur</p>
                <p className="text-xs text-emerald-200">Votre demande sera examinée sous 24h</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
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
                Demande d'accès
              </Title>
              <Text type="secondary">
                Remplissez le formulaire pour accéder à la plateforme
              </Text>
            </div>

            <Form
              form={form}
              name="register"
              onFinish={onFinish}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="name"
                label={<span className="font-medium text-slate-700">Nom complet</span>}
                rules={[
                  { required: true, message: 'Veuillez saisir votre nom' },
                  { min: 2, message: 'Le nom doit contenir au moins 2 caractères' }
                ]}
              >
                <Input 
                  placeholder="Prénom Nom" 
                  style={{ borderRadius: 8, height: 44 }}
                />
              </Form.Item>

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
                label={<span className="font-medium text-slate-700">Mot de passe</span>}
                rules={[
                  { required: true, message: 'Veuillez saisir un mot de passe' },
                  { min: 8, message: 'Le mot de passe doit contenir au moins 8 caractères' }
                ]}
              >
                <Input.Password 
                  placeholder="Minimum 8 caractères" 
                  style={{ borderRadius: 8, height: 44 }}
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label={<span className="font-medium text-slate-700">Confirmer le mot de passe</span>}
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Veuillez confirmer votre mot de passe' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
                    },
                  }),
                ]}
              >
                <Input.Password 
                  placeholder="Confirmez votre mot de passe" 
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
                  Envoyer ma demande
                </Button>
              </Form.Item>
            </Form>

            <div className="text-center mt-6">
              <Text type="secondary" style={{ fontSize: 14 }}>
                Vous avez déjà un compte ?{' '}
                <Link to="/" className="text-teal-600 hover:text-teal-700 font-medium">
                  Se connecter
                </Link>
              </Text>
            </div>
          </div>

          <p className="text-center text-slate-400 text-xs mt-6">
            © {new Date().getFullYear()} FacturePro. Solution de facturation commerciale.
          </p>
        </div>
      </div>
    </div>
  )
}
