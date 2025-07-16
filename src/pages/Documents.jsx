import React, { useState, useEffect } from "react";
import styles from "../styles/Documents.module.css";

export default function Documents() {
  const [documents, setDocuments] = useState([]);

  // Load saved documents on mount
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("savedDocuments")) || [];
    setDocuments(saved);
  }, []);

  const handleDownload = (doc) => {
    const blob = new Blob([doc.text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${doc.title}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (index) => {
    const updated = documents.filter((_, i) => i !== index);
    setDocuments(updated);
    localStorage.setItem("savedDocuments", JSON.stringify(updated));
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>📂 Saved Documents</h2>
      {documents.length === 0 ? (
        <p className={styles.empty}>No documents saved yet.</p>
      ) : (
        <ul className={styles.list}>
          {documents.map((doc, index) => (
            <li key={index} className={styles.item}>
              <div className={styles.meta}>
                <strong>{doc.title}</strong>
                <small>{new Date(doc.date).toLocaleString()}</small>
              </div>
              <p className={styles.preview}>
                {doc.text.slice(0, 100)}...
              </p>
              <div className={styles.actions}>
                <button onClick={() => handleDownload(doc)}>💾 Download</button>
                <button onClick={() => handleDelete(index)}>🗑️ Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
