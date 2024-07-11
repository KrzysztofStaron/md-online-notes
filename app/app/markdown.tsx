import "./markdown.css";

import { useRemarkSync } from "react-remark";

const Markdown = ({ text }: { text: string }) => {
  const reactContent = useRemarkSync(text);

  return reactContent;
};

export default Markdown;
