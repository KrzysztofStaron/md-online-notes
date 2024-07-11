"use client";

import React, { useEffect, useState } from "react";
import SignUp from "./pages/SignUp";
import useAuth from "./hooks/useAuth";
import App from "./app/App";

const Loader = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(0);
  const auth = useAuth();

  useEffect(() => {
    setAuthenticated(auth != null);
    setLoading(loading + 1);
  }, [auth]);

  if (loading < 2) {
    return <div>Loading...</div>;
  }

  if (authenticated) {
    return <App />;
  } else {
    return <SignUp />;
  }
};

export default Loader;
