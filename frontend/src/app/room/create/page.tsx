"use client";

import { useState } from "react";
import { CreateRoomModal } from "@frontend/components/create-room-modal";
import { useRouter } from "next/navigation";

export default function CreateRoomPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleCreateRoom = (roomData: any) => {
    console.log("Creating room:", roomData);
    // Simulate room creation
    setTimeout(() => {
      router.push("/room");
    }, 500);
  };

  return (
    <CreateRoomModal
      isOpen={isOpen}
      onClose={() => router.back()}
      onSubmit={handleCreateRoom}
    />
  );
}
