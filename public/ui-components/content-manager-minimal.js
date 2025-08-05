// Minimal test component to isolate syntax issues
class TamylaContentManager extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<div style="border: 2px solid red; padding: 20px;">TEST COMPONENT LOADED</div>';
  }
}

customElements.define('tamyla-content-manager', TamylaContentManager);
