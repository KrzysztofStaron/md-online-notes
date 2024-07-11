"use client";

import React, { useState, useEffect } from "react";
import { IoMdAdd } from "react-icons/io";
import NoteButton, { Note } from "./NoteButton";
import { signOut } from "firebase/auth";
import { db, auth } from "../firebase/config";
import useAuth from "../hooks/useAuth";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import Markdown from "./markdown";

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<number | null>(null);
  const [renderMode, setRenderMode] = useState(true);
  const user = useAuth();

  useEffect(() => {
    if (activeNoteId == null) {
      setActiveNoteId(notes[0]?.id ?? null);
    }
  }, [notes]);

  const saveNote = async (id: number) => {
    if (user?.uid && id !== null) {
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

  const removeNote = async (noteId: number) => {
    await deleteDoc(
      doc(db, "root", "notes", user?.uid ?? "", noteId.toString())
    );

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
                note.id === noteId ? { ...note, title } : note
              )
            )
          }
          setActiveNoteId={setActiveNoteId}
        />
      </React.Fragment>
    ));
  };

  let renderArea = <></>;
  let modeMessage = "";

  if (renderMode) {
    renderArea = (
      <textarea
        className="focus:outline-none bg-transparent w-full"
        value={
          (activeNoteId !== null &&
            notes.find((note) => note.id === activeNoteId)?.content) ||
          ""
        }
        onChange={setNoteContent}
        spellCheck="false"
      ></textarea>
    );
    modeMessage = "Code";
  } else {
    renderArea = (
      <Markdown
        text={notes.find((note) => note.id === activeNoteId)?.content ?? ""}
      ></Markdown>
    );
    modeMessage = "Preview";
  }

  const ButtonMenu = () => {
    return (
      <div className="flex justify-between h-auto bg-slate-700 p-2">
        <button
          onClick={() => saveNote(activeNoteId!)}
          className="text-white ml-2 font-bold"
        >
          Save
        </button>
        <button
          onClick={() => setRenderMode((prev) => !prev)}
          className="text-white font-mono bg-slate-900 rounded-full p-4 font-bold"
        >
          {modeMessage}
        </button>
        <button
          onClick={() => signOut(auth)}
          className="text-white mr-2 font-bold"
        >
          Logout
        </button>
      </div>
    );
  };

  return (
    <>
      <div className="flex h-screen">
        <div className="w-64 bg-gray-800 text-white border-r border-gray-700">
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

        <div className="flex flex-col w-full">
          <ButtonMenu />
          <div className="overflow-scroll flex-grow w-full text-white markdown-preview ml-8 mt-8 mb-5">
            {renderArea}
          </div>
        </div>
      </div>
    </>
  );
}

/*

      <ButtonMenu></ButtonMenu>

*/
