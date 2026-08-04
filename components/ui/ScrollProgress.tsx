"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const scrollPercent = documentHeight > 0 ? (scrolled / documentHeight) * 100 : 0;
      setProgress(scrollPercent);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 h-0.5 bg-gradient-to-r from-accent-cyan via-accent-purple to-accent-green z-[100]"
      style={{
        width: `${progress}%`,
      }}
      transition={{ duration: 0.1, ease: "easeOut" }}
    />
  );
}
