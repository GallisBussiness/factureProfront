import {
  Menu,
  Users2,
  Package,
  FileText,
  Warehouse,
  Ruler,
  UserCog,
  CreditCard,
  Calendar,
  Clock,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useSession } from "@/auth/auth-client"
import { Avatar } from "antd"
import { useQuery } from "@tanstack/react-query"
import { SubscriptionService } from "@/services/subscription.service"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Tableau de bord",
      roles: ['user','admin'],
      icon: Menu,
      isActive: true,
      items: [
        {
          title: "Tableau de bord",
          url: "/admin",
          roles: ['user','admin'],
        },
      ],
    },
     {
      title: "Factures",
      roles: ['user','admin'],
      icon: FileText,
      isActive: true,
      items: [
        {
          title: "Liste des factures",
          url: "/admin/factures",
          roles: ['user','admin'],
        },
      ],
    },
    {
      title: "Clients",
      roles: ['user','admin'],
      icon: Users2,
      isActive: true,
      items: [
        {
          title: "Liste des clients",
          url: "/admin/clients",
          roles: ['user','admin'],
        },
      ],
    },
    {
      title: "Produits",
      roles: ['user','admin'],
      icon: Package,
      isActive: true,
      items: [
        {
          title: "Liste des produits",
          url: "/admin/produits",
          roles: ['user','admin'],
        },
      ],
    },
    {
      title: "Unités",
      roles: ['user','admin'],
      icon: Ruler,
      isActive: true,
      items: [
        {
          title: "Liste des unités",
          url: "/admin/unites",
          roles: ['user','admin'],
        },
      ],
    },
    {
      title: "Stocks",
      roles: ['user','admin'],
      icon: Warehouse,
      isActive: true,
      items: [
        {
          title: "Mouvements de stock",
          url: "/admin/stocks",
          roles: ['user','admin'],
        },
      ],
    },
    {
      title: "Utilisateurs",
      roles: ['admin'],
      icon: UserCog,
      isActive: true,
      items: [
        {
          title: "Gestion des utilisateurs",
          url: "/admin/users",
          roles: ['admin'],
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: sessionData } = useSession();
  const userId = sessionData?.user?.id;

  const { data: activeSubscription } = useQuery({
    queryKey: ['active-subscription', 'admin'],
    queryFn: () => SubscriptionService.getActiveSubscription('admin'),
    enabled: !!userId,
  });

  // Adapter les données de session au format attendu par NavUser
  const user = sessionData?.user ? {
    name: sessionData.user.name,
    email: sessionData.user.email,
    avatar: sessionData.user.image || '',
  } : undefined;

  // Filtrer les éléments de navigation selon les rôles de l'utilisateur
  const userRoles = sessionData?.user?.role;
  const filteredNavMain = data.navMain
    .filter((item: any) => !item.roles || item.roles.some((role: string) => userRoles === role))
    .map((item: any) => ({
      ...item,
      items: item.items?.filter((subItem: any) => 
        !subItem.roles || subItem.roles.some((role: string) => userRoles === role)
      ),
    }));
  
  const DUREE_LABELS: Record<string, string> = {
    MONTHLY: 'Mensuel',
    QUARTERLY: 'Trimestriel',
    YEARLY: 'Annuel',
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <div className="flex items-center justify-center">
          <Avatar size={80} src="/logo.jpg" />
        </div>
        
        {activeSubscription && (
          <div className="mx-3 mt-4 mb-2 p-3 rounded-lg bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-100">
            <div className="flex items-center gap-2 mb-1.5">
              <CreditCard className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700">Abonnement Actif</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>{DUREE_LABELS[activeSubscription.planId?.duree] || 'Personnalisé'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Expire le {new Date(activeSubscription.dateFin).toLocaleDateString('fr-FR', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}</span>
              </div>
            </div>
          </div>
        )}
        
        <NavMain items={filteredNavMain} />
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
