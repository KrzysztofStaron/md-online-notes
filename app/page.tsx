"use client";

import { useEffect, useState } from "react";
import App from "./app/App";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config";

const Loader = () => {
  const [authenticated, setAuthenticated] = useState("loading");

  onAuthStateChanged(auth, (user) => {
    if (user) {
      setAuthenticated("true");
    } else {
      setAuthenticated("false");
    }
  });

  useEffect(() => {
    console.log(authenticated);
    if (authenticated === "false") {
      window.location.href = "auth/signIn";
    }
  }, [authenticated]);

  if (authenticated === "true") {
    return <App />;
  } else {
    return <div className="bg-gray-900 w-screen h-screen "></div>;
  }
};

export default Loader;
