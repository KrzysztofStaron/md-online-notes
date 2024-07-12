"use client";

import React, { useState, useEffect, useRef } from "react";
import { IoMdAdd } from "react-icons/io";
import { IoExitOutline } from "react-icons/io5";
import { LiaSave } from "react-icons/lia";
import { FaRegFileAlt, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { MdFileDownload } from "react-icons/md";
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
  const [leftMenuState, setLeftMenuState] = useState(true);
  const [forceNamed, setforceNamed] = useState(true);
  const user = useAuth();

  const mdToPdf = async () => {
    const md = notes.find((note) => note.id === activeNoteId)?.content;

    const response = await fetch("https://md-to-pdf.fly.dev", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ markdown: md ?? "" }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "md-to-pdf.pdf";
      link.click();
    } else {
      console.error("Failed to convert markdown to PDF");
    }
  };

  useEffect(() => {
    if (activeNoteId == null) {
      setActiveNoteId(notes[0]?.id ?? null);
    }
  }, [notes]);

  useEffect(() => {
    if (user?.uid) {
      loadNotes();
    }
  }, [user?.uid]);

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
    setforceNamed(true);
  };

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

  const toggleLeftMenu = () => {
    setLeftMenuState(!leftMenuState);
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
          titleChanged={(title: string, noteId: number) => {
            saveNote(note.id);
            setNotes((prevNotes) =>
              prevNotes.map((note) =>
                note.id === noteId ? { ...note, title } : note
              )
            );
          }}
          setActiveNoteId={setActiveNoteId}
          forceNamed={forceNamed}
        />
      </React.Fragment>
    ));
  };

  let titleInput = (
    <input
      type="text"
      className={`text-center text-3xl bg-transparent text-white focus:outline-none mt-3`}
      onChange={setTitle}
      value={notes.find((note) => note.id === activeNoteId)?.title || ""}
    />
  );

  if (notes.length === 0) {
    titleInput = (
      <input
        type="text"
        className={`text-center text-3xl bg-transparent text-white focus:outline-none mt-3`}
        onChange={setTitle}
        value={notes.find((note) => note.id === activeNoteId)?.title || ""}
        disabled
      />
    );
  }

  const ButtonMenu = () => {
    return (
      <div className="flex justify-between bg-slate-700 h-12 border-gray-600 border-b-2">
        <div className="flex h-12">
          <button
            onClick={() => saveNote(activeNoteId!)}
            className="text-white font-bold flex items-center justify-center text-2xl bg-slate-800 w-12 border-r-2 border-gray-600 hover:bg-slate-900 active:bg-slate-900"
          >
            <LiaSave />
          </button>

          <button
            onClick={() => setRenderMode(true)}
            className={`text-white font-mono w-20 flex items-center justify-center text-lg border-gray-600 ${
              renderMode && "bg-slate-800 border-r-2"
            } ${!renderMode && "hover:bg-slate-600"}`}
          >
            <FaCode />
          </button>
          <button
            onClick={() => setRenderMode(false)}
            className={`text-white font-mono w-20 flex items-center justify-center text-lg border-gray-600 ${
              !renderMode && "bg-slate-800 border-l-2 border-r-2"
            } ${renderMode && "hover:bg-slate-600"}`}
          >
            <FaRegFileAlt />
          </button>
          <button
            onClick={mdToPdf}
            className="text-white font-mono w-20 flex items-center justify-center text-lg border-gray-600 hover:bg-slate-600 active:bg-slate-900"
          >
            <MdFileDownload />
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

  return (
    <>
      <div className="flex h-screen">
        <div
          className={`${leftMenuState && "w-64"} ${
            !leftMenuState && "w-10"
          } bg-gray-800 text-white border-r border-gray-600`}
        >
          <button
            className={`block w-full ${!leftMenuState && "h-full"}`}
            onClick={toggleLeftMenu}
          >
            <span className="flex items-center justify-end mr-2 mt-2 mb-2">
              {leftMenuState && <FaArrowLeft />}
              {!leftMenuState && <FaArrowRight />}
            </span>
          </button>
          <span className={`${!leftMenuState && "hidden"}`}>{getNotes()}</span>
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
          {titleInput}
          <div className="overflow-scroll flex-grow w-full text-white markdown-preview ml-8 mt-8 mb-5">
            {renderArea}
          </div>
        </div>
      </div>
    </>
  );
}
