import { ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown } from 'lucide-react'
import AnimatedCounter from '../components/AnimatedCounter'
import { useApp } from '../context/AppContext'

function SparklinePlaceholder({ positive }) {
  const color = positive ? '#00d4aa' : '#ef4444'
  const points = positive
    ? '0,20 15,18 30,15 45,17 60,10 75,12 90,5 105,8 120,3'
    : '0,5 15,8 30,3 45,10 60,7 75,15 90,12 105,18 120,20'

  return (
    <svg width="120" height="24" viewBox="0 0 120 24" className="inline-block">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function TokenRow({ token }) {
  const value = token.balance * token.price
  const isPositive = token.change24h >= 0

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/[0.07] transition-colors">
      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-sm flex-shrink-0">
        {token.symbol.slice(0, 2)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white text-sm">{token.name}</p>
        <p className="text-xs text-gray-500">{token.balance} {token.symbol}</p>
      </div>
      <div className="hidden sm:block">
        <SparklinePlaceholder positive={isPositive} />
      </div>
      <div className="text-right">
        <p className="font-medium text-white text-sm">${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p className={`text-xs flex items-center justify-end gap-0.5 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {isPositive ? '+' : ''}{token.change24h}%
        </p>
      </div>
    </div>
  )
}

export default function WalletDashboardPage() {
  const { walletTokens } = useApp()
  const totalValue = walletTokens.reduce((sum, t) => sum + t.balance * t.price, 0)
  const weightedChange = walletTokens.reduce((sum, t) => {
    const val = t.balance * t.price
    return sum + (t.change24h * val) / totalValue
  }, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Wallet</h1>
        <p className="text-gray-400 mt-1">Your crypto portfolio overview</p>
      </div>

      {/* Portfolio Value */}
      <div className="bg-card rounded-xl border border-border p-6">
        <p className="text-sm text-gray-400 mb-1">Total Portfolio Value</p>
        <p className="text-3xl font-bold text-white">
          $<AnimatedCounter end={Math.round(totalValue)} />
        </p>
        <p className={`text-sm mt-1 ${weightedChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {weightedChange >= 0 ? '+' : ''}{weightedChange.toFixed(2)}% (24h)
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button className="flex-1 bg-accent hover:bg-accent/90 text-black font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
          <ArrowUpRight size={18} /> Send
        </button>
        <button className="flex-1 bg-secondary hover:bg-secondary/90 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
          <ArrowDownLeft size={18} /> Receive
        </button>
      </div>

      {/* Token List */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-gray-300 mb-4">Your Tokens</h3>
        <div className="space-y-3">
          {walletTokens.map(token => (
            <TokenRow key={token.symbol} token={token} />
          ))}
        </div>
      </div>
    </div>
  )
}
