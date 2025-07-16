import React, { useState } from "react";
import styles from "../styles/SymptomChecker.module.css";
import { extractTextFromImage } from "../utils/ocr";

export default function SymptomChecker() {
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
      alert("Voice recognition not supported.");
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
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  // Submit to OpenAI
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
              content: "You are an AI medical assistant that suggests possible causes of symptoms.",
            },
            { role: "user", content: input },
          ],
        }),
      });

      if (!res.ok) throw new Error("API request failed");

      const data = await res.json();
      const text = data.choices[0].message.content;
      setResponse(text);
      speakResponse(text);
    } catch (err) {
      console.error(err);
      setError("Failed to analyze. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Process uploaded files
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(files);

    let allText = "";
    for (const file of files) {
      try {
        const text = await extractTextFromImage(file);
        allText += `\n[File: ${file.name}]\n${text}`;
      } catch (err) {
        console.error(`OCR failed for ${file.name}:`, err);
        allText += `\n[File: ${file.name}] OCR failed.\n`;
      }
    }
    setInput((prev) => prev + "\n" + allText);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>🩺 Symptom Checker</h2>
      <p className={styles.subheading}>
        Enter your symptoms, record voice, or upload files. Results will be translated to your selected language.
      </p>

      <form onSubmit={handleSubmit}>
        <div className={styles.selectRow}>
          <label>
            OCR Language:
            <select value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </label>
          <label>
            Region & Currency:
            <select value={region} onChange={(e) => setRegion(e.target.value)}>
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
          placeholder="Describe your symptoms in detail..."
          required
        />

        <div className={styles.buttons}>
          <button
            type="submit"
            disabled={loading}
            className={styles.button}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
          <button
            type="button"
            onClick={handleVoiceInput}
            className={styles.voiceButton}
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

      {response && (
        <div className={styles.responseBox}>
          <strong>Possible Causes:</strong>
          <p>{response}</p>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.shareRow}>
        <button>📧 Email Doctor</button>
        <button>💬 WhatsApp</button>
        <button>📱 SMS</button>
        <button>💾 Save Locally</button>
        <button>📂 Save to Documents</button>
      </div>

      <p className={styles.disclaimer}>
        ⚠️ <strong>Disclaimer:</strong> This analysis is AI-generated and does not replace professional medical advice.
      </p>
    </div>
  );
}
