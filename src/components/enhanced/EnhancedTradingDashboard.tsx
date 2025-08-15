// Enhanced Trading Dashboard Component
// Demonstrates integration of enhanced API hooks with existing dashboard
// Progressive enhancement - enhanced features layered on top of existing

import React, { useState } from 'react';
import { FEATURE_FLAGS } from '../../config/features';
import { 
  useTrades, 
  usePortfolio, 
  useMarketData, 
  useRealTimeMarketData, 
  useTradeExecution,
  useTradingPreferences,
  apiUtils 
} from '../../api/enhanced';
import styles from './EnhancedTradingDashboard.module.css';

interface EnhancedTradingDashboardProps {
  symbols?: string[];
  showAdvancedFeatures?: boolean;
  className?: string;
}

export const EnhancedTradingDashboard: React.FC<EnhancedTradingDashboardProps> = ({
  symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA'],
  showAdvancedFeatures = false,
  className = '',
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState(symbols[0]);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed'>('overview');

  // Enhanced hooks for data fetching
  const { 
    data: trades, 
    loading: tradesLoading, 
    error: tradesError, 
    refetch: refetchTrades 
  } = useTrades({ limit: 10 });

  const { 
    data: portfolio, 
    loading: portfolioLoading, 
    error: portfolioError 
  } = usePortfolio();

  const { 
    data: marketData, 
    loading: marketLoading, 
    error: marketError 
  } = useMarketData(symbols);

  const { 
    data: preferences, 
    updatePreferences 
  } = useTradingPreferences();

  const { 
    data: realtimeData, 
    connected: isConnected 
  } = useRealTimeMarketData(selectedSymbol);

  const { 
    executing, 
    lastTrade, 
    error: tradeError, 
    executeTrade, 
    clearError 
  } = useTradeExecution();

  // Demo trade execution
  const handleQuickTrade = async (side: 'buy' | 'sell') => {
    try {
      const currentPrice = realtimeData?.price || marketData?.find(m => m.symbol === selectedSymbol)?.price || 100;
      await executeTrade({
        symbol: selectedSymbol,
        side,
        quantity: 10,
        price: currentPrice,
      });
      
      // Refresh trades after execution
      setTimeout(() => refetchTrades(), 1000);
    } catch (error) {
      console.error('Trade execution failed:', error);
    }
  };

  // Toggle dark mode preference
  const toggleDarkMode = async () => {
    if (preferences) {
      await updatePreferences({ darkMode: !preferences.darkMode });
    }
  };

  // Get current price for selected symbol
  const getCurrentPrice = () => {
    if (FEATURE_FLAGS.useRealTimeData && realtimeData) {
      return realtimeData.price;
    }
    return marketData?.find(m => m.symbol === selectedSymbol)?.price || 0;
  };

  const getCurrentChange = () => {
    if (FEATURE_FLAGS.useRealTimeData && realtimeData) {
      return realtimeData.changePercent;
    }
    return marketData?.find(m => m.symbol === selectedSymbol)?.changePercent || 0;
  };

  if (!FEATURE_FLAGS.useEnhancedServices) {
    return (
      <div className={`trading-dashboard ${className}`}>
        <div className="feature-disabled">
          <h3>Enhanced Trading Dashboard</h3>
          <p>Enhanced API features are currently disabled.</p>
          <p>Enable <code>useEnhancedServices</code> in feature flags to access this component.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.dashboard} ${className}`}>
      <header className={styles.header}>
        <h2 className={styles.title}>Enhanced Trading Dashboard</h2>
        <div className={styles.controls}>
          <select 
            value={viewMode} 
            onChange={(e) => setViewMode(e.target.value as 'overview' | 'detailed')}
            className={styles.select}
          >
            <option value="overview">Overview</option>
            <option value="detailed">Detailed</option>
          </select>
          
          {preferences && (
            <button 
              onClick={toggleDarkMode}
              className={styles.themeToggle}
              title="Toggle dark mode"
            >
              {preferences.darkMode ? '☀️' : '🌙'}
            </button>
          )}
          
          {FEATURE_FLAGS.useRealTimeData && (
            <div className={`${styles.connectionStatus} ${isConnected ? styles.connected : styles.disconnected}`}>
              {isConnected ? '🟢 Live' : '🔴 Offline'}
            </div>
          )}
        </div>
      </header>

      <div className={styles.grid}>
        {/* Portfolio Summary */}
        <div className={styles.card}>
          <h3>Portfolio Summary</h3>
          {portfolioLoading ? (
            <div className={styles.loading}>Loading portfolio...</div>
          ) : portfolioError ? (
            <div className={styles.error}>Error: {portfolioError}</div>
          ) : portfolio ? (
            <div className={styles.portfolioStats}>
              <div className={styles.stat}>
                <span className={styles.label}>Total Value:</span>
                <span className={styles.value}>{apiUtils.formatCurrency(portfolio.totalValue)}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.label}>Cash Balance:</span>
                <span className={styles.value}>{apiUtils.formatCurrency(portfolio.cashBalance)}</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.label}>Day Change:</span>
                <span className={`${styles.value} ${portfolio.dayChange >= 0 ? styles.positive : styles.negative}`}>
                  {apiUtils.formatCurrency(portfolio.dayChange)} ({apiUtils.formatPercentage(portfolio.dayChangePercent)})
                </span>
              </div>
              <div className={styles.stat}>
                <span className={styles.label}>Positions:</span>
                <span className={styles.value}>{portfolio.positions.length}</span>
              </div>
            </div>
          ) : null}
        </div>

        {/* Market Data */}
        <div className={styles.card}>
          <h3>Market Data</h3>
          <div className={styles.symbolSelector}>
            {symbols.map(symbol => (
              <button
                key={symbol}
                onClick={() => setSelectedSymbol(symbol)}
                className={`${styles.symbolButton} ${selectedSymbol === symbol ? styles.active : ''}`}
              >
                {symbol}
              </button>
            ))}
          </div>
          
          {marketLoading ? (
            <div className={styles.loading}>Loading market data...</div>
          ) : marketError ? (
            <div className={styles.error}>Error: {marketError}</div>
          ) : (
            <div className={styles.marketInfo}>
              <div className={styles.priceDisplay}>
                <span className={styles.price}>{apiUtils.formatCurrency(getCurrentPrice())}</span>
                <span className={`${styles.change} ${getCurrentChange() >= 0 ? styles.positive : styles.negative}`}>
                  {apiUtils.formatPercentage(getCurrentChange())}
                </span>
              </div>
              
              {FEATURE_FLAGS.useRealTimeData && realtimeData && (
                <div className={styles.realtimeInfo}>
                  <small>Last updated: {new Date(realtimeData.timestamp).toLocaleTimeString()}</small>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Trading */}
        <div className={styles.card}>
          <h3>Quick Trade</h3>
          <div className={styles.tradingControls}>
            <div className={styles.tradeInfo}>
              <span>Symbol: {selectedSymbol}</span>
              <span>Price: {apiUtils.formatCurrency(getCurrentPrice())}</span>
              <span>Quantity: 10 shares</span>
            </div>
            
            <div className={styles.tradeButtons}>
              <button
                onClick={() => handleQuickTrade('buy')}
                disabled={executing}
                className={`${styles.tradeButton} ${styles.buyButton}`}
              >
                {executing ? 'Executing...' : 'Buy'}
              </button>
              <button
                onClick={() => handleQuickTrade('sell')}
                disabled={executing}
                className={`${styles.tradeButton} ${styles.sellButton}`}
              >
                {executing ? 'Executing...' : 'Sell'}
              </button>
            </div>
            
            {tradeError && (
              <div className={styles.error}>
                {tradeError}
                <button onClick={clearError} className={styles.clearError}>×</button>
              </div>
            )}
            
            {lastTrade && (
              <div className={styles.lastTrade}>
                Last trade: {lastTrade.side.toUpperCase()} {lastTrade.quantity} {lastTrade.symbol} @ {apiUtils.formatCurrency(lastTrade.price)}
                <span className={`${styles.status} ${styles[lastTrade.status]}`}>
                  {lastTrade.status}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Trades */}
        <div className={`${styles.card} ${styles.fullWidth}`}>
          <h3>Recent Trades</h3>
          {tradesLoading ? (
            <div className={styles.loading}>Loading trades...</div>
          ) : tradesError ? (
            <div className={styles.error}>Error: {tradesError}</div>
          ) : trades && trades.length > 0 ? (
            <div className={styles.tradesTable}>
              <table>
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Side</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.slice(0, 5).map(trade => (
                    <tr key={trade.id}>
                      <td>{trade.symbol}</td>
                      <td className={trade.side === 'buy' ? styles.buy : styles.sell}>
                        {trade.side.toUpperCase()}
                      </td>
                      <td>{trade.quantity}</td>
                      <td>{apiUtils.formatCurrency(trade.price)}</td>
                      <td>
                        <span className={`${styles.status} ${styles[trade.status]}`}>
                          {trade.status}
                        </span>
                      </td>
                      <td>{new Date(trade.timestamp).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.noData}>No trades found</div>
          )}
        </div>

        {/* Advanced Features */}
        {showAdvancedFeatures && viewMode === 'detailed' && (
          <div className={`${styles.card} ${styles.fullWidth}`}>
            <h3>Advanced Features</h3>
            <div className={styles.advancedGrid}>
              <div>
                <h4>Feature Flags Status</h4>
                <ul className={styles.featureList}>
                  <li>Enhanced Services: {FEATURE_FLAGS.useEnhancedServices ? '✅' : '❌'}</li>
                  <li>Real-time Data: {FEATURE_FLAGS.useRealTimeData ? '✅' : '❌'}</li>
                  <li>Optimistic Updates: {FEATURE_FLAGS.useOptimisticUpdates ? '✅' : '❌'}</li>
                  <li>Enhanced State: {FEATURE_FLAGS.useEnhancedStateManagement ? '✅' : '❌'}</li>
                </ul>
              </div>
              
              <div>
                <h4>Performance Metrics</h4>
                <div className={styles.metrics}>
                  <div>API Calls: {marketData?.length || 0}</div>
                  <div>Cache Hits: N/A</div>
                  <div>WebSocket: {isConnected ? 'Connected' : 'Disconnected'}</div>
                  <div>Last Update: {new Date().toLocaleTimeString()}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedTradingDashboard;
