import { Outlet } from "@tanstack/react-router";
import { TopNavBar } from "../containers/TopNavBar";
import { LeftSidebar } from "../containers/LeftSidebar";
import { RightSidebar } from "../containers/RightSidebar";
import { SignInModal } from "../containers/SignInModal";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ChartNoAxesCombined,
} from "lucide-react";
import "../App.css";


export function RootLayout() {

  return (
    <div className="app-container">
      <TopNavBar/>

      <div className="app-layout">
        <LeftSidebar
          menuConfig={[
            { path: "/", icon: LayoutDashboard, label: "Home" },
            { path: "/members", icon: Users, label: "Members" },
            {
              path: "/analytics",
              icon: ChartNoAxesCombined,
              label: "Analytics",
            },
            { path: "/calendar", icon: Calendar, label: "Calendar" },
          ]}
        />

        <main className="main-content">
          <Outlet />
        </main>

        <RightSidebar/>
      </div>

      <SignInModal />
    </div>
  );
}
