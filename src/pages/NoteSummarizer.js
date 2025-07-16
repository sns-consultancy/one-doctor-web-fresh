import React, { useState } from "react";
import styles from "../styles/NoteSummarizer.module.css";
import { extractTextFromImage } from "../utils/ocr";

export default function NoteSummarizer() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("English");
  const [region, setRegion] = useState("United States - USD");

  // Voice input
  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice recognition not supported in this browser.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.start();
    recognition.onresult = (e) => {
      setInput(e.results[0][0].transcript);
    };
  };

  // Speak the response aloud
  const speakResponse = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    speechSynthesis.speak(utterance);
  };

  // Submit to OpenAI for summarization
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
                "You are an AI assistant that summarizes medical or personal notes clearly.",
            },
            { role: "user", content: input },
          ],
        }),
      });

      if (!res.ok) throw new Error("API request failed.");

      const data = await res.json();
      const text = data.choices[0].message.content;
      setResponse(text);
      speakResponse(text);
    } catch (err) {
      console.error(err);
      setError("Failed to summarize notes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload and OCR
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);

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
      <h2 className={styles.heading}>📝 Note Summarizer</h2>
      <p className={styles.subheading}>
        Paste your notes, record voice, or upload files for summarization.
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
          placeholder="Paste notes to summarize..."
          required
        />

        <div className={styles.buttons}>
          <button
            type="submit"
            disabled={loading}
            className={styles.button}
            aria-label="Summarize Notes"
          >
            {loading ? "Summarizing..." : "Summarize"}
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

      {response && (
        <div className={styles.responseBox}>
          <strong>Summary:</strong>
          <p>{response}</p>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.shareRow}>
        <button aria-label="Email Summary">📧 Email</button>
        <button aria-label="Share via WhatsApp">💬 WhatsApp</button>
        <button aria-label="Send via SMS">📱 SMS</button>
        <button aria-label="Save Locally">💾 Save Locally</button>
        <button aria-label="Save to Documents">📂 Save to Documents</button>
      </div>

      <p className={styles.disclaimer}>
        ⚠️ <strong>Disclaimer:</strong> Summaries are AI-generated and for
        informational purposes only.
      </p>
    </div>
  );
}
