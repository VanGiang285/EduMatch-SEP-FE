import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { Navbar } from "./components/Navbar";

export default function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'login' | 'register'>('landing');

  const navigateToLanding = () => setCurrentPage('landing');
  const navigateToLogin = () => setCurrentPage('login');
  const navigateToRegister = () => setCurrentPage('register');

  return (
    <>
      <Navbar
        onNavigateToLogin={navigateToLogin}
        onNavigateToRegister={navigateToRegister}
        onNavigateToHome={navigateToLanding}
        currentPage={currentPage}
      />
      
      {currentPage === 'landing' && (
        <LandingPage
          onNavigateToLogin={navigateToLogin}
          onNavigateToRegister={navigateToRegister}
        />
      )}
      
      {currentPage === 'login' && (
        <LoginPage onSwitchToRegister={navigateToRegister} />
      )}
      
      {currentPage === 'register' && (
        <RegisterPage onSwitchToLogin={navigateToLogin} />
      )}
    </>
  );
}