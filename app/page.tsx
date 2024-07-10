"use client";

import React, { act, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";

// Define the Note type
interface Note {
  id: number; // Assuming the ID is a string, adjust the type as necessary
  title: string;
  content: string;
}

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<number | null>(null);

  const openNote = (noteId: number) => {
    setActiveNoteId(noteId);
  };

  const setNoteContent = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = event.target.value;
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === activeNoteId ? { ...note, content } : note
      )
    );
  };

  const createNewNote = () => {
    setNotes((prevNotes) => [
      ...prevNotes,
      { id: Number(prevNotes.at(-1)?.id ?? 0) + 1, title: "", content: "" },
    ]);
  };

  const removeNote = (noteId: number) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
  };

  return (
    <div className="flex">
      <div className="w-64 h-screen bg-gray-800 text-white">
        <button
          onClick={createNewNote}
          className="block w-full text-left px-5 py-2 hover:bg-gray-700"
        >
          Create New Note
        </button>
        {notes.map((note) => (
          <React.Fragment key={note.id}>
            <NoteButton
              note={note}
              openNote={openNote}
              removeNote={removeNote}
              active={activeNoteId === note.id}
            />
          </React.Fragment>
        ))}
      </div>
      <textarea
        className="flex-1 p-10"
        value={
          (activeNoteId !== null &&
            notes.find((note) => note.id === activeNoteId)?.content) ||
          ""
        }
        onChange={setNoteContent}
      ></textarea>
    </div>
  );
}

const isTitleValid = (title: string) => {
  return title.trim() !== "";
};

interface NoteButtonProps {
  note: Note;
  openNote: (noteId: number) => void;
  removeNote: (noteId: number) => void;
  active: boolean;
}

const NoteButton: React.FC<NoteButtonProps> = ({
  note,
  openNote,
  removeNote,
  active,
}) => {
  const [named, setNamed] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(note.title);
  const [hovered, setHovered] = useState<boolean>(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleInputKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      handleInputBlur();
      setNamed(true);
    }
  };

  const handleInputBlur = () => {
    if (isTitleValid(title)) {
      setNamed(true);
      setHovered(false);
    } else {
      removeNote(note.id);
    }
  };

  const handleButtonClick = () => {
    if (named) {
      openNote(note.id);
    }
  };

  if (!named) {
    return (
      <div>
        <input
          type="text"
          className="bg-transparent w-full text-left px-5 py-2 focus:bg-gray-700"
          autoFocus // Add autoFocus attribute to focus the input field at creation
          value={title}
          onChange={handleInputChange}
          onKeyPress={handleInputKeyPress}
          onBlur={handleInputBlur} // Add onBlur event handler to handle focus loss
        />
      </div>
    );
  }

  let bgColor = "bg-gray-800";
  if (active) {
    bgColor = "bg-gray-700";
  }
  return (
    <button
      onClick={handleButtonClick}
      onContextMenu={(e) => {
        e.preventDefault(); // Prevent the context menu from opening
        setNamed(false);
      }}
      className={`block w-full text-left px-5 py-2 hover:bg-gray-700 ${bgColor}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: "relative" }} // Add position: relative to the button style
    >
      {title}
      {named && (
        <span
          className="ml-2 absolute right-3 top-1/2 transform -translate-y-1/2"
          onClick={() => removeNote(note.id)}
        >
          {hovered ? <FaRegTrashCan /> : null}
        </span>
      )}
    </button>
  );
};
