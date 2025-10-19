import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import UserScreen from "./pages/UserScreen";
import UploadedScreen from "./pages/UploadedScreen";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<UserScreen />} /> // Ruta para la pantalla principal del usuario
        <Route path="/UploadedScreen" element={<UploadedScreen/>} /> // Ruta para la pantalla de pista separada
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword/>} />
      </Routes>
    </Router>
  );
};

export default App;