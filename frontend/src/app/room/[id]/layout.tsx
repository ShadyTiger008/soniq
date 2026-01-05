import { use } from "react";
import { SocketProvider } from "@frontend/lib/socket-context";

export default function RoomLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id: roomId } = use(params);

  return (
    <SocketProvider roomId={roomId && roomId !== "default" ? roomId : null}>
      {children}
    </SocketProvider>
  );
}
