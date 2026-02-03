import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, Wallet, Zap, BarChart3, Cpu, Globe } from 'lucide-react';
import './App.css';

interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  ath: number;
  atl: number;
}

const cryptoIcons: Record<string, string> = {
  bitcoin: '₿',
  ethereum: 'Ξ',
  solana: '◎',
  dogecoin: 'Ð',
};

function App() {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [sparklines, setSparklines] = useState<Record<string, number[]>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchCryptoData = async () => {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,dogecoin&order=market_cap_desc&sparkline=true&price_change_percentage=24h'
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json();
      setCryptoData(data);
      
      // Extract sparkline data
      const sparklineMap: Record<string, number[]> = {};
      data.forEach((coin: any) => {
        sparklineMap[coin.id] = coin.sparkline_in_7d?.price || [];
      });
      setSparklines(sparklineMap);
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch crypto data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCryptoData();
    
    // Refresh data every 60 seconds
    const interval = setInterval(fetchCryptoData, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: price < 1 ? 4 : 2,
      maximumFractionDigits: price < 1 ? 4 : 2,
    }).format(price);
  };

  const formatMarketCap = (marketCap: number): string => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    }
    return `$${marketCap.toFixed(2)}`;
  };

  const bitcoin = cryptoData.find(c => c.id === 'bitcoin');
  const otherCoins = cryptoData.filter(c => c.id !== 'bitcoin');

  // Generate mini chart SVG path from sparkline data
  const generateChartPath = (prices: number[], width: number = 200, height: number = 60): string => {
    if (!prices || prices.length === 0) return '';
    
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    
    const points = prices.map((price, i) => {
      const x = (i / (prices.length - 1)) * width;
      const y = height - ((price - min) / range) * height;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  const SkeletonCard = ({ large = false }: { large?: boolean }) => (
    <div className={`relative overflow-hidden rounded-2xl bg-[#0a0a0a] border border-[#1a1a1a] ${large ? 'col-span-2 row-span-2' : ''}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
      <div className="relative p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#1a1a1a]" />
          <div className="w-24 h-4 rounded bg-[#1a1a1a]" />
        </div>
        <div className={`${large ? 'h-16' : 'h-10'} w-32 rounded bg-[#1a1a1a] mb-4`} />
        <div className="w-20 h-4 rounded bg-[#1a1a1a]" />
        {large && (
          <>
            <div className="mt-8 h-32 w-full rounded bg-[#1a1a1a]" />
            <div className="mt-4 flex gap-4">
              <div className="w-24 h-8 rounded bg-[#1a1a1a]" />
              <div className="w-24 h-8 rounded bg-[#1a1a1a]" />
              <div className="w-24 h-8 rounded bg-[#1a1a1a]" />
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#00ff88]/30">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#00ff88]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#ff0044]/5 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#00aaff]/5 rounded-full blur-[200px]" />
      </div>

      {/* Grid Pattern Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-[#1a1a1a] backdrop-blur-xl bg-[#050505]/80 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#00aaff] flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-black" />
                  </div>
                  <div className="absolute inset-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#00aaff] blur-lg opacity-50" />
                </div>
                <div>
                  <h1 className="text-xl font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-[#00ff88] to-[#00aaff] bg-clip-text text-transparent">
                      ORACLE
                    </span>
                    <span className="text-white/80"> TERMINAL</span>
                  </h1>
                  <p className="text-[10px] text-white/40 tracking-widest uppercase">Live Crypto Trading</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-1 bg-[#0a0a0a] rounded-full px-2 py-1 border border-[#1a1a1a]">
                {['Dashboard', 'Markets', 'Trading', 'Portfolio'].map((item, i) => (
                  <button
                    key={item}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      i === 0 
                        ? 'bg-[#1a1a1a] text-white' 
                        : 'text-white/50 hover:text-white hover:bg-[#1a1a1a]/50'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </nav>

              {/* Status */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0a0a0a] border border-[#1a1a1a]">
                  <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
                  <span className="text-xs text-white/60">LIVE</span>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#00ff88] to-[#00aaff] text-black font-medium text-sm hover:opacity-90 transition-all hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                  <Wallet className="w-4 h-4" />
                  Connect
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-white/40">
                <Globe className="w-4 h-4" />
                <span className="text-sm">Global Market Cap:</span>
                <span className="text-white font-medium">$2.84T</span>
              </div>
              <div className="flex items-center gap-2 text-white/40">
                <Activity className="w-4 h-4" />
                <span className="text-sm">24h Volume:</span>
                <span className="text-white font-medium">$98.2B</span>
              </div>
            </div>
            {lastUpdated && (
              <div className="text-xs text-white/40">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Bitcoin - Large Card */}
            {loading ? (
              <SkeletonCard large />
            ) : bitcoin ? (
              <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl col-span-1 md:col-span-2 lg:col-span-2 lg:row-span-2 group hover:border-[#f7931a]/30 transition-all duration-500">
                {/* Glow Effect */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#f7931a]/20 rounded-full blur-[80px] group-hover:bg-[#f7931a]/30 transition-all duration-500" />
                
                <div className="relative p-6 h-full flex flex-col">
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f7931a] to-[#f5ac38] flex items-center justify-center text-2xl font-bold text-black shadow-lg shadow-[#f7931a]/20">
                        {cryptoIcons.bitcoin}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Bitcoin</h3>
                        <p className="text-sm text-white/50">BTC</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
                      bitcoin.price_change_percentage_24h >= 0 
                        ? 'bg-[#00ff88]/10 text-[#00ff88]' 
                        : 'bg-[#ff0044]/10 text-[#ff0044]'
                    }`}>
                      {bitcoin.price_change_percentage_24h >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span className="font-mono tracking-tighter">{bitcoin.price_change_percentage_24h >= 0 ? '+' : ''}{bitcoin.price_change_percentage_24h.toFixed(2)}%</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <p className="text-5xl font-bold tracking-tighter font-mono bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                      {formatPrice(bitcoin.current_price)}
                    </p>
                    <p className="text-sm text-white/40 mt-1">Current Price</p>
                  </div>

                  {/* Chart */}
                  <div className="flex-1 min-h-[160px] relative">
                    <svg 
                      viewBox="0 0 200 80" 
                      className="w-full h-full"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id={`gradient-bitcoin`} x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor={bitcoin.price_change_percentage_24h >= 0 ? '#00ff88' : '#ff0044'} stopOpacity="0.3" />
                          <stop offset="100%" stopColor={bitcoin.price_change_percentage_24h >= 0 ? '#00ff88' : '#ff0044'} stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d={`${generateChartPath(sparklines.bitcoin || [], 200, 60)} L 200 80 L 0 80 Z`}
                        fill={`url(#gradient-bitcoin)`}
                      />
                      <path
                        d={generateChartPath(sparklines.bitcoin || [], 200, 60)}
                        fill="none"
                        stroke={bitcoin.price_change_percentage_24h >= 0 ? '#00ff88' : '#ff0044'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#1a1a1a]">
                    <div>
                      <p className="text-xs text-white/40 mb-1">Market Cap</p>
                      <p className="text-sm font-semibold text-white font-mono tracking-tighter">{formatMarketCap(bitcoin.market_cap)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 mb-1">24h Volume</p>
                      <p className="text-sm font-semibold text-white font-mono tracking-tighter">{formatMarketCap(bitcoin.total_volume)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 mb-1">24h High</p>
                      <p className="text-sm font-semibold text-white font-mono tracking-tighter">{formatPrice(bitcoin.high_24h)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Other Crypto Cards */}
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              otherCoins.map((coin) => (
                <div
                  key={coin.id}
                  className={`relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl group hover:border-white/20 transition-all duration-500`}
                >
                  {/* Glow Effect */}
                  <div className={`absolute -top-10 -right-10 w-20 h-20 rounded-full blur-[50px] opacity-50 group-hover:opacity-80 transition-all duration-500 ${
                    coin.id === 'ethereum' ? 'bg-[#627eea]/30' :
                    coin.id === 'solana' ? 'bg-[#00ffa3]/30' :
                    'bg-[#c2a633]/30'
                  }`} />

                  <div className="relative p-5">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold ${
                          coin.id === 'ethereum' ? 'bg-gradient-to-br from-[#627eea] to-[#8b9eff] text-white' :
                          coin.id === 'solana' ? 'bg-gradient-to-br from-[#00ffa3] to-[#00d4aa] text-black' :
                          'bg-gradient-to-br from-[#c2a633] to-[#f2d56f] text-black'
                        }`}>
                          {cryptoIcons[coin.id]}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{coin.name}</h3>
                          <p className="text-xs text-white/50">{coin.symbol.toUpperCase()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <p className="text-2xl font-bold text-white font-mono tracking-tighter">
                        {formatPrice(coin.current_price)}
                      </p>
                    </div>

                    {/* Mini Chart */}
                    <div className="h-12 mb-4">
                      <svg 
                        viewBox="0 0 100 30" 
                        className="w-full h-full"
                        preserveAspectRatio="none"
                      >
                        <path
                          d={generateChartPath(sparklines[coin.id]?.slice(-20) || [], 100, 30)}
                          fill="none"
                          stroke={coin.price_change_percentage_24h >= 0 ? '#00ff88' : '#ff0044'}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    {/* Change Badge */}
                    <div className={`flex items-center justify-between`}>
                      <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        coin.price_change_percentage_24h >= 0 
                          ? 'bg-[#00ff88]/10 text-[#00ff88]' 
                          : 'bg-[#ff0044]/10 text-[#ff0044]'
                      }`}>
                        {coin.price_change_percentage_24h >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        <span className="font-mono tracking-tighter">{coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%</span>
                      </div>
                      <span className="text-xs text-white/30">24h</span>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Quick Actions Card */}
            <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-5">
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-[#00ff88]/10 rounded-full blur-[50px]" />
              
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#00ff88]" />
                Quick Actions
              </h3>
              
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#1a1a1a] hover:bg-[#252525] transition-all hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] group">
                  <span className="text-sm text-white/80 group-hover:text-white">Buy Crypto</span>
                  <TrendingUp className="w-4 h-4 text-[#00ff88]" />
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#1a1a1a] hover:bg-[#252525] transition-all hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] group">
                  <span className="text-sm text-white/80 group-hover:text-white">Sell Crypto</span>
                  <TrendingDown className="w-4 h-4 text-[#ff0044]" />
                </button>
                <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#1a1a1a] hover:bg-[#252525] transition-all hover:shadow-[0_0_20px_rgba(34,197,94,0.3)] group">
                  <span className="text-sm text-white/80 group-hover:text-white">View Charts</span>
                  <BarChart3 className="w-4 h-4 text-[#00aaff]" />
                </button>
              </div>
            </div>

            {/* Market Sentiment Card */}
            <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl p-5">
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-[#00aaff]/10 rounded-full blur-[50px]" />
              
              <h3 className="text-sm font-bold text-white mb-4">Market Sentiment</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-white/50">Fear</span>
                    <span className="text-white/50">Greed</span>
                  </div>
                  <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
                    <div className="h-full w-[65%] bg-gradient-to-r from-[#ff0044] via-[#ffaa00] to-[#00ff88] rounded-full" />
                  </div>
                  <div className="flex justify-center mt-2">
                    <span className="text-lg font-bold text-[#00ff88] font-mono tracking-tighter">65</span>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-[#1a1a1a]">
                  <p className="text-xs text-white/40 text-center">Greed - Market is optimistic</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-[#1a1a1a]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#00ff88]" />
                <span className="text-sm text-white/40">
                  Oracle Terminal v1.0.2
                </span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-xs text-white/30">Data provided by CoinGecko</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
                  <span className="text-xs text-white/40">System Operational</span>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default App;
