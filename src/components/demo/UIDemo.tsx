import React, { useEffect, useRef } from 'react';
import DashboardWidget from '../dashboard/DashboardWidget';
import { Link } from 'react-router-dom';

// Import the unified UI API for version 1.1.3+
import { UI } from '@tamyla/ui-components';

const UIDemo: React.FC = () => {
  const searchInterfaceRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const inputsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const contentCardRef = useRef<HTMLDivElement>(null);
  const integrationButtonsRef = useRef<HTMLDivElement>(null);
  const integrationInputsRef = useRef<HTMLDivElement>(null);
  const integrationCardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize search interface using basic Web Component approach
    if (searchInterfaceRef.current) {
      // Mock data for demo
      const mockResults = [
        {
          id: 1,
          title: 'Trading Strategy Alpha',
          content: 'Advanced algorithmic trading strategy for forex markets',
          type: 'strategy',
          tags: ['forex', 'algorithmic']
        },
        {
          id: 2,
          title: 'Market Analysis Report',
          content: 'Comprehensive analysis of current market trends and predictions',
          type: 'report',
          tags: ['analysis', 'market']
        },
        {
          id: 3,
          title: 'Portfolio Optimization',
          content: 'Machine learning based portfolio optimization techniques',
          type: 'tool',
          tags: ['portfolio', 'ml']
        }
      ];

      // Create search interface using the new unified API (v1.1.3+)
      const searchInterface = UI.create('search-interface', {
        enableVoice: true,
        showFilters: true,
        viewMode: 'grid'
      });
      
      searchInterfaceRef.current.appendChild(searchInterface);

      // Wait for the component to be ready and set initial data
      const initializeSearchInterface = () => {
        setTimeout(() => {
          try {
            console.log('Setting initial search interface data...');
            searchInterface.setResults(mockResults, mockResults.length);
            searchInterface.setLoading(false);
          } catch (error) {
            console.error('Error initializing search interface:', error);
          }
        }, 100);
      };

      // Initialize immediately since unified API components are ready right away
      initializeSearchInterface();

      // Handle search events
      searchInterface.addEventListener('tmyl-search-request', (e: any) => {
        console.log('Search request:', e.detail);
        try {
          if (typeof searchInterface.setLoading === 'function') {
            searchInterface.setLoading(true);
          }
          
          setTimeout(() => {
            const filtered = mockResults.filter((item: any) =>
              item.title.toLowerCase().includes(e.detail.query.toLowerCase()) ||
              item.content.toLowerCase().includes(e.detail.query.toLowerCase())
            );
            
            if (typeof searchInterface.setResults === 'function') {
              searchInterface.setResults(filtered, filtered.length);
              searchInterface.setLoading(false);
            }
          }, 500);
        } catch (error) {
          console.error('Error handling search request:', error);
        }
      });
    }

    // Initialize standalone search bar - simplified approach
    if (searchBarRef.current) {
      try {
        const searchBar = UI.create('search-bar', {
          placeholder: 'Search trading portal...',
          voiceEnabled: true,
          clearable: true
        });
        searchBarRef.current.appendChild(searchBar);

        searchBar.addEventListener('tmyl-search', (e: any) => {
          console.log('Search:', e.detail.query);
        });
      } catch (error) {
        console.error('Error creating search bar:', error);
        // Fallback to regular input
        const fallbackInput = document.createElement('input');
        fallbackInput.placeholder = 'Search trading portal... (fallback)';
        fallbackInput.style.cssText = 'width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px;';
        searchBarRef.current.appendChild(fallbackInput);
      }
    }

    // Create button variants - these should work
    if (buttonsRef.current) {
      try {
        const primaryBtn = UI.create('button', { text: 'Primary', variant: 'primary', size: 'md' });
        const secondaryBtn = UI.create('button', { text: 'Secondary', variant: 'secondary', size: 'md' });
        const ghostBtn = UI.create('button', { text: 'Ghost', variant: 'ghost', size: 'md' });
        const successBtn = UI.create('button', { text: 'Success', variant: 'success', size: 'md' });
        const dangerBtn = UI.create('button', { text: 'Danger', variant: 'danger', size: 'md' });

        buttonsRef.current.appendChild(primaryBtn);
        buttonsRef.current.appendChild(secondaryBtn);
        buttonsRef.current.appendChild(ghostBtn);
        buttonsRef.current.appendChild(successBtn);
        buttonsRef.current.appendChild(dangerBtn);
      } catch (error) {
        console.error('Error creating buttons:', error);
      }
    }

    // Create input demo
    if (inputsRef.current) {
      try {
        const emailInput = UI.create('input', {
          label: 'Email Address',
          type: 'email',
          placeholder: 'Enter your email',
          icon: 'email',
          clearable: true,
          required: true
        });
        inputsRef.current.appendChild(emailInput);
      } catch (error) {
        console.error('Error creating input:', error);
      }
    }

    // Create card demo
    if (cardsRef.current) {
      try {
        const sampleCard = UI.create('card', {
          title: 'Sample Card',
          content: 'This is a basic card component with header and content slots.',
          variant: 'elevated',
          padding: 'md',
          hover: true
        });
        cardsRef.current.appendChild(sampleCard);
      } catch (error) {
        console.error('Error creating card:', error);
      }
    }

    // Create content card
    if (contentCardRef.current) {
      try {
        const contentCard = document.createElement('tmyl-content-card');
        contentCard.setAttribute('size', 'default');
        contentCard.setAttribute('selectable', '');
        contentCard.setAttribute('show-actions', '');

        const contentDiv = document.createElement('div');
        contentDiv.setAttribute('slot', 'content');
        contentDiv.innerHTML = `
          <h5>Sample Content</h5>
          <p>This demonstrates the content card molecule with actions and selection.</p>
        `;
        contentCard.appendChild(contentDiv);
        contentCardRef.current.appendChild(contentCard);
      } catch (error) {
        console.error('Error creating content card:', error);
      }
    }

    // Integration buttons
    if (integrationButtonsRef.current) {
      try {
        const uiBtn = UI.create('button', { text: 'UI Platform Button', variant: 'primary' });
        integrationButtonsRef.current.appendChild(uiBtn);
      } catch (error) {
        console.error('Error creating integration button:', error);
      }
    }

    // Integration inputs
    if (integrationInputsRef.current) {
      try {
        const uiInput = UI.create('input', { placeholder: 'UI Platform input', clearable: true });
        integrationInputsRef.current.appendChild(uiInput);
      } catch (error) {
        console.error('Error creating integration input:', error);
      }
    }

    // Integration cards
    if (integrationCardsRef.current) {
      try {
        const uiCard = UI.create('card', {
          title: 'UI Platform Card',
          content: 'Web component card',
          variant: 'outlined',
          padding: 'sm'
        });
        integrationCardsRef.current.appendChild(uiCard);
      } catch (error) {
        console.error('Error creating integration card:', error);
      }
    }
  }, []);

  return (
    <div className="ui-demo-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        Tamyla UI Platform Demo - Trading Portal Integration
      </h1>

      {/* Navigation Section */}
      <DashboardWidget title="Demo Navigation" className="nav-widget">
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <h3>Explore Different UI Approaches</h3>
          <p style={{ marginBottom: '20px' }}>
            Compare Web Components vs React Components implementations
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <Link
              to="/react-demo"
              style={{
                padding: '12px 24px',
                background: '#3B82F6',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '6px',
                fontWeight: '500'
              }}
            >
              🚀 View React Components Demo
            </Link>
            <span style={{ alignSelf: 'center', color: '#666' }}>
              You are currently viewing: Web Components Demo
            </span>
          </div>
        </div>
      </DashboardWidget>

      {/* Overview Section */}
      <DashboardWidget title="UI Platform Overview" className="overview-widget">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h3>🎯 Capabilities</h3>
            <ul>
              <li>Atomic Design Architecture (Atoms, Molecules, Organisms)</li>
              <li>Voice Search Integration</li>
              <li>Responsive Design (Mobile-first)</li>
              <li>Accessibility (WCAG Compliant)</li>
              <li>Customizable Design Tokens</li>
              <li>Event-driven Architecture</li>
              <li>TypeScript Support</li>
              <li>React Integration Ready</li>
            </ul>
          </div>
          <div>
            <h3>⚖️ Constraints & Considerations</h3>
            <ul>
              <li>Web Components (Lit-based) - May have learning curve</li>
              <li>Requires modern browser support</li>
              <li>Bundle size consideration for full library</li>
              <li>Styling integration with existing CSS frameworks</li>
              <li>Event handling patterns differ from React components</li>
              <li>Shadow DOM isolation may affect global styles</li>
            </ul>
          </div>
        </div>
      </DashboardWidget>

      {/* Component Showcase */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '30px' }}>

        {/* Atoms Demo */}
        <DashboardWidget title="Atoms - Basic Building Blocks">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <h4>Buttons</h4>
              <div ref={buttonsRef} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }} />
            </div>

            <div>
              <h4>Inputs</h4>
              <div ref={inputsRef} />
            </div>

            <div>
              <h4>Cards</h4>
              <div ref={cardsRef} />
            </div>
          </div>
        </DashboardWidget>

        {/* Molecules Demo */}
        <DashboardWidget title="Molecules - Composite Components">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <h4>Search Bar</h4>
              <div ref={searchBarRef} />
            </div>

            <div>
              <h4>Content Card</h4>
              <div ref={contentCardRef} />
            </div>
          </div>
        </DashboardWidget>

        {/* Organisms Demo */}
        <DashboardWidget title="Organisms - Complete Interfaces">
          <div>
            <h4>Search Interface</h4>
            <p style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
              Full-featured search interface with voice search, filtering, and results display.
              Try searching for "trading" or "market" to see filtered results.
            </p>
            <div ref={searchInterfaceRef} style={{ minHeight: '400px' }} />
          </div>
        </DashboardWidget>

        {/* Integration Demo */}
        <DashboardWidget title="Integration with Existing Components">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <h4>Mixed Usage</h4>
              <p>UI Platform components can coexist with existing trading portal components:</p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button className="btn btn-primary">Existing Button</button>
              <div ref={integrationButtonsRef} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input className="form-input" placeholder="Existing input" />
              <div ref={integrationInputsRef} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="card" style={{ padding: '10px' }}>
                <h5>Existing Card</h5>
                <p>Traditional CSS-based card</p>
              </div>
              <div ref={integrationCardsRef} />
            </div>
          </div>
        </DashboardWidget>

      </div>

      {/* Migration Strategy */}
      <DashboardWidget title="Migration Strategy" className="migration-widget" style={{ marginTop: '30px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h3>Phase 1: Gradual Adoption</h3>
            <ul>
              <li>Start with atoms (buttons, inputs) in new features</li>
              <li>Use molecules for specific use cases (search bars)</li>
              <li>Maintain existing components for stable areas</li>
              <li>Document integration patterns</li>
            </ul>
          </div>
          <div>
            <h3>Phase 2: Component Migration</h3>
            <ul>
              <li>Replace existing components with UI Platform equivalents</li>
              <li>Implement organisms for complex interfaces</li>
              <li>Update design tokens for consistency</li>
              <li>Train team on new patterns</li>
            </ul>
          </div>
        </div>

        <div style={{ marginTop: '20px', padding: '15px', background: '#f0f8ff', borderRadius: '8px' }}>
          <h4>Benefits of Migration:</h4>
          <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <li>✅ Consistent design language</li>
            <li>✅ Improved accessibility</li>
            <li>✅ Better maintainability</li>
            <li>✅ Enhanced user experience</li>
            <li>✅ Voice search capabilities</li>
            <li>✅ Responsive by default</li>
            <li>✅ TypeScript support</li>
            <li>✅ Modular architecture</li>
          </ul>
        </div>
      </DashboardWidget>

    </div>
  );
};

export default UIDemo;