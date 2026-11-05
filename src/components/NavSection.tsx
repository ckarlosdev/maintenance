import { Button, Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { FaTools } from "react-icons/fa";
import { useModalStore } from "../stores/useModalStore";

type Props = {};

function NavSection({}: Props) {
  const openModal = useModalStore((state) => state.openModal);

  return (
    <Nav variant="underline" className="align-items-center">
      <Nav.Item>
        <Nav.Link as={NavLink} to="/">
          Cards
        </Nav.Link>
      </Nav.Item>

      <Nav.Item>
        <Nav.Link as={NavLink} to="/maintenance">
          Table
        </Nav.Link>
      </Nav.Item>

      <Nav.Item className="ms-auto">
        <Button
          variant="outline-secondary"
          size="sm"
          className="no-print d-flex align-items-center gap-2"
          onClick={() => openModal("SERVICES_MANAGER")}
        >
          <FaTools size={12} />
          Services
        </Button>
      </Nav.Item>
    </Nav>
  );
}

export default NavSection;
