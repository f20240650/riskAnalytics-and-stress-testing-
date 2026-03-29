import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Briefcase, Activity, AlertTriangle, FileText, Settings, Users, 
  PlayCircle, TrendingDown, TrendingUp, ShieldAlert
} from 'lucide-react';

// ==========================================
// MOCK DATA (Mapped directly from ER Diagram)
// ==========================================

// Maps to USER and USER_PROFILE
const currentUser = {
  user_id: 1,
  username: "risk_admin",
  full_name: "Eleanor Vance",
  department: "Quantitative Analysis",
  avatar_url: "https://i.pravatar.cc/150?u=risk"
};

// Maps to PORTFOLIO, ASSET, and PORTFOLIO_ASSET
const portfolioData = {
  portfolio_id: 101,
  name: "Global Macro Alpha",
  base_currency: "USD",
  status: "active",
  assets:[
    { asset_id: 1, ticker: "AAPL", asset_name: "Apple Inc.", type: "equity", weight: 0.40, quantity: 15000, purchase_price: 150.5 },
    { asset_id: 2, ticker: "US10Y", asset_name: "US Treasury 10Y", type: "bond", weight: 0.35, quantity: 50000, purchase_price: 98.2 },
    { asset_id: 3, ticker: "SPX_CALL", asset_name: "S&P 500 Call", type: "derivative", weight: 0.15, quantity: 100, purchase_price: 12.4 },
    { asset_id: 4, ticker: "NVDA", asset_name: "Nvidia Corp", type: "equity", weight: 0.10, quantity: 4000, purchase_price: 450.0 },
  ]
};

// Maps to SCENARIO
const scenarios =[
  { scenario_id: 1, name: "Base Case", interest_rate_shock_bps: 0, equity_shock_pct: 0.05, volatility_multiplier: 1.0 },
  { scenario_id: 2, name: "Stagflation Shock", interest_rate_shock_bps: 150, equity_shock_pct: -0.20, volatility_multiplier: 1.8 },
  { scenario_id: 3, name: "Tech Bubble Burst", interest_rate_shock_bps: -50, equity_shock_pct: -0.35, volatility_multiplier: 2.5 },
];

// Maps to SIMULATION_RUN and RISK_METRIC
const latestSimulation = {
  run_id: 5042,
  status: "completed",
  run_type: "monte_carlo",
  metrics:[
    { metric_type: "VaR_95", metric_value: 1250000, confidence_level: 0.95 },
    { metric_type: "VaR_99", metric_value: 2100000, confidence_level: 0.99 },
    { metric_type: "ES_95", metric_value: 1650000, confidence_level: 0.95 },
    { metric_type: "volatility", metric_value: 0.185, confidence_level: null },
  ]
};

// Maps to MARKET_DATA (Historical trend for charts)
const historicalData =[
  { date: '2023-01', value: 10000000 }, { date: '2023-02', value: 10200000 },
  { date: '2023-03', value: 9800000 }, { date: '2023-04', value: 10500000 },
  { date: '2023-05', value: 10800000 }, { date: '2023-06', value: 11200000 },
];

const COLORS =['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

// ==========================================
// COMPONENTS
// ==========================================

const SidebarItem = ({ icon: Icon, label, active }) => (
  <div className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${active ? 'bg-blue-900 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </div>
);

const RiskCard = ({ title, value, subtitle, icon: Icon, alert }) => (
  <div className={`p-5 rounded-xl border ${alert ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'} shadow-sm flex items-start justify-between`}>
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className={`text-2xl font-bold ${alert ? 'text-red-700' : 'text-slate-800'}`}>{value}</h3>
      <p className="text-xs text-slate-400 mt-2">{subtitle}</p>
    </div>
    <div className={`p-3 rounded-lg ${alert ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
      <Icon size={24} />
    </div>
  </div>
);

export default function App() {
  const[activeScenario, setActiveScenario] = useState(scenarios[0]);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 1500); // Mock network request
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumSignificantDigits: 4 }).format(val);

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-slate-950 text-white flex flex-col">
        <div className="p-6 flex items-center space-x-3">
          <ShieldAlert className="text-blue-500" size={28} />
          <span className="text-xl font-bold tracking-tight">RiskQuant</span>
        </div>
        <div className="flex-1 px-4 space-y-2">
          <SidebarItem icon={Activity} label="Dashboard" active />
          <SidebarItem icon={Briefcase} label="Portfolios" />
          <SidebarItem icon={AlertTriangle} label="Scenarios" />
          <SidebarItem icon={FileText} label="Reports" />
          <SidebarItem icon={Users} label="Users & Roles" />
        </div>
        <div className="p-4 border-t border-slate-800 flex items-center space-x-3">
          <img src={currentUser.avatar_url} alt="User" className="w-10 h-10 rounded-full" />
          <div>
            <p className="text-sm font-medium">{currentUser.full_name}</p>
            <p className="text-xs text-slate-400">{currentUser.department}</p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{portfolioData.name}</h1>
            <p className="text-sm text-slate-500">Base Currency: {portfolioData.base_currency} | Status: <span className="text-green-500 capitalize">{portfolioData.status}</span></p>
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-600">
            <Settings size={20} />
          </button>
        </header>

        <main className="p-8">
          
          {/* SIMULATION CONTROLS */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-semibold text-slate-600">Active Scenario:</span>
              <select 
                className="bg-slate-50 border border-slate-300 text-slate-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                onChange={(e) => setActiveScenario(scenarios.find(s => s.scenario_id == e.target.value))}
              >
                {scenarios.map(s => (
                  <option key={s.scenario_id} value={s.scenario_id}>{s.name}</option>
                ))}
              </select>
              <div className="text-xs text-slate-500 flex space-x-3">
                <span>IR Shock: {activeScenario.interest_rate_shock_bps} bps</span>
                <span>Eq Shock: {activeScenario.equity_shock_pct * 100}%</span>
                <span>Vol Mult: {activeScenario.volatility_multiplier}x</span>
              </div>
            </div>
            <button 
              onClick={handleRunSimulation}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-white transition-all ${isSimulating ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              <PlayCircle size={18} />
              <span>{isSimulating ? 'Running Monte Carlo...' : 'Run Simulation'}</span>
            </button>
          </div>

          {/* RISK METRICS (Maps to RISK_METRIC table) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <RiskCard 
              title="Value at Risk (95%)" 
              value={formatCurrency(latestSimulation.metrics.find(m => m.metric_type === 'VaR_95').metric_value)} 
              subtitle="1-Day Horizon" 
              icon={TrendingDown} 
              alert={activeScenario.scenario_id !== 1} // Shows red alert on shock scenarios
            />
            <RiskCard 
              title="Expected Shortfall (95%)" 
              value={formatCurrency(latestSimulation.metrics.find(m => m.metric_type === 'ES_95').metric_value)} 
              subtitle="Average loss beyond VaR" 
              icon={AlertTriangle} 
              alert={activeScenario.scenario_id !== 1}
            />
            <RiskCard 
              title="Portfolio Volatility" 
              value={`${(latestSimulation.metrics.find(m => m.metric_type === 'volatility').metric_value * 100).toFixed(2)}%`} 
              subtitle="Annualized" 
              icon={Activity} 
            />
            <RiskCard 
              title="Simulations Run" 
              value="10,000" 
              subtitle={`Run ID: #${latestSimulation.run_id}`} 
              icon={PlayCircle} 
            />
          </div>

          {/* CHARTS & TABLES */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Asset Allocation (Maps to PORTFOLIO_ASSET) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-1">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Asset Allocation</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={portfolioData.assets} dataKey="weight" nameKey="ticker" cx="50%" cy="50%" innerRadius={60} outerRadius={80} label>
                      {portfolioData.assets.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${(value * 100).toFixed(0)}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Holdings Table (Maps to ASSET and PORTFOLIO_ASSET) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Current Holdings</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b">
                    <tr>
                      <th className="px-4 py-3">Ticker</th>
                      <th className="px-4 py-3">Asset Name</th>
                      <th className="px-4 py-3">Class</th>
                      <th className="px-4 py-3 text-right">Quantity</th>
                      <th className="px-4 py-3 text-right">Avg Price</th>
                      <th className="px-4 py-3 text-right">Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolioData.assets.map((asset, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">{asset.ticker}</td>
                        <td className="px-4 py-3">{asset.asset_name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium 
                            ${asset.type === 'equity' ? 'bg-blue-100 text-blue-700' : 
                              asset.type === 'bond' ? 'bg-green-100 text-green-700' : 
                              'bg-purple-100 text-purple-700'}`}>
                            {asset.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">{asset.quantity.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">${asset.purchase_price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">{(asset.weight * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
        </main>
      </div>
    </div>
  );
}