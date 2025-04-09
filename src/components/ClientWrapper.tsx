"use client";

import AddEventButton from "./addEvent/AddEventButton";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AddEventButton />
      {children}
    </>
  );
}
