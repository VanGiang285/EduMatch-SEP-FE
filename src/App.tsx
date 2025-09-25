import { useState } from "react";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'register'>('login');

  const switchToRegister = () => setCurrentPage('register');
  const switchToLogin = () => setCurrentPage('login');

  if (currentPage === 'register') {
    return <RegisterPage onSwitchToLogin={switchToLogin} />;
  }

  return <LoginPage onSwitchToRegister={switchToRegister} />;
}