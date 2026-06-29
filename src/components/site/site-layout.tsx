import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { ServiceSelectionDrawer } from "../services/service-selection-drawer";
import { AdminFloatingAction } from "../admin/admin-floating-action";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <ServiceSelectionDrawer />
      <AdminFloatingAction />
    </div>
  );
}
