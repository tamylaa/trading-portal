// Progress Tracker - Behavioral Psychology Component
import React, { useEffect, useState } from 'react';
import './ProgressTracker.css';

const ProgressTracker = ({ progress, streak, goals }) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  useEffect(() => {
    // Animate progress bar
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [progress]);
  
  const getMotivationalMessage = () => {
    if (progress === 100) return "🎉 Amazing! You've completed all your goals!";
    if (progress >= 75) return "🚀 Almost there! You're doing great!";
    if (progress >= 50) return "💪 Keep it up! You're halfway there!";
    if (progress >= 25) return "📈 Good start! Keep building momentum!";
    return "🌟 Ready to make today productive?";
  };
  
  return (
    <div className="progress-tracker">
      <div className="motivation-message">
        {getMotivationalMessage()}
      </div>
      
      <div className="progress-visualization">
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill"
            style={{ '--progress': `${animatedProgress}%` }}
          />
          <div className="progress-percentage">
            {Math.round(progress)}%
          </div>
        </div>
        
        <div className="progress-goals">
          {goals.map((goal, index) => {
            const goalProgress = (index + 1) * (100 / goals.length);
            const isCompleted = progress >= goalProgress;
            
            return (
              <div 
                key={index}
                className={`goal-item ${isCompleted ? 'completed' : ''}`}
              >
                <span className="goal-icon">
                  {isCompleted ? '✅' : '⏳'}
                </span>
                <span className="goal-text">{goal}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Progress rings for visual appeal */}
      <div className="progress-rings">
        <svg className="progress-ring" width="60" height="60">
          <circle
            className="progress-ring-background"
            cx="30"
            cy="30"
            r="25"
            fill="transparent"
            stroke="#e5e7eb"
            strokeWidth="4"
          />
          <circle
            className="progress-ring-progress"
            cx="30"
            cy="30"
            r="25"
            fill="transparent"
            stroke="#667eea"
            strokeWidth="4"
            strokeLinecap="round"
            style={{
              strokeDasharray: `${2 * Math.PI * 25}`,
              strokeDashoffset: `${2 * Math.PI * 25 * (1 - progress / 100)}`,
              transition: 'stroke-dashoffset 0.5s ease-in-out'
            }}
          />
        </svg>
        <div className="ring-percentage">{Math.round(progress)}%</div>
      </div>
    </div>
  );
};

export default ProgressTracker;
