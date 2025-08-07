@echo off
echo ========================================
echo Lumora v2 - Bootstrap Setup Script
echo ========================================
echo.

echo [1/5] Installing missing packages only...
echo Installing Bootstrap and required packages...
call npm install bootstrap @ng-bootstrap/ng-bootstrap
if %errorlevel% neq 0 (
    echo ❌ Package installation failed!
    pause
    exit /b 1
)
echo ✓ Packages installed successfully
echo.

echo [2/5] Creating core directory structure...
if not exist "src\app\core\services" mkdir "src\app\core\services"
if not exist "src\app\core\guards" mkdir "src\app\core\guards"
if not exist "src\app\core\interceptors" mkdir "src\app\core\interceptors"
if not exist "src\app\core\models" mkdir "src\app\core\models"
echo ✓ Core directories created
echo.

echo [3/5] Creating shared directory structure...
if not exist "src\app\shared\components" mkdir "src\app\shared\components"
if not exist "src\app\shared\interfaces" mkdir "src\app\shared\interfaces"
if not exist "src\app\shared\constants" mkdir "src\app\shared\constants"
if not exist "src\app\shared\directives" mkdir "src\app\shared\directives"
if not exist "src\app\shared\pipes" mkdir "src\app\shared\pipes"
if not exist "src\app\shared\utils" mkdir "src\app\shared\utils"
echo ✓ Shared directories created
echo.

echo [4/5] Creating features directory structure...
if not exist "src\app\features\search" mkdir "src\app\features\search"
if not exist "src\app\features\chat" mkdir "src\app\features\chat"
if not exist "src\app\features\auth" mkdir "src\app\features\auth"
if not exist "src\app\features\settings" mkdir "src\app\features\settings"
if not exist "src\app\features\dashboard" mkdir "src\app\features\dashboard"
echo ✓ Features directories created
echo.

echo [5/5] Creating layout directory structure...
if not exist "src\app\layout\header" mkdir "src\app\layout\header"
if not exist "src\app\layout\sidebar" mkdir "src\app\layout\sidebar"
if not exist "src\app\layout\footer" mkdir "src\app\layout\footer"
if not exist "src\app\layout\main" mkdir "src\app\layout\main"
if not exist "src\app\layout\mobile" mkdir "src\app\layout\mobile"
echo ✓ Layout directories created
echo.

echo ========================================
echo Creating Core Components...
echo ========================================

echo Creating Core Services...
call ng generate service core/services/api --skip-tests
call ng generate service core/services/auth --skip-tests
call ng generate service core/services/search --skip-tests
call ng generate service core/services/chat --skip-tests
call ng generate service core/services/storage --skip-tests
call ng generate service core/services/notification --skip-tests
echo ✓ Core services created
echo.

echo Creating Core Guards...
call ng generate guard core/guards/auth --skip-tests
call ng generate guard core/guards/role --skip-tests
echo ✓ Core guards created
echo.

echo Creating Core Interceptors...
call ng generate interceptor core/interceptors/auth --skip-tests
call ng generate interceptor core/interceptors/error --skip-tests
call ng generate interceptor core/interceptors/loading --skip-tests
echo ✓ Core interceptors created
echo.

echo ========================================
echo Creating Shared Components...
echo ========================================

echo Creating Shared Components...
call ng generate component shared/components/loading-spinner --skip-tests
call ng generate component shared/components/error-message --skip-tests
call ng generate component shared/components/empty-state --skip-tests
call ng generate component shared/components/confirmation-dialog --skip-tests
call ng generate component shared/components/file-upload --skip-tests
call ng generate component shared/components/search-input --skip-tests
call ng generate component shared/components/result-card --skip-tests
call ng generate component shared/components/chat-message --skip-tests
call ng generate component shared/components/user-avatar --skip-tests
call ng generate component shared/components/notification-toast --skip-tests
echo ✓ Shared components created
echo.

echo Creating Shared Directives...
call ng generate directive shared/directives/click-outside --skip-tests
call ng generate directive shared/directives/debounce --skip-tests
call ng generate directive shared/directives/auto-focus --skip-tests
call ng generate directive shared/directives/infinite-scroll --skip-tests
echo ✓ Shared directives created
echo.

echo Creating Shared Pipes...
call ng generate pipe shared/pipes/format-date --skip-tests
call ng generate pipe shared/pipes/truncate --skip-tests
call ng generate pipe shared/pipes/safe-html --skip-tests
call ng generate pipe shared/pipes/file-size --skip-tests
echo ✓ Shared pipes created
echo.

echo ========================================
echo Creating Feature Components...
echo ========================================

echo Creating Search Feature...
call ng generate component features/search/search-page --skip-tests
call ng generate component features/search/search-bar --skip-tests
call ng generate component features/search/search-results --skip-tests
call ng generate component features/search/search-filters --skip-tests
call ng generate component features/search/search-suggestions --skip-tests
call ng generate component features/search/search-history --skip-tests
echo ✓ Search components created
echo.

echo Creating Chat Feature...
call ng generate component features/chat/chat-page --skip-tests
call ng generate component features/chat/chat-interface --skip-tests
call ng generate component features/chat/chat-message --skip-tests
call ng generate component features/chat/chat-input --skip-tests
call ng generate component features/chat/chat-sessions --skip-tests
call ng generate component features/chat/chat-sidebar --skip-tests
echo ✓ Chat components created
echo.

echo Creating Auth Feature...
call ng generate component features/auth/login --skip-tests
call ng generate component features/auth/register --skip-tests
call ng generate component features/auth/forgot-password --skip-tests
call ng generate component features/auth/reset-password --skip-tests
call ng generate component features/auth/profile --skip-tests
echo ✓ Auth components created
echo.

echo Creating Settings Feature...
call ng generate component features/settings/settings-page --skip-tests
call ng generate component features/settings/general-settings --skip-tests
call ng generate component features/settings/ai-settings --skip-tests
call ng generate component features/settings/notification-settings --skip-tests
call ng generate component features/settings/account-settings --skip-tests
echo ✓ Settings components created
echo.

echo Creating Dashboard Feature...
call ng generate component features/dashboard/dashboard-page --skip-tests
call ng generate component features/dashboard/stats-card --skip-tests
call ng generate component features/dashboard/recent-searches --skip-tests
call ng generate component features/dashboard/usage-chart --skip-tests
call ng generate component features/dashboard/quick-actions --skip-tests
echo ✓ Dashboard components created
echo.

echo ========================================
echo Creating Layout Components...
echo ========================================

echo Creating Layout Components...
call ng generate component layout/header/header --skip-tests
call ng generate component layout/sidebar/sidebar --skip-tests
call ng generate component layout/footer/footer --skip-tests
call ng generate component layout/main/main-layout --skip-tests
call ng generate component layout/mobile/mobile-nav --skip-tests
echo ✓ Layout components created
echo.

echo ========================================
echo Creating Bootstrap Specific Components...
echo ========================================

echo Creating Bootstrap Enhanced Components...
if not exist "src\app\shared\components\bootstrap" mkdir "src\app\shared\components\bootstrap"
call ng generate component shared/components/bootstrap/bootstrap-search-bar --skip-tests
call ng generate component shared/components/bootstrap/bootstrap-result-card --skip-tests
call ng generate component shared/components/bootstrap/bootstrap-chat-interface --skip-tests
call ng generate component shared/components/bootstrap/bootstrap-file-upload --skip-tests
call ng generate component shared/components/bootstrap/bootstrap-loading --skip-tests
call ng generate component shared/components/bootstrap/bootstrap-notification --skip-tests
echo ✓ Bootstrap components created
echo.

echo ========================================
echo Creating Interfaces and Models...
echo ========================================

echo Creating TypeScript Interfaces...
echo export interface SearchResult { } > "src\app\shared\interfaces\search-result.interface.ts"
echo export interface ChatMessage { } > "src\app\shared\interfaces\chat-message.interface.ts"
echo export interface User { } > "src\app\shared\interfaces\user.interface.ts"
echo export interface SearchQuery { } > "src\app\shared\interfaces\search-query.interface.ts"
echo export interface ApiResponse { } > "src\app\shared\interfaces\api-response.interface.ts"
echo export interface Notification { } > "src\app\shared\interfaces\notification.interface.ts"
echo ✓ Interfaces created
echo.

echo Creating Constants...
echo export const APP_CONSTANTS = { } > "src\app\shared\constants\app.constants.ts"
echo export const API_ENDPOINTS = { } > "src\app\shared\constants\api-endpoints.ts"
echo export const STORAGE_KEYS = { } > "src\app\shared\constants\storage-keys.ts"
echo export const BOOTSTRAP_CONFIG = { } > "src\app\shared\constants\bootstrap-config.ts"
echo ✓ Constants created
echo.

echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Configure app.config.ts with NgbModule providers
echo 2. Update styles.scss with Bootstrap CSS imports
echo 3. Set up routing configuration
echo 4. Configure Bootstrap components
echo 5. Test the application
echo.
echo Run: npm start
echo.
pause
