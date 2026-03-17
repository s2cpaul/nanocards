import { useNavigate } from "react-router";
import { EditCardScreen } from "./EditCardScreen";

/**
 * CreateCardScreen - Wrapper to use EditCardScreen for creating new cards
 * (No cardId in query params = create mode)
 */
export function CreateCardScreen() {
  return <EditCardScreen />;
}
