/* eslint-disable no-unused-vars, react-hooks/exhaustive-deps, jsx-a11y/anchor-is-valid, jsx-a11y/anchor-has-content, no-multi-str */

import "../../css/tinyMCE/MyEditor.css";
import { Editor } from "@tinymce/tinymce-react";
import { useRef } from "react";

function MyEditor({ value, onEditorChange }) {
  const editorRef = useRef(null);

  return (
    <div className="gp-tinymce-container">
      <Editor
        apiKey="0tco57klvip65a8n1b7epf1bguqh7jkxq7q2mt557wdtgeum"
        onInit={(evt, editor) => (editorRef.current = editor)}
        value={value}
        onEditorChange={(content) => {
          if (onEditorChange) {
            onEditorChange(content);
          }
        }}
        init={{
          height: 400,
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
    </div>
  );
}

export default MyEditor;
