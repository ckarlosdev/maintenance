import { createHashRouter } from "react-router-dom";
import Home from "./Home";
import WorkOrders from "./WorkOrders";
import Historical from "./Historical";
import Maintenance from "./Maintenance";
import MainLayout from "./MainLayout";
const router = createHashRouter([
  {
    path: "/",
    element: <MainLayout />, // Layout global que envuelve a las subrutas
    children: [
      {
        index: true, // Corresponde al path "/"
        element: <Home />,
      },
      {
        path: "maintenance", // Corresponde a "/#/maintenance"
        element: <Maintenance />,
      },
      {
        path: "work-orders/:equipmentId",
        element: <WorkOrders />,
      },
      {
        path: "history/:equipmentId",
        element: <Historical />,
      },
    ],
  },
  {
    path: "*",
    element: <div>404 | Page not found</div>,
  },
]);

export default router;
