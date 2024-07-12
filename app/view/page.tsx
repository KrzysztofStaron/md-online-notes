"use client";
// http://localhost:3000/view?data=HelloWorld

import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import useAuth from "../hooks/useAuth";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";

const view = () => {
  const user = useAuth();
  const [max, setMax] = useState<number>(-1);

  useEffect(() => {
    if (!user) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("data") === null) return;

    const fetchData = async () => {
      await loadNotes();
      const data = urlParams.get("data")!.split(";");

      const noteToSave = {
        owner: data[0],
        ownerId: data[1],
        id: max + 1,
      };

      await setDoc(doc(db, user?.uid, noteToSave.id.toString()), noteToSave);
      window.location.href = "/";
    };

    fetchData();
  }, [user]);

  const loadNotes = async () => {
    const querySnapshot = await getDocs(collection(db, user?.uid?.toString()!));
    let maxId = -1;

    querySnapshot.forEach(async (doc) => {
      maxId = Math.max(maxId, doc.data().id);
    });

    setMax(maxId);
  };

  window.location.href = "/";
};

export default view;
