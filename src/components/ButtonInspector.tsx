// Test component to inspect Button styling
import React from 'react';
import { Button, useTheme } from '@tamyla/ui-components-react';

const ButtonInspector: React.FC = () => {
  const theme = useTheme();

  const handleInspect = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    console.log('Button element:', button);
    console.log('Button classes:', button.className);
    console.log('Button styles:', window.getComputedStyle(button));
    console.log('Button attributes:', Array.from(button.attributes).map(attr => `${attr.name}: ${attr.value}`));
    console.log('Current theme:', theme);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc' }}>
      <h3>Redux-Based Theming Test</h3>
      <p>Current Theme: {theme ? `Mode: ${theme.mode}, Primary: ${theme.primaryColor}` : 'No theme detected'}</p>
      <p>Testing Redux-based theming with @tamyla/ui-components-react v5.0.2</p>

      <div style={{ marginBottom: '20px' }}>
        <h4>Test Button Variants:</h4>
        <Button variant="default" size="sm" onClick={handleInspect}>Default</Button>
        <Button variant="secondary" size="sm" onClick={handleInspect} style={{ marginLeft: '10px' }}>Secondary</Button>
        <Button variant="outline" size="sm" onClick={handleInspect} style={{ marginLeft: '10px' }}>Outline</Button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Test Button Sizes:</h4>
        <Button variant="default" size="xs" onClick={handleInspect}>XS</Button>
        <Button variant="default" size="sm" onClick={handleInspect} style={{ marginLeft: '10px' }}>SM</Button>
        <Button variant="default" size="default" onClick={handleInspect} style={{ marginLeft: '10px' }}>Default</Button>
        <Button variant="default" size="lg" onClick={handleInspect} style={{ marginLeft: '10px' }}>LG</Button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4>Hero Section Button (from actual usage):</h4>
        <Button
          variant="default"
          size="lg"
          onClick={() => window.location.href = '/stories'}
        >
          Explore Stories (Hero Style)
        </Button>
      </div>
    </div>
  );
};

export default ButtonInspector;
