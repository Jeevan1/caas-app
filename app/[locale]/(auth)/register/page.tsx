import AuthSection from "@/components/auth/login-signup";
import React from "react";

const RegisterOrganizer = () => {
  return (
    <div>
      <AuthSection page="signup" isOrganizer />
    </div>
  );
};

export default RegisterOrganizer;
