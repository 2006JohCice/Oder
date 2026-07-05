import React, { useEffect, useState } from 'react';
import '../css/TopProgressBar.css';

const TopProgressBar = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Tự động tăng progress giả lập
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          return 100;
        }
        const diff = Math.random() * 10;
        return Math.min(oldProgress + diff, 90);
      });
    }, 200);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="top-progress-bar"></div>
  );
};

export default TopProgressBar;
