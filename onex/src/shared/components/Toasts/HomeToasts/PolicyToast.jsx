// src/components/Toasts/HomeToasts/PolicyToast.jsx
import React, { useState, useEffect } from "react";

export default function PolicyToast({ onOk }) {
  const [showToast, setShowToast] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("policyToastDismissed");
    if (!dismissed) {
      setShowToast(true); // show only if not dismissed this session
      setTimeout(() => setAnimate(true), 10); // fade-in
    }
  }, []);

  const handleOk = () => {
    setAnimate(false); // fade-out
    setTimeout(() => {
      setShowToast(false);
      sessionStorage.setItem("policyToastDismissed", "true"); // ✅ session-only
      if (onOk) onOk(); // trigger AgeRequirementToast
    }, 300);
  };

  if (!showToast) return null;

  return (
    <div style={styles.overlay}>
      <div
        style={{
          ...styles.toast,
          opacity: animate ? 1 : 0,
          transform: animate ? "translateY(0)" : "translateY(-20px)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}
      >
        <h2 style={styles.title}>Community Guidelines</h2>
        <p style={styles.text}>
          Please keep interactions respectful, avoid harmful content, and follow
          our community rules. Violations may result in content removal or
          account restrictions.
        </p>
        <button style={styles.button} onClick={handleOk}>
          OK
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  toast: {
    backgroundColor: "#eba9e7ff",
    padding: "20px",
    borderRadius: "8px",
    maxWidth: "400px",
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
  title: {
    marginBottom: "10px",
    fontSize: "18px",
    fontWeight: "bold",
  },
  text: {
    marginBottom: "20px",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  button: {
    display: "block",
    margin: "0 auto",
    padding: "10px 20px",
    backgroundColor: "#242525ff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
