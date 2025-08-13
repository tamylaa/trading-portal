// Achievements Page - Gamification and Progress Tracking
import React, { useState, useEffect } from 'react';
import './Achievements.css';

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({});
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    loadAchievements();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array is correct for one-time initialization

  const loadAchievements = () => {
    // Mock achievements data - in real app, fetch from API
    const mockAchievements = [
      {
        id: 1,
        title: "First Steps",
        description: "Complete your first upload",
        icon: "🚀",
        earned: true,
        earnedDate: "2025-08-10",
        points: 10
      },
      {
        id: 2,
        title: "Content Creator",
        description: "Upload 10 files",
        icon: "📁",
        earned: true,
        earnedDate: "2025-08-12",
        points: 50
      },
      {
        id: 3,
        title: "Streak Master",
        description: "Login for 7 consecutive days",
        icon: "🔥",
        earned: currentStreak >= 7,
        earnedDate: currentStreak >= 7 ? new Date().toISOString().split('T')[0] : null,
        points: 75
      },
      {
        id: 4,
        title: "Analytics Pro",
        description: "View analytics 25 times",
        icon: "📊",
        earned: false,
        progress: 18,
        total: 25,
        points: 100
      },
      {
        id: 5,
        title: "Social Butterfly",
        description: "Share 5 pieces of content",
        icon: "🦋",
        earned: false,
        progress: 2,
        total: 5,
        points: 60
      },
      {
        id: 6,
        title: "Power User",
        description: "Use all features in one session",
        icon: "⚡",
        earned: false,
        points: 150
      }
    ];
    setAchievements(mockAchievements);
  };

  const loadStats = () => {
    // Mock stats - in real app, fetch from API
    const streakData = JSON.parse(localStorage.getItem('userStreak') || '{"count": 0}');
    setCurrentStreak(streakData.count);
    
    setStats({
      totalPoints: 135,
      level: 3,
      nextLevelPoints: 200,
      uploadsCount: 12,
      analyticsViews: 18,
      sharesCount: 2,
      loginStreak: streakData.count
    });
  };

  const getProgressPercentage = (current, total) => {
    return Math.min(100, (current / total) * 100);
  };

  const getLevelProgress = () => {
    const levelPoints = [0, 50, 100, 200, 350, 500];
    const currentLevel = stats.level || 1;
    const currentLevelMin = levelPoints[currentLevel - 1] || 0;
    const nextLevelMin = levelPoints[currentLevel] || 500;
    const progress = ((stats.totalPoints - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  return (
    <div className="achievements-page">
      <div className="achievements-header">
        <h1>🏆 Your Achievements</h1>
        <p>Track your progress and unlock rewards as you use the platform</p>
      </div>

      {/* User Stats Dashboard */}
      <div className="stats-dashboard">
        <div className="stat-card level-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-info">
            <h3>Level {stats.level}</h3>
            <p>{stats.totalPoints} points</p>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{width: `${getLevelProgress()}%`}}
              ></div>
            </div>
            <span className="progress-text">
              {stats.nextLevelPoints - stats.totalPoints} points to next level
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-info">
            <h3>{stats.loginStreak}</h3>
            <p>Day Login Streak</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📁</div>
          <div className="stat-info">
            <h3>{stats.uploadsCount}</h3>
            <p>Files Uploaded</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-info">
            <h3>{stats.analyticsViews}</h3>
            <p>Analytics Views</p>
          </div>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="achievements-grid">
        <h2>🎯 Achievement Collection</h2>
        <div className="achievements-list">
          {achievements.map(achievement => (
            <div 
              key={achievement.id} 
              className={`achievement-card ${achievement.earned ? 'earned' : 'locked'}`}
            >
              <div className="achievement-icon">
                {achievement.earned ? achievement.icon : '🔒'}
              </div>
              
              <div className="achievement-content">
                <h3 className="achievement-title">{achievement.title}</h3>
                <p className="achievement-description">{achievement.description}</p>
                
                {achievement.earned && achievement.earnedDate && (
                  <p className="earned-date">
                    ✅ Earned on {new Date(achievement.earnedDate).toLocaleDateString()}
                  </p>
                )}
                
                {!achievement.earned && achievement.progress !== undefined && (
                  <div className="achievement-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{width: `${getProgressPercentage(achievement.progress, achievement.total)}%`}}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {achievement.progress} / {achievement.total}
                    </span>
                  </div>
                )}
                
                <div className="achievement-points">
                  💎 {achievement.points} points
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h2>📈 Recent Activity</h2>
        <div className="activity-feed">
          <div className="activity-item">
            <span className="activity-icon">🚀</span>
            <span className="activity-text">You earned "Content Creator" achievement!</span>
            <span className="activity-time">2 days ago</span>
          </div>
          <div className="activity-item">
            <span className="activity-icon">📁</span>
            <span className="activity-text">Uploaded 3 new files</span>
            <span className="activity-time">3 days ago</span>
          </div>
          <div className="activity-item">
            <span className="activity-icon">🔥</span>
            <span className="activity-text">Started a {stats.loginStreak}-day login streak</span>
            <span className="activity-time">1 week ago</span>
          </div>
        </div>
      </div>

      {/* Motivational Footer */}
      <div className="motivation-footer">
        <h3>🎯 Keep Going!</h3>
        <p>
          You're doing great! Complete more actions to unlock new achievements 
          and reach the next level. Every interaction brings you closer to mastery!
        </p>
      </div>
    </div>
  );
};

export default Achievements;
