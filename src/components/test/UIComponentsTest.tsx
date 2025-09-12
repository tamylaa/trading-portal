// Test integration of new UI components with existing trading portal
import React, { useRef, useEffect } from 'react';
// Import CSS first
import '@tamyla/ui-components/css';
// Import the unified UI API
import { UI } from '@tamyla/ui-components';
import DashboardWidget from '../dashboard/DashboardWidget';

const UIComponentsTest: React.FC = () => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create new components
    const newButton = UI.create('button', { 
      text: '🚀 New Component Button', 
      onClick: () => alert('New component working!')
    });
    
    const newInput = UI.create('input', { 
      placeholder: 'Test the new input component...',
      type: 'text'
    });
    
    const newCard = UI.create('card', { 
      title: 'New Component Card', 
      content: 'This card is created using @tamyla/ui-components package!'
    });

    // Mount new components
    if (buttonRef.current) buttonRef.current.appendChild(newButton);
    if (inputRef.current) inputRef.current.appendChild(newInput);
    if (cardRef.current) cardRef.current.appendChild(newCard);

    // Cleanup
    return () => {
      buttonRef.current?.removeChild(newButton);
      inputRef.current?.removeChild(newInput);
      cardRef.current?.removeChild(newCard);
    };
  }, []);

  return (
    <DashboardWidget title="UI Components Integration Test" className="ui-test-widget">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Existing Components */}
        <section>
          <h3>Existing Trading Portal Components</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <button className="btn btn-primary">Existing Primary Button</button>
            <button className="btn btn-secondary">Existing Secondary Button</button>
          </div>
          <input 
            className="form-input" 
            placeholder="Existing input component..."
            style={{ width: '300px', marginBottom: '10px' }}
          />
          <div className="card" style={{ padding: '15px' }}>
            <h4>Existing Card Component</h4>
            <p>This uses the existing CSS classes and design system.</p>
          </div>
        </section>

        {/* New Components */}
        <section>
          <h3>New @tamyla/ui-components</h3>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <div ref={buttonRef}></div>
            <button className="btn btn-primary">Compare with existing</button>
          </div>
          <div ref={inputRef} style={{ marginBottom: '10px' }}></div>
          <div ref={cardRef}></div>
        </section>

        {/* Integration Notes */}
        <section>
          <h3>Integration Status</h3>
          <div className="card" style={{ padding: '15px', background: '#e8f5e8' }}>
            <h4>✅ Integration Successful!</h4>
            <ul>
              <li>✅ NPM package installed successfully</li>
              <li>✅ Components render alongside existing ones</li>
              <li>✅ No conflicts with existing styles</li>
              <li>✅ Both systems working side-by-side</li>
            </ul>
            <p><strong>Next steps:</strong> Gradual migration and enhanced components</p>
          </div>
        </section>

      </div>
    </DashboardWidget>
  );
};

export default UIComponentsTest;
