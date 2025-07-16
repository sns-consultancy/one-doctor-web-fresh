import React, { useState } from "react";
import styles from "../styles/SymptomChecker.module.css";
import { extractTextFromImage } from "../utils/ocr";

export default function SymptomChecker() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // const [uploadedFiles, setUploadedFiles] = useState([]); // Currently unused
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
    // setUploadedFiles(files); // Uncomment if you plan to display the files

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

  // Email sharing
  const handleEmail = () => {
    if (!response) return;
    const subject = encodeURIComponent("Symptom Analysis Report");
    const body = encodeURIComponent(response);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // WhatsApp sharing
  const handleWhatsApp = () => {
    if (!response) return;
    const message = encodeURIComponent(response);
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  // SMS sharing
  const handleSMS = () => {
    if (!response) return;
    const message = encodeURIComponent(response);
    window.location.href = `sms:?body=${message}`;
  };

  // Download text file
  const handleDownload = () => {
    if (!response) return;
    const blob = new Blob([response], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "symptom_analysis.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save to local storage
  const handleSaveToDocs = () => {
    if (!response) return;
    const title = prompt("Enter a title for this report:");
    if (!title) return;
    const saved = JSON.parse(localStorage.getItem("savedSymptomReports")) || [];
    saved.push({
      title,
      text: response,
      date: new Date().toISOString(),
    });
    localStorage.setItem("savedSymptomReports", JSON.stringify(saved));
    alert("Report saved successfully!");
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
        <button onClick={handleEmail}>📧 Email</button>
        <button onClick={handleWhatsApp}>💬 WhatsApp</button>
        <button onClick={handleSMS}>📱 SMS</button>
        <button onClick={handleDownload}>📂 Download</button>
        <button onClick={handleSaveToDocs}>💾 Save to Documents</button>
      </div>

      <p className={styles.disclaimer}>
        ⚠️ <strong>Disclaimer:</strong> This analysis is AI-generated and does not replace professional medical advice.
      </p>
    </div>
  );
}
