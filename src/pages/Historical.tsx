import { useNavigate, useParams } from "react-router-dom";
import WorkOrderCreation from "../components/WorkOrderCreation";

type Props = {};

function Historical({}: Props) {
  const { equipmentId } = useParams<{ equipmentId: string }>();
  const navigate = useNavigate();

  return (
    <>
      <div className="container py-4">
        <h2>Equipment Historical #{equipmentId}</h2>
        <button
          className="btn btn-outline-secondary mt-3"
          onClick={() => navigate("/")}
        >
          ‹ Back to Home
        </button>
      </div>
      
    </>
  );
}

export default Historical;
