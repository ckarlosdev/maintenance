import { createHashRouter } from "react-router-dom";
import Home from "./Home";
import WorkOrders from "./WorkOrders";
import Historical from "./Historical";

const router = createHashRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/work-orders/:equipmentId",
    element: <WorkOrders />,
  },
  {
    path: "/history/:equipmentId",
    element: <Historical />,
  },
  {
    path: "*",
    element: <div>404 | Page not found</div>,
  },
]);

export default router;
