import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Link } from "@tanstack/react-router"
import { useSession } from "@/auth/auth-client"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string,
    roles?: string[],
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string,
      roles?: string[],
    }[]
  }[]
}) {
  const { data: sessionData } = useSession();
  return (
    <SidebarGroup>
      <SidebarGroupLabel>FacturePro</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            disabled={!item.roles || !item.roles.includes(sessionData?.user?.role!)}
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem className="space-y-1">
              <CollapsibleTrigger asChild>
                <SidebarMenuButton 
                  tooltip={item.title}
                  className="group/item hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground transition-colors"
                >
                  {item.icon && (
                    <div className="rounded-md bg-teal-100/50 p-2 text-teal-600 group-hover/item:bg-white/50 group-hover/item:text-teal-700 transition-colors">
                      <item.icon className="size-4" />
                    </div>
                  )}
                  <span className="font-medium">{item.title}</span>
                  <ChevronRight className="ml-auto size-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 px-3 py-2">
                <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <Link 
                          to={subItem.url}
                          className="w-full rounded-md px-2 py-1.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                        >
                          <span className="text-sm">{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
