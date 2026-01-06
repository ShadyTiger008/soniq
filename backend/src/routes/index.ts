import { Router } from "express";
import { roomRoutes } from "./room.routes.js";
import { userRoutes } from "./user.routes.js";
import { authRoutes } from "./auth.routes.js";
import { youtubeRoutes } from "./youtube.routes.js";
import { unsplashRoutes } from "./unsplash.routes.js";
import supportRoutes from "./support.routes.js";

export const apiRoutes = Router();

apiRoutes.use("/rooms", roomRoutes);
apiRoutes.use("/users", userRoutes);
apiRoutes.use("/auth", authRoutes);
apiRoutes.use("/youtube", youtubeRoutes);
apiRoutes.use("/unsplash", unsplashRoutes);
apiRoutes.use("/support", supportRoutes);

