"use client";

import React, { useState, useEffect } from "react";
import { IoMdAdd } from "react-icons/io";
import { IoExitOutline } from "react-icons/io5";
import { LiaSave } from "react-icons/lia";
import { FaRegFileAlt } from "react-icons/fa";
import { FaCode } from "react-icons/fa6";

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

  const setTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const title = event.target.value;
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === activeNoteId ? { ...note, title } : note
      )
    );
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
  } else {
    renderArea = (
      <Markdown
        text={notes.find((note) => note.id === activeNoteId)?.content ?? ""}
      ></Markdown>
    );
  }

  const ButtonMenu = () => {
    return (
      <div className="flex justify-between bg-slate-700 h-12 border-gray-600 border-b-2">
        <div className="flex h-12">
          <button
            onClick={() => saveNote(activeNoteId!)}
            className="text-white font-bold flex items-center justify-center text-2xl bg-slate-800 w-12 border-r-2 border-gray-600"
          >
            <LiaSave />
          </button>
          <button
            onClick={() => setRenderMode((prev) => true)}
            className={`text-white font-mono w-20 flex items-center justify-center ${
              renderMode && "bg-slate-800"
            }`}
          >
            <FaRegFileAlt />
          </button>
          <button
            onClick={() => setRenderMode((prev) => false)}
            className={`text-white font-mono w-20 flex items-center justify-center ${
              !renderMode && "bg-slate-800"
            }`}
          >
            Prev
          </button>
        </div>

        <button
          onClick={() => signOut(auth)}
          className="text-white mr-2 font-bold flex items-center justify-center text-2xl"
        >
          <IoExitOutline />
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
          <input
            type="text"
            className="text-center text-3xl bg-transparent text-white focus:outline-none mt-3"
            onChange={setTitle}
            value={notes.find((note) => note.id === activeNoteId)?.title}
          />
          <div className="overflow-scroll flex-grow w-full text-white markdown-preview ml-8 mt-8 mb-5">
            {renderArea}
          </div>
        </div>
      </div>
    </>
  );
}
