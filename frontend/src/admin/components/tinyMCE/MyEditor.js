/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps, jsx-a11y/anchor-is-valid, jsx-a11y/anchor-has-content, no-multi-str */

import "../../css/tinyMCE/MyEditor.css";

import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react";

function MyEditor() {
  const editorRef = useRef(null);

  const handleSave = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
  };

  return (
    <div>
      <Editor
        apiKey="0tco57klvip65a8n1b7epf1bguqh7jkxq7q2mt557wdtgeum"
        onInit={(evt, editor) => (editorRef.current = editor)}
        init={{
          // menubar: true,
          height: 500,
          plugins: [
            "advlist autolink lists link image charmap preview anchor",
            "searchreplace visualblocks code fullscreen",
            "insertdatetime media table code help wordcount",
            "image"
          ],
          toolbar:
            "undo redo | formatselect | bold italic underline | \
            alignleft aligncenter alignright alignjustify | \
            bullist numlist outdent indent | link image | preview",
        }}
      />
      <button
        onClick={handleSave}
        style={{ marginTop: "20px", padding: "8px 16px" }}
        className="admin-btn"
      >
        GÃ¡Â»Â­i Ã„Âi
      </button>
    </div>
  );
}

export default MyEditor;
