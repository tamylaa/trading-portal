import { LitElement, css, html } from 'lit';

/**
 * Tamyla UI Components - Modern Web Components Architecture
 * 
 * This file demonstrates how to move from the current JavaScript class
 * to a proper Web Components architecture that can be used across
 * Trading Portal, Campaign Engine, and future applications.
 */


/**
 * Content Manager Web Component
 * Replaces the ContentManager.js class with a proper web component
 */
class TamylaContentManager extends LitElement {
  static styles = css`
    /* Component styles - scoped to this component */
    :host {
      display: block;
      width: 100%;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .content-manager {
      width: 100%;
      max-width: var(--content-manager-max-width, 1200px);
      margin: 0 auto;
    }

    .cm-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-color, #e1e5e9);
    }

    .cm-upload-area {
      border: 2px dashed var(--border-color, #cbd5e1);
      border-radius: 12px;
      padding: 3rem 2rem;
      text-align: center;
      background: var(--upload-bg, #f8fafc);
      transition: all 0.2s ease;
      cursor: pointer;
      margin-bottom: 2rem;
    }

    .cm-upload-area:hover,
    .cm-upload-area.dragover {
      border-color: var(--primary-color, #3b82f6);
      background: var(--upload-hover-bg, #eff6ff);
      transform: translateY(-2px);
    }

    .cm-content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .cm-content-item {
      background: white;
      border: 1px solid var(--border-color, #e5e7eb);
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .cm-content-item:hover {
      border-color: var(--primary-color, #3b82f6);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .cm-content-item.selected {
      border-color: var(--success-color, #10b981);
      background: var(--success-bg, #f0fdf4);
    }

    @media (max-width: 768px) {
      .cm-content-grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      }
    }
  `;

  // Define static properties
  static get properties() {
    return {
      apiBase: { type: String, attribute: 'api-base' },
      selectionMode: { type: Boolean, attribute: 'selection-mode' },
      showUpload: { type: Boolean, attribute: 'show-upload' },
      showGallery: { type: Boolean, attribute: 'show-gallery' },
      showSearch: { type: Boolean, attribute: 'show-search' },
      maxFileSize: { type: Number, attribute: 'max-file-size' },
      content: { type: Array, state: true },
      selectedContent: { type: Object, state: true },
      isLoading: { type: Boolean, state: true },
      searchQuery: { type: String, state: true },
      currentFilter: { type: String, state: true }
    };
  }

  constructor() {
    super();
    // Component properties (attributes)
    this.apiBase = '/api/content';
    this.selectionMode = false;
    this.showUpload = true;
    this.showGallery = true;
    this.showSearch = true;
    this.maxFileSize = 25 * 1024 * 1024; // 25MB

    // Internal state
    this.content = [];
    this.selectedContent = new Set();
    this.isLoading = false;
    this.searchQuery = '';
    this.currentFilter = 'all';
  }

  connectedCallback() {
    super.connectedCallback();
    this.loadContent();
  }

  render() {
    return html`
      <div class="content-manager">
        ${this.renderHeader()}
        ${this.showUpload ? this.renderUploadArea() : ''}
        ${this.showSearch ? this.renderSearchBar() : ''}
        ${this.showGallery ? this.renderGallery() : ''}
        ${this.renderLoadingSpinner()}
      </div>
    `;
  }

  renderHeader() {
    const selectionCount = this.selectedContent.size;
    return html`
      <div class="cm-header">
        <h3>Content Library</h3>
        <div class="cm-header-actions">
          ${this.selectionMode && selectionCount > 0 ? html`
            <span class="cm-selection-count">${selectionCount} selected</span>
            <button @click=${this.useSelectedContent} ?disabled=${selectionCount === 0}>
              Use Selected (${selectionCount})
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }

  renderUploadArea() {
    return html`
      <div class="cm-upload-area" 
           @dragover=${this.handleDragOver}
           @dragleave=${this.handleDragLeave}
           @drop=${this.handleDrop}
           @click=${this.openFileDialog}>
        <div class="cm-upload-icon">📁</div>
        <div class="cm-upload-text">
          <p><strong>Drop files here</strong> or <span>Browse Files</span></p>
          <p>Support: Images, Videos, PDFs, Documents (Max 25MB)</p>
        </div>
        <input type="file" 
               multiple 
               accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
               @change=${this.handleFileSelect}
               style="display: none;">
      </div>
    `;
  }

  renderSearchBar() {
    return html`
      <div class="cm-search-bar">
        <input type="text" 
               placeholder="Search content..."
               .value=${this.searchQuery}
               @input=${this.handleSearch}>
        <div class="cm-filter-tabs">
          <button class=${this.currentFilter === 'all' ? 'active' : ''} 
                  @click=${() => this.setFilter('all')}>All</button>
          <button class=${this.currentFilter === 'image' ? 'active' : ''} 
                  @click=${() => this.setFilter('image')}>Images</button>
          <button class=${this.currentFilter === 'video' ? 'active' : ''} 
                  @click=${() => this.setFilter('video')}>Videos</button>
          <button class=${this.currentFilter === 'document' ? 'active' : ''} 
                  @click=${() => this.setFilter('document')}>Documents</button>
        </div>
      </div>
    `;
  }

  renderGallery() {
    const filteredContent = this.getFilteredContent();
    
    if (filteredContent.length === 0) {
      return html`
        <div class="cm-empty-state">
          <div class="cm-empty-icon">📁</div>
          <h4>No content yet</h4>
          <p>Upload your first file to get started</p>
        </div>
      `;
    }

    return html`
      <div class="cm-gallery">
        <div class="cm-content-grid">
          ${filteredContent.map(item => this.renderContentItem(item))}
        </div>
      </div>
    `;
  }

  renderContentItem(content) {
    const isSelected = this.selectedContent.has(content.id);
    return html`
      <div class="cm-content-item ${isSelected ? 'selected' : ''}"
           @click=${() => this.handleContentClick(content)}>
        ${this.selectionMode ? html`
          <div class="cm-content-select">
            <input type="checkbox" .checked=${isSelected}>
          </div>
        ` : ''}
        
        <div class="cm-content-preview">
          ${this.renderContentThumbnail(content)}
        </div>
        
        <div class="cm-content-info">
          <div class="cm-content-name">${content.original_filename}</div>
          <div class="cm-content-meta">
            <span>${this.formatFileSize(content.file_size)}</span>
            <span>${new Date(content.created_at).toLocaleDateString()}</span>
          </div>
          <div class="cm-content-category">${content.category}</div>
        </div>
      </div>
    `;
  }

  renderContentThumbnail(content) {
    if (content.category === 'image') {
      return html`<img src="${content.file_url}" alt="${content.original_filename}">`;
    } else if (content.category === 'video') {
      return html`
        <div class="cm-video-thumbnail">
          <video src="${content.file_url}" preload="metadata"></video>
          <div class="cm-play-overlay">▶️</div>
        </div>
      `;
    } else {
      return html`
        <div class="cm-file-thumbnail">
          <div class="cm-file-icon">${this.getFileIcon(content.category)}</div>
        </div>
      `;
    }
  }

  renderLoadingSpinner() {
    return this.isLoading ? html`
      <div class="cm-loading">
        <div class="cm-spinner"></div>
        <p>Loading content...</p>
      </div>
    ` : '';
  }

  // Event handlers
  handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  }

  handleDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      e.currentTarget.classList.remove('dragover');
    }
  }

  handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    this.handleFiles(e.dataTransfer.files);
  }

  openFileDialog() {
    const input = this.shadowRoot.querySelector('input[type="file"]');
    input.click();
  }

  handleFileSelect(e) {
    this.handleFiles(e.target.files);
  }

  handleSearch(e) {
    this.searchQuery = e.target.value;
  }

  setFilter(filter) {
    this.currentFilter = filter;
  }

  handleContentClick(content) {
    if (this.selectionMode) {
      this.toggleContentSelection(content.id);
    } else {
      this.showContentPreview(content);
    }
  }

  // Business logic methods
  async handleFiles(files) {
    for (const file of Array.from(files)) {
      if (file.size > this.maxFileSize) {
        this.showError(`File ${file.name} is too large. Maximum size is 25MB.`);
        continue;
      }
      await this.uploadFile(file);
    }
  }

  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${this.apiBase}/upload`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        this.showSuccess(`${file.name} uploaded successfully`);
        this.loadContent(); // Refresh content list
        this.dispatchEvent(new CustomEvent('content-uploaded', {
          detail: result.content,
          bubbles: true
        }));
      } else {
        this.showError(result.error || 'Upload failed');
      }
    } catch (error) {
      this.showError('Upload failed: ' + error.message);
    }
  }

  async loadContent() {
    this.isLoading = true;

    try {
      const response = await fetch(`${this.apiBase}/library`);
      const result = await response.json();

      if (result.success) {
        this.content = result.content;
      } else {
        this.showError('Failed to load content');
      }
    } catch (error) {
      this.showError('Failed to load content: ' + error.message);
    } finally {
      this.isLoading = false;
    }
  }

  toggleContentSelection(contentId) {
    if (this.selectedContent.has(contentId)) {
      this.selectedContent.delete(contentId);
    } else {
      this.selectedContent.add(contentId);
    }
    this.requestUpdate(); // Trigger re-render
  }

  useSelectedContent() {
    const selectedItems = this.content.filter(item => 
      this.selectedContent.has(item.id)
    );

    this.dispatchEvent(new CustomEvent('content-selected', {
      detail: selectedItems,
      bubbles: true
    }));

    // Clear selection
    this.selectedContent.clear();
    this.requestUpdate();
  }

  getFilteredContent() {
    let filtered = this.content;

    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.original_filename.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(item => item.category === this.currentFilter);
    }

    return filtered;
  }

  getFileIcon(category) {
    const icons = {
      document: '📄',
      audio: '🎵',
      image: '🖼️',
      video: '🎬'
    };
    return icons[category] || '📁';
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type) {
    this.dispatchEvent(new CustomEvent('show-notification', {
      detail: { message, type },
      bubbles: true
    }));
  }

  showContentPreview(content) {
    this.dispatchEvent(new CustomEvent('content-preview', {
      detail: content,
      bubbles: true
    }));
  }
}

// Register the component
customElements.define('tamyla-content-manager', TamylaContentManager);

export { TamylaContentManager };
//# sourceMappingURL=content-manager.js.map
