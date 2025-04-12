"use client";

import AddEventButton from "./addEvent/AddEventButton";
import { ToastContainerComponent } from "./toast/toast";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AddEventButton />
      {children}
      <ToastContainerComponent />
    </>
  );
}
