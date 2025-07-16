import React, { useState } from "react";
import styles from "../styles/AiHistory.module.css";
import { extractTextFromFile } from "../utils/extractText";

export default function AiHistory() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("eng");
  const [selectedRegion, setSelectedRegion] = useState("US-USD");
  const [isRecording, setIsRecording] = useState(false);
  const [textOutput, setTextOutput] = useState("");

  const languageMap = {
    eng: "en-US",
    hin: "hi-IN",
    tel: "te-IN",
    spa: "es-ES",
    fra: "fr-FR",
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice recognition not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = languageMap[selectedLanguage] || "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = (e) => {
      console.error("Speech recognition error:", e);
      setIsRecording(false);
      alert("Voice input failed. Please try again.");
    };
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setIsRecording(false);
    };

    recognition.start();
  };

  const speakResponse = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = languageMap[selectedLanguage] || "en-US";
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
              content: `You are an AI assistant that explains and summarizes medical history. Translate the result into the user's selected language: ${selectedLanguage}.`,
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
      setError("Failed to process request. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    let allText = "";
    for (const file of files) {
      try {
        const text = await extractTextFromFile(file, selectedLanguage);
        allText += `\n[File: ${file.name}]\n${text}\n`;
      } catch (err) {
        console.error(`Error reading ${file.name}:`, err);
        allText += `\n[File: ${file.name}] Text extraction failed: ${err.message}\n`;
      }
    }
    setInput((prev) => prev + "\n" + allText);
    setTextOutput(allText);
  };

  const handleEmail = (text) => {
    const subject = encodeURIComponent("My Medical History Summary");
    const body = encodeURIComponent(text);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleWhatsApp = (text) => {
    const message = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const handleSMS = (text) => {
    const message = encodeURIComponent(text);
    window.location.href = `sms:?body=${message}`;
  };

  const handleDownload = (text) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "medical_summary.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveToDocs = () => {
    const title = prompt("Enter a title for this document:");
    if (!title) return;

    const saved = JSON.parse(localStorage.getItem("savedDocuments")) || [];
    saved.push({
      title,
      text: response,
      date: new Date().toISOString(),
    });

    localStorage.setItem("savedDocuments", JSON.stringify(saved));
    alert("Document saved successfully!");
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>📋 AI Medical History</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
          className={styles.input}
          placeholder="Enter your medical history here..."
          required
        />
        <div className={styles.buttons}>
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? "Analyzing..." : "Analyze"}
          </button>
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`${styles.voiceButton} ${isRecording ? styles.recording : ""}`}
          >
            {isRecording ? "🎙️ Listening..." : "🎤 Voice Input"}
          </button>
        </div>
      </form>

      <div className={styles.fileUpload}>
        <label>
          Upload Files:
          <input
            type="file"
            accept=".pdf,image/*"
            multiple
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {textOutput && (
        <div className={styles.responseBox}>
          <strong>Extracted Text:</strong>
          <pre>{textOutput}</pre>
        </div>
      )}
      {response && (
        <div className={styles.responseBox}>
          <strong>AI Insights:</strong>
          <p>{response}</p>
        </div>
      )}
      {error && <p className={styles.error}>{error}</p>}

      <p className={styles.disclaimer}>
        ⚠️ <strong>Disclaimer:</strong> Summaries are AI-generated and do not replace professional advice.
      </p>
    </div>
  );
}
