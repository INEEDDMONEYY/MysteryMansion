// src/components/Toasts/HomeToasts/AgeRequirementToast.jsx
import React, { useState, useEffect } from "react";

export default function AgeRequirementToast({ onOk }) {
  const [showToast, setShowToast] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("ageRequirementToastDismissed");
    if (!dismissed) {
      setShowToast(true); // show only if not dismissed this session
      setTimeout(() => setAnimate(true), 10); // fade-in
    }
  }, []);

  const handleOk = () => {
    setAnimate(false); // fade-out
    setTimeout(() => {
      setShowToast(false);
      sessionStorage.setItem("ageRequirementToastDismissed", "true"); // ✅ session-only
      if (onOk) onOk();
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
        <h2 style={styles.title}>Age Requirement</h2>
        <p style={styles.text}>
          By using this site, you confirm that you are at least 18 years old (or
          meet your region’s minimum age requirement).
        </p>
        <button style={styles.button} onClick={handleOk}>
          OK
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position:"fixed", top:0, left:0, width:"100%", height:"100%", backgroundColor:"rgba(0,0,0,0.5)", display:"flex", justifyContent:"center", alignItems:"center", zIndex:9999 },
  toast: { backgroundColor:"#eba9e7ff", padding:"20px", borderRadius:"8px", maxWidth:"400px", textAlign:"center", boxShadow:"0 4px 12px rgba(0,0,0,0.2)" },
  title: { marginBottom:"10px", fontSize:"18px", fontWeight:"bold" },
  text: { marginBottom:"20px", fontSize:"14px", lineHeight:"1.5" },
  button: { display:"block", margin:"0 auto", padding:"10px 20px", backgroundColor:"#050505ff", color:"#fff", border:"none", borderRadius:"4px", cursor:"pointer" }
};
