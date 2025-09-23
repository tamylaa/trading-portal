# Trading Portal MeiliSearch Scripts

This directory contains scripts specifically for the trading portal's MeiliSearch integration and environment setup.

## Scripts

### `setup-environment-variables.ps1` (Windows PowerShell)
**Purpose**: Sets up environment variables for MeiliSearch integration on Windows systems.

**Features**:
- Windows-specific environment variable configuration
- PowerShell script for Windows environments
- Trading portal specific MeiliSearch settings

**Usage**:
```powershell
.\setup-environment-variables.ps1
```

### `setup-environment-variables.sh` (Linux/Mac Bash)
**Purpose**: Sets up environment variables for MeiliSearch integration on Unix-like systems.

**Features**:
- Cross-platform bash script for Linux/Mac
- Environment variable configuration for MeiliSearch
- Trading portal specific settings

**Usage**:
```bash
./setup-environment-variables.sh
```

### `setup-env-ascii.ps1`
**Purpose**: ASCII-compatible PowerShell script for environment setup with enhanced compatibility.

**Features**:
- Enhanced ASCII compatibility for various terminal environments
- GitHub secrets integration support
- Cross-platform PowerShell compatibility

**Usage**:
```powershell
.\setup-env-ascii.ps1
```

### `test-integration.js`
**Purpose**: Local integration test for trading portal's MeiliSearch functionality.

**Features**:
- Tests trading portal specific MeiliSearch integration
- Local development environment testing
- Quick validation of portal-search connectivity

**Usage**:
```bash
node test-integration.js
```

## Relationship to Other Scripts

- **Main MeiliSearch Scripts**: See `../../meilisearch/scripts/` for comprehensive MeiliSearch ecosystem management
- **Integration Tests**: See `../../tests/integration/` for cross-service integration tests
- **These Scripts**: Focus specifically on trading portal's MeiliSearch setup and local testing

## Environment Setup

1. Run the appropriate setup script for your platform:
   - Windows: `setup-environment-variables.ps1` or `setup-env-ascii.ps1`
   - Linux/Mac: `setup-environment-variables.sh`

2. Test the integration:
   ```bash
   node test-integration.js
   ```

3. For comprehensive testing, use the main test suite:
   ```bash
   cd ../../meilisearch/scripts
   .\meilisearch-test-suite.ps1 -All
   ```