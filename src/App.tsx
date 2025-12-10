import React, { useRef, useState } from "react";
import { TopNavBar } from "./components/TopNavBar";
import { LeftSidebar } from "./components/LeftSidebar";
import { RightSidebar } from "./components/RightSidebar";
import { HeroPanel } from "./components/HeroPanel";
import { AttendanceTable } from "./components/AttendanceTable";
import { SignInModal } from "./components/SignInModal";
import type { RowClickedEvent } from "ag-grid-community";
import "./App.css";

import { useLiveQuery } from "@tanstack/react-db";
import { userCollection } from "./collections/user";
import { User } from "./entities/user";
import type { UserType } from "./entities/schemas";

function App() {
  const [activeMode, setActiveMode] = useState("dashboard");
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(true);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);

  const { data } = useLiveQuery((q) => q.from({ userCollection }));

  const prevRow = useRef<number>(null);

  const createUser = () => {
    const user = new User(
      "Israel",
      "Agyeman-Prmepeh",
      `user${crypto.randomUUID()}@email.com`,
      "+563456765"
    );
    user.validate();
    console.log("user", user.loyaltyTier);
    userCollection.insert(user);
  };

  const rows: UserType[] = Array.isArray(data) ? data : [];

  const hdl = (type: string, e: React.SyntheticEvent | RowClickedEvent) => {
    switch (type) {
      case "add":
        createUser();
        return;
      case "rowClicked":
        if (prevRow.current === (e as RowClickedEvent).rowIndex) {
          setRightSidebarCollapsed((prev) => !prev);
        }
        prevRow.current = (e as RowClickedEvent).rowIndex;
        return;
      default:
        console.log(type);
        return;
    }
  };

  return (
    <div className="app-container">
      <TopNavBar onNewEventClick={() => setShowSignInModal(true)} />

      <div className="app-layout">
        <LeftSidebar
          activeMode={activeMode}
          onModeChange={setActiveMode}
          isCollapsed={leftSidebarCollapsed}
          onToggleCollapse={() =>
            setLeftSidebarCollapsed(!leftSidebarCollapsed)
          }
        />

        <main className="main-content">
          {activeMode === "dashboard" && (
            <>
              <HeroPanel />
              <AttendanceTable rowData={rows} handleAction={hdl} />
            </>
          )}

          {activeMode === "members" && (
            <div className="placeholder-content">
              <h2>Members Management</h2>
              <p>Member management interface coming soon...</p>
            </div>
          )}

          {activeMode === "events" && (
            <div className="placeholder-content">
              <h2>Events Calendar</h2>
              <p>Events management interface coming soon...</p>
            </div>
          )}
        </main>

        <RightSidebar
          isCollapsed={rightSidebarCollapsed}
          onToggleCollapse={() =>
            setRightSidebarCollapsed(!rightSidebarCollapsed)
          }
        />
      </div>

      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
      />
    </div>
  );
}

export default App;
