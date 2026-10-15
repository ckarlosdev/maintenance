import { useState, type ReactNode } from "react";
import hmbLogo from "../assets/hmbLogo.png";
import { Button } from "react-bootstrap";
import "../styles/title.css";
import useUser from "../hooks/useUser";
import { useAuthStore } from "../stores/authStore";
import { api } from "../hooks/apiConfig";
import { Link } from "react-router-dom";

type Props = { children?: ReactNode };

function Title({ children }: Props) {
  
  const { isLoading: isLoadingUser } = useUser();
  const { user: userAuth } = useAuthStore();
  const logout = useAuthStore((state) => state.logout);
  const [isLoading, setIsLoading] = useState(false);
  const refreshToken = useAuthStore((state) => state.refreshToken);

  if (isLoadingUser)
    return <p className="text-center py-2">Loading user data...</p>;

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      if (refreshToken) {
        await api.post("/auth/revoke", { refreshToken });
      }
    } catch (error) {
      console.error(
        "Error al revocar token, cerrando sesión localmente...",
        error,
      );
    } finally {
      logout();
      window.location.href = "https://ckarlosdev.github.io/login/";
    }
  };

  return (
    <header className="w-100 mt-1 mb-1 text-center px-1 px-sm-3">
      {/* 1. LOGO CENTRADO */}
      <div className="mb-2 mb-md-2">
        <Link to="/">
          <img
            src={hmbLogo}
            alt="Company Logo"
            className="img-fluid logo-img"
          />
        </Link>
      </div>

      {/* 2. CONTENEDOR ADAPTATIVO */}
      <div className="title-header-layout align-items-center gap-2 gap-md-3">
        {/* BOTÓN REGRESAR / HOME (Navegación interna sin recarga de página) */}
        <div className="order-2 order-sm-1 d-flex justify-content-start align-items-center">
          <Button
            variant="outline-secondary"
            className="no-print d-flex align-items-center justify-content-center gap-1 header-btn"
            onClick={() => {
              window.location.href = `https://ckarlosdev.github.io/HMBrandt/`;
            }}
          >
            ‹ Home
          </Button>
        </div>

        {/* TÍTULO PRINCIPAL DINÁMICO */}
        <div className="order-1 order-sm-2 text-center w-100">
          <h2 className="text-dark m-0 fw-bold header-title">
            {children || "HMBrandt Portal"}
          </h2>
        </div>

        {/* INFO USUARIO + LOGOUT */}
        <div className="order-3 d-flex justify-content-end align-items-center gap-2 no-print">
          <div className="d-none d-md-block text-end pe-3 user-badge">
            <span className="text-muted d-block user-label">User</span>
            <span className="fw-semibold text-dark">
              {userAuth?.fullName || "Guest"}
            </span>
          </div>

          <Button
            variant="outline-danger"
            className="no-print header-btn"
            disabled={isLoading}
            onClick={handleLogout}
          >
            {isLoading ? "..." : "Logout"}
          </Button>
        </div>
      </div>
    </header>
  );
}

export default Title;
