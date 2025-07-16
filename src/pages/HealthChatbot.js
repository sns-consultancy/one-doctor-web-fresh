import React, { useState } from "react";
import styles from "../styles/HealthChatbot.module.css";
import { extractTextFromImage } from "../utils/ocr";

export default function HealthChatbot() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [language, setLanguage] = useState("English");
  const [region, setRegion] = useState("United States - USD");

  // Voice input
  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
    recognition.onresult = (e) => {
      setInput(e.results[0][0].transcript);
    };
  };

  // Speak response
  const speakResponse = (text) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResponse("");

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content:
                "You are a compassionate health assistant. You never prescribe medications, only provide suggestions and over-the-counter advice."
            },
            { role: "user", content: input },
          ],
        }),
      });

      if (!res.ok) throw new Error("API request failed");

      const data = await res.json();
      const aiText = data.choices[0].message.content;
      setResponse(aiText);
      speakResponse(aiText);
    } catch (err) {
      console.error(err);
      setError("Failed to get response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(files);

    let allText = "";
    for (const file of files) {
      if (file.type.startsWith("image/")) {
        const text = await extractTextFromImage(file);
        allText += `\n[Image: ${file.name}]\n${text}`;
      } else {
        allText += `\n[File: ${file.name}] (file preview not implemented here)`;
      }
    }
    setInput((prev) => prev + "\n" + allText);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>💬 Health Chatbot</h2>
      <p className={styles.subheading}>
        Ask your health-related questions, record voice, or upload files.
      </p>

      <form onSubmit={handleSubmit}>
        <div className={styles.selectRow}>
          <label>
            OCR Language:
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </label>
          <label>
            Region & Currency:
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option>United States - USD</option>
              <option>Europe - EUR</option>
              <option>India - INR</option>
            </select>
          </label>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
          className={styles.input}
          placeholder="Describe your symptoms or ask a question..."
          required
        />

        <div className={styles.buttons}>
          <button
            type="submit"
            disabled={loading}
            className={styles.button}
            aria-label="Submit Question"
          >
            {loading ? "Processing..." : "Ask"}
          </button>
          <button
            type="button"
            onClick={handleVoiceInput}
            className={styles.voiceButton}
            aria-label="Voice Input"
          >
            🎤 Voice Input
          </button>
        </div>

        <div className={styles.fileUpload}>
          <label>
            Upload Files (PDFs, Images, Videos):
            <input
              type="file"
              accept=".pdf,image/*,video/*"
              multiple
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </form>

      {uploadedFiles.length > 0 && (
        <div className={styles.uploadPreview}>
          <strong>Files:</strong>
          <ul>
            {uploadedFiles.map((f, i) => (
              <li key={i}>{f.name}</li>
            ))}
          </ul>
        </div>
      )}

      {response && (
        <div className={styles.responseBox}>
          <strong>AI Response:</strong>
          <p>{response}</p>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.shareRow}>
        <button aria-label="Email Response">📧 Email</button>
        <button aria-label="Share via WhatsApp">💬 WhatsApp</button>
        <button aria-label="Send via SMS">📱 SMS</button>
        <button aria-label="Save Locally">💾 Save Locally</button>
        <button aria-label="Save to Documents">📂 Save to Documents</button>
      </div>

      <p className={styles.disclaimer}>
        ⚠️ <strong>Disclaimer:</strong> This AI does not provide medical diagnoses or prescriptions. Always consult a healthcare professional.
      </p>
    </div>
  );
}
