// Simple test component to verify loading
class TestComponent extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div style="border: 2px solid green; padding: 20px; margin: 10px;">
        <h3>✅ Web Component Loaded Successfully!</h3>
        <p>If you can see this, web components are working.</p>
        <button onclick="alert('Button clicked!')">Test Button</button>
      </div>
    `;
  }
}

customElements.define('test-component', TestComponent);
