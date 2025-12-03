"use client";

import { useState } from "react";
import { CreateRoomModal } from "@frontend/components/create-room-modal";
import { useRouter } from "next/navigation";
import { apiClient } from "@frontend/lib/api-client";
import { toast } from "sonner";

export default function CreateRoomPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async (roomData: any) => {
    setIsLoading(true);
    try {
      const response = await apiClient.createRoom({
        name: roomData.name,
        description: roomData.description,
        mood: roomData.mood || "Chill",
        isPrivate: roomData.isPrivate || false,
        maxListeners: roomData.maxListeners || 1000,
      });

      if (response.success && response.data) {
        const room = response.data as any;

        // Extract room ID - MongoDB returns _id which might be an object
        let roomId: string | null = null;

        if (room._id) {
          // Handle both string and ObjectId types
          roomId =
            typeof room._id === "string"
              ? room._id
              : room._id.toString
              ? room._id.toString()
              : String(room._id);
        } else if (room.id) {
          roomId = String(room.id);
        }

        if (roomId) {
          toast.success("Room created successfully!");
          // Close modal and navigate
          setIsOpen(false);
          // Navigate immediately
          router.replace(`/room/${roomId}`);
        } else {
          console.error("Room ID not found. Full response:", response);
          toast.error("Room created but ID not found in response");
          // Fallback: redirect to home
          router.replace("/home");
        }
      } else {
        toast.error(response.error || "Failed to create room");
      }
    } catch (error) {
      console.error("Error creating room:", error);
      toast.error("An error occurred while creating the room");
      setIsLoading(false);
    }
  };

  return (
    <CreateRoomModal
      isOpen={isOpen}
      onClose={() => router.back()}
      onSubmit={handleCreateRoom}
      isLoading={isLoading}
    />
  );
}
