import type { ReactNode } from "react";
import hmbLogo from "../assets/hmbLogo.png";
import { Button } from "react-bootstrap";
import "../styles/title.css";
import { useNavigate } from "react-router-dom";

type Props = { children: ReactNode };

function PageTitle({ children }: Props) {
  const navigate = useNavigate();

  return (
    <header className="w-100 mt-2 mb-1 text-center px-1">
      {/* 2. CONTENEDOR ADAPTATIVO */}
      <div className="title-header-layout align-items-center gap-2 gap-md-3">
        {/* BOTÓN BINDER / HOME */}
        <div className="order-2 order-sm-1 d-flex justify-content-start align-items-center">
          <Button
            variant="outline-secondary"
            className="no-print d-flex align-items-center justify-content-center gap-1 header-btn"
            onClick={() => navigate("/")}
          >
            ‹ Back
          </Button>
        </div>

        {/* TÍTULO PRINCIPAL (En celular se muestra primero) */}
        <div className="order-1 order-sm-2 text-center w-100">
          <h2 className="text-dark m-0 fw-bold header-title">{children}</h2>
        </div>

        {/* INFO USUARIO + LOGOUT */}
        <div className="order-3 d-flex align-items-center justify-content-end gap-2 no-print">
          <div className="d-flex align-items-center">
            {" "}
            {/* 👈 Eliminados mb-2 mb-md-3 */}
            <img
              src={hmbLogo}
              alt="Company Logo"
              className="img-fluid logo-img"
            />
          </div>
        </div>
      </div>
    </header>
  );
}

export default PageTitle;
