import { Navigate } from "react-router-dom";

function ExpensesPage() {
  return <Navigate to="/expenses/list" replace />;
}

export default ExpensesPage;
