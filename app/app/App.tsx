"use client";

import React, { useState, useEffect } from "react";
import { IoMdAdd } from "react-icons/io";
import NoteButton, { Note } from "./NoteButton";
import { signOut } from "firebase/auth";
import { db, auth } from "../firebase/config";
import useAuth from "../hooks/useAuth";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<number | null>(null);
  const user = useAuth();

  const saveNote = async (id: number) => {
    if (user?.uid && activeNoteId !== null) {
      console.log("stuff");
      const noteToSave = notes.find((note) => note.id === id);
      if (noteToSave) {
        await setDoc(
          doc(db, "root", "notes", user.uid, id.toString()),
          noteToSave
        );
      }
    }
  };

  const loadNotes = async () => {
    console.log(user?.uid);
    const querySnapshot = await getDocs(
      collection(db, "root", "notes", user?.uid?.toString() ?? "")
    );
    var data: any = [];
    querySnapshot.forEach((doc) => {
      data.push(doc.data());
    });
    if (data.length) {
      setNotes(data.map((newNote: any) => newNote as Note));
    }
  };

  useEffect(() => {
    if (user?.uid) {
      loadNotes();
    }
  }, [user?.uid]);

  const openNote = (noteId: number) => {
    saveNote(activeNoteId!);
    setActiveNoteId(noteId);
  };

  const setNoteContent = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = event.target.value;
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === activeNoteId
          ? { ...note, content, modifiedAt: new Date().getTime() }
          : note
      )
    );
  };

  const createNewNote = () => {
    setNotes((prevNotes) => [
      ...prevNotes,
      {
        id: Number(prevNotes.at(-1)?.id ?? 0) + 1,
        title: "",
        content: "",
        modifiedAt: new Date().getTime(),
      },
    ]);
  };

  const removeNote = (noteId: number) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
  };

  const getNotes = () => {
    const sortedNotes = [...notes].sort((a, b) => b.modifiedAt - a.modifiedAt);

    return sortedNotes.map((note) => (
      <React.Fragment key={note.id}>
        <NoteButton
          note={note}
          openNote={openNote}
          removeNote={removeNote}
          active={activeNoteId === note.id}
          titleChanged={(title: string, noteId: number) =>
            setNotes((prevNotes) =>
              prevNotes.map((note) =>
                note.id === noteId
                  ? { ...note, title, modifiedAt: new Date().getTime() }
                  : note
              )
            )
          }
          setActiveNoteId={setActiveNoteId}
        />
      </React.Fragment>
    ));
  };

  return (
    <div className="flex">
      <div className="w-64 h-screen bg-gray-800 text-white border-r border-gray-700 overflow-scroll">
        {getNotes()}
        <button
          onClick={createNewNote}
          className="block w-full text-left px-5 py-2 hover:bg-gray-700"
        >
          <span className="flex items-center justify-center opacity-50">
            <IoMdAdd className="" />
          </span>
        </button>
      </div>
      <div className="w-full bg-slate-800 text-white">
        <div className="flex justify-start p-2">
          <button
            onClick={() => saveNote(activeNoteId!)}
            className="text-white"
          >
            Save
          </button>
        </div>
        <div className="flex justify-end p-2">
          <button onClick={() => signOut(auth)} className="text-white">
            Logout
          </button>
        </div>
        <h1 className="text-2xl text-center">
          {(activeNoteId !== null &&
            notes.find((note) => note.id === activeNoteId)?.title) ||
            ""}
        </h1>
        <textarea
          className="flex-1 p-10  h-screen focus:outline-none bg-transparent"
          value={
            (activeNoteId !== null &&
              notes.find((note) => note.id === activeNoteId)?.content) ||
            ""
          }
          onChange={setNoteContent}
          spellCheck="false"
        ></textarea>
      </div>
    </div>
  );
}
