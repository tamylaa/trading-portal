// Fixed Content Manager Web Component - Simplified approach
class TamylaContentManager extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Initialize properties with defaults
    this._apiBase = 'https://content.tamyla.com/api/v1/content';
    this._maxFileSize = 25 * 1024 * 1024;
    
    // Internal state
    this.content = [];
    this.isLoading = false;
    this.searchQuery = '';
    this.currentFilter = 'all';
  }
  
  // Property getters and setters for React integration
  get apiBase() {
    const value = this._apiBase || this.getAttribute('api-base') || 'https://content.tamyla.com/api/v1/content';
    console.log('🔍 Getting apiBase:', value);
    return value;
  }
  
  set apiBase(value) {
    console.log('🔧 Setting apiBase to:', value);
    this._apiBase = value;
    // Load content when apiBase is set for the first time
    if (value && !this._initialLoadComplete) {
      this._initialLoadComplete = true;
      console.log('🚀 Loading content with apiBase:', value);
      this.loadContent();
    }
  }
  
  get maxFileSize() {
    return this._maxFileSize || parseInt(this.getAttribute('max-file-size')) || 25 * 1024 * 1024;
  }
  
  set maxFileSize(value) {
    this._maxFileSize = value;
  }
  
  connectedCallback() {
    this.render();
    // Don't load content immediately - wait for React to set apiBase
  }
  
  render() {
    // Split the template into smaller parts to avoid syntax issues
    const styles = this.getStyles();
    const template = this.getTemplate();
    
    this.shadowRoot.innerHTML = styles + template;
    this.setupEventListeners();
  }
  
  getStyles() {
    return `
      <style>
        :host {
          display: block;
          width: 100%;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .content-manager {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .cm-upload-area {
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          padding: 3rem 2rem;
          text-align: center;
          background: #f8fafc;
          cursor: pointer;
          margin-bottom: 2rem;
        }
        
        .cm-upload-area:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }
        
        .cm-upload-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        
        .cm-content-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }
        
        .cm-empty-state {
          text-align: center;
          padding: 3rem 2rem;
          color: #6b7280;
        }
        
        .cm-loading {
          text-align: center;
          padding: 2rem;
        }
        
        .hidden {
          display: none;
        }
      </style>
    `;
  }
  
  getTemplate() {
    return `
      <div class="content-manager">
        <div class="cm-upload-area" id="uploadArea">
          <div class="cm-upload-icon">📁</div>
          <div>
            <p><strong>Drop files here</strong> or <span style="color: #3b82f6; text-decoration: underline;">Browse Files</span></p>
            <p>Support: Images, Videos, PDFs, Documents (Max 25MB)</p>
          </div>
          <input type="file" multiple accept="image/*,video/*,audio/*,.pdf,.doc,.docx" id="fileInput" style="display: none;">
        </div>
        
        <div class="cm-gallery">
          <div class="cm-content-grid" id="contentGrid">
            <div class="cm-empty-state">
              <div style="font-size: 4rem; margin-bottom: 1rem;">📁</div>
              <h4>No content yet</h4>
              <p>Upload your first file to get started</p>
            </div>
          </div>
        </div>
        
        <div class="cm-loading hidden" id="loading">
          <p>Loading content...</p>
        </div>
      </div>
    `;
  }
  
  setupEventListeners() {
    const uploadArea = this.shadowRoot.getElementById('uploadArea');
    const fileInput = this.shadowRoot.getElementById('fileInput');
    
    uploadArea.addEventListener('click', () => {
      fileInput.click();
    });
    
    uploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '#3b82f6';
    });
    
    uploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      uploadArea.style.borderColor = '#cbd5e1';
      this.handleFiles(e.dataTransfer.files);
    });
    
    fileInput.addEventListener('change', (e) => {
      this.handleFiles(e.target.files);
    });
  }
  
  async handleFiles(files) {
    for (const file of Array.from(files)) {
      if (file.size > this.maxFileSize) {
        console.error('File too large:', file.name);
        continue;
      }
      await this.uploadFile(file);
    }
  }
  
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('🔗 Upload API URL:', this.apiBase + '/upload');
    
    try {
      this.showLoading(true);
      
      const response = await fetch(this.apiBase + '/upload', {
        method: 'POST',
        body: formData,
        headers: this.authToken ? { 'Authorization': 'Bearer ' + this.authToken } : {}
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('Upload successful:', file.name);
        this.loadContent();
        this.dispatchEvent(new CustomEvent('content-uploaded', {
          detail: result.content,
          bubbles: true
        }));
      } else {
        console.error('Upload failed:', result.error);
      }
    } catch (error) {
      console.error('Upload error:', error.message);
    } finally {
      this.showLoading(false);
    }
  }
  
  async loadContent() {
    console.log('🔗 Load API URL:', this.apiBase + '/library');
    this.showLoading(true);
    
    try {
      const headers = this.authToken ? { 'Authorization': 'Bearer ' + this.authToken } : {};
      const response = await fetch(this.apiBase + '/library', { headers });
      const result = await response.json();
      
      if (result.success) {
        this.content = result.content || [];
        this.renderGallery();
      }
    } catch (error) {
      console.error('Load content error:', error.message);
    } finally {
      this.showLoading(false);
    }
  }
  
  renderGallery() {
    const grid = this.shadowRoot.getElementById('contentGrid');
    
    if (this.content.length === 0) {
      grid.innerHTML = `
        <div class="cm-empty-state">
          <div style="font-size: 4rem; margin-bottom: 1rem;">📁</div>
          <h4>No content yet</h4>
          <p>Upload your first file to get started</p>
        </div>
      `;
      return;
    }
    
    grid.innerHTML = this.content.map(item => `
      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="height: 120px; background: #f9fafb; display: flex; align-items: center; justify-content: center;">
          ${item.category === 'image' 
            ? '<img src="' + item.file_url + '" alt="' + item.original_filename + '" style="width: 100%; height: 100%; object-fit: cover;">'
            : '<div style="font-size: 2rem;">📄</div>'
          }
        </div>
        <div style="padding: 0.75rem;">
          <div style="font-weight: 500; font-size: 0.875rem; margin-bottom: 0.25rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${item.original_filename}
          </div>
          <div style="font-size: 0.75rem; color: #6b7280;">
            ${this.formatFileSize(item.file_size)} • ${new Date(item.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    `).join('');
  }
  
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  showLoading(show) {
    const loading = this.shadowRoot.getElementById('loading');
    if (show) {
      loading.classList.remove('hidden');
    } else {
      loading.classList.add('hidden');
    }
  }
  
  // Property setters for React integration
  set authToken(token) { 
    console.log('🔑 Setting authToken:', token ? 'Token received' : 'No token'); 
    this._authToken = token; 
  }
  get authToken() { 
    console.log('🔑 Getting authToken:', this._authToken ? 'Token available' : 'No token');
    return this._authToken; 
  }
  
  set currentUser(user) { this._currentUser = user; }
  get currentUser() { return this._currentUser; }
}

customElements.define('tamyla-content-manager', TamylaContentManager);
