import React, { useEffect, useState } from "react";
import { FaRegTrashCan } from "react-icons/fa6";

export interface Note {
  id: number; // Assuming the ID is a string, adjust the type as necessary
  title: string;
  content: string;
  modifiedAt: number; // Add modifiedAt property to track the modification date
}

const isTitleValid = (title: string) => {
  return title.trim() !== "";
};

interface NoteButtonProps {
  note: Note;
  openNote: (noteId: number) => void;
  removeNote: (noteId: number) => void;
  active: boolean;
  titleChanged: (title: string, id: number) => void;
  setActiveNoteId: (id: number) => void;
}

const NoteButton: React.FC<NoteButtonProps> = ({
  note,
  openNote,
  removeNote,
  active,
  titleChanged,
  setActiveNoteId,
}) => {
  const [named, setNamed] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(note.title);
  const [hovered, setHovered] = useState<boolean>(false);

  useEffect(() => {
    titleChanged(title, note.id);
  }, [title]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value);
  };

  const handleInputKeyPress = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      handleInputBlur();
      setActiveNoteId(note.id);
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
          className="bg-transparent w-full text-left px-5 py-2 focus:bg-gray-700 focus:outline-none"
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
    bgColor = "bg-slate-700 border-b-2 border-t-2";
  }
  return (
    <button
      onClick={handleButtonClick}
      onContextMenu={(e) => {
        e.preventDefault(); // Prevent the context menu from opening
        setNamed(false);
      }}
      className={`block w-full text-left px-5 py-2 hover:bg-gray-700 ${bgColor} border-gray-800 box-border`}
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

export default NoteButton;
