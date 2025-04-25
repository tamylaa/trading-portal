import React from 'react';
import { stories } from '../stories/stories';
import { Link } from 'react-router-dom';

const StoryListPage: React.FC = () => {
  return (
    <div className="story-list-page guide-page">
      <h1>Stories & Build Journeys</h1>
      <div className="story-list">
        {stories.map(story => (
          <div className="story-card" key={story.id}>
            <h2>{story.title}</h2>
            <p>{story.summary}</p>
            <div className="story-meta">
              <span className="story-date">{story.createdAt}</span>
              {story.tags && (
                <span className="story-tags">
                  {story.tags.map(tag => (
                    <span key={tag} className="story-tag">{tag}</span>
                  ))}
                </span>
              )}
            </div>
            <Link to={`/stories/${story.id}`} className="story-read-btn" aria-label={`Read story: ${story.title}`}>Read Story</Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoryListPage;
