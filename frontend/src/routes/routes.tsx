import { createBrowserRouter, type RouteObject } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import ProtectedLayout from "../lib/ProtectedLayout";
import VerifyNoticePage from "../features/auth/components/VerifyNoticePage";
import VerifyEmailPage from "../pages/auth/VerifyEmailPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import NotFound from "../components/NotFound";
import ExpensesPage from "../pages/expenses/ExpensesPage";
import ExpensesLayoutPage from "../pages/expenses/ExpensesLayoutPage";
import AddExpensePage from "../pages/expenses/AddExpensePage";
import ExpenseListPage from "../pages/expenses/ExpenseListPage";
import CategoriesPage from "../pages/categories/CategoriesPage";
import ProfilePage from "../pages/profile/ProfilePage";
import PublicAuthLayout from "../lib/PublicAuthLayout";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <PublicAuthLayout />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: "/verify-notice",
    element: <VerifyNoticePage />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmailPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
  // protected routes
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "expenses",
        element: <ExpensesLayoutPage />,
        children: [
          {
            index: true,
            element: <ExpensesPage />,
          },
          {
            path: "add",
            element: <AddExpensePage />,
          },
          {
            path: "list",
            element: <ExpenseListPage />,
          },
        ],
      },
      {
        path: "categories",
        element: <ExpensesLayoutPage />,
        children: [
          {
            index: true,
            element: <CategoriesPage />,
          },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
