import {
  Menu,
  Users2,
  Package,
  FileText,
  Warehouse,
  Ruler,
  UserCog,
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
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <div className="flex items-center justify-center">
          <Avatar size={80} src="/logo.jpg" />
        </div>
        <NavMain items={filteredNavMain} />
      </SidebarContent>
      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
