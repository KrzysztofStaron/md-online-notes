"use client";
// http://localhost:3000/view?data=HelloWorld

import { useEffect, useState } from "react";
import { db } from "../firebase/config";

const view = () => {
  const [data, setData] = useState<string>("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setData(urlParams.get("data")!);
  }, []);

  return data;
};

export default view;
