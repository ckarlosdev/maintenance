import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";

type Props = {};

function NavSection({}: Props) {
  return (
    <Nav variant="underline">
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
    </Nav>
  );
}

export default NavSection;
