"use client";

import React, { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import NoteButton from "./NoteButton";
import { Note } from "./NoteButton";

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<number | null>(null);

  const openNote = (noteId: number) => {
    setActiveNoteId(noteId);
  };

  const setNoteContent = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = event.target.value;
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === activeNoteId
          ? { ...note, content, modifiedAt: new Date() }
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
        modifiedAt: new Date(),
      },
    ]);
  };

  const removeNote = (noteId: number) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
  };

  const getNotes = () => {
    const sortedNotes = [...notes].sort(
      (a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime()
    );
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
                  ? { ...note, title, modifiedAt: new Date() }
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
