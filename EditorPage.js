// frontend/src/EditorPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { io } from 'socket.io-client';

const socket = io('http://192.168.1.104:5000'); // Update to your IP

const SAVE_INTERVAL_MS = 2000;

export default function EditorPage() {
  const { id: documentId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("Untitled Document");

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    autofocus: 'end',
    onUpdate({ editor }) {
      const html = editor.getHTML();
      socket.emit('send-changes', html);
    },
  });

  useEffect(() => {
    if (!editor) return;

    socket.emit('get-document', documentId);

    socket.once('load-document', content => {
      editor.commands.setContent(content);
    });

    socket.on('receive-changes', content => {
      if (editor.getHTML() !== content) {
        editor.commands.setContent(content);
      }
    });

    const interval = setInterval(() => {
      socket.emit('save-document', editor.getHTML());
    }, SAVE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, [editor, documentId]);

  const handleSave = () => {
    const content = editor.getHTML();
    alert(`\u2705 Document "${title}" saved locally.\n\nContent:\n${content}`);
  };

  const handleDownload = (format = 'txt') => {
    const content = format === 'txt' ? editor.getText() : editor.getHTML();
    const element = document.createElement("a");
    const file = new Blob([content], {
      type: format === 'txt' ? 'text/plain' : 'text/html',
    });
    element.href = URL.createObjectURL(file);
    element.download = `${title}.${format}`;
    document.body.appendChild(element);
    element.click();
  };

  const btnStyle = {
    padding: '10px 16px',
    fontSize: '14px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '12px'
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: 'auto' }}>
      <h2 style={{ textAlign: 'center' }}>\ud83d\udccb Collaborative Document Editor</h2>

      <input
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Enter document title"
        style={{
          width: '100%',
          fontSize: '18px',
          padding: '8px 10px',
          margin: '10px 0',
          border: '1px solid #ccc',
          borderRadius: '6px'
        }}
      />

      {editor ? (
        <EditorContent
          editor={editor}
          style={{
            border: '1px solid #ccc',
            borderRadius: '8px',
            padding: '15px',
            minHeight: '400px',
            fontSize: '16px',
            backgroundColor: '#fdfdfd'
          }}
        />
      ) : (
        <p>Loading editor...</p>
      )}

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={handleSave} style={btnStyle}>\ud83d\udcbe Save Document</button>
        <button onClick={() => handleDownload('txt')} style={{ ...btnStyle, backgroundColor: '#28a745' }}>
          \u2b07 Download TXT
        </button>
        <button onClick={() => handleDownload('html')} style={{ ...btnStyle, backgroundColor: '#17a2b8' }}>
          \u2b07 Download HTML
        </button>
        <button onClick={() => navigate('/')} style={{ ...btnStyle, backgroundColor: '#6c757d' }}>
          \ud83d\udd04 New Document
        </button>
      </div>
    </div>
  );
}