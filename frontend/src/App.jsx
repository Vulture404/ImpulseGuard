import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link as LinkIcon, AlertTriangle, ArrowRight, Edit3, ShieldAlert, CheckCircle } from 'lucide-react';

const API_URL = "https://your-new-railway-link.up.railway.app";

function App() {
  const [income, setIncome] = useState(60000);
  const [expenses, setExpenses] = useState(30000);
  const [url, setUrl] = useState('');
  
  // Stages: 0 = Input URL, 1 = Verify Scrape, 2 = AI Threshold Gate
  const [stage, setStage] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [itemTitle, setItemTitle] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [scrapeFailed, setScrapeFailed] = useState(false);
  const [aiError, setAiError] = useState('');
  
  const [result, setResult] = useState(null);
  const [confirmText, setConfirmText] = useState('');

  const [currentTime, setCurrentTime] = useState(new Date());
  const [manualRiskOverride, setManualRiskOverride] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getRiskLevel = () => {
    if (manualRiskOverride) return manualRiskOverride;
    const hour = currentTime.getHours();
    if (hour >= 6 && hour < 20) return 'low';
    if (hour >= 20 && hour < 23) return 'medium';
    return 'high';
  };

  const riskLevel = getRiskLevel();

  const cycleRiskOverride = () => {
     if (!manualRiskOverride) setManualRiskOverride('low');
     else if (manualRiskOverride === 'low') setManualRiskOverride('medium');
     else if (manualRiskOverride === 'medium') setManualRiskOverride('high');
     else setManualRiskOverride(null);
  };

  const disposableIncome = Math.max(0, income - expenses);
  const hourlyLifeValue = disposableIncome > 0 ? (disposableIncome / 240) : 1;

  const handleScrape = async (e) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    setScrapeFailed(false);
    setAiError('');
    setResult(null);
    setConfirmText('');
    
    try {
      const response = await axios.post(`${API_URL}/scrape`, { url });
      const { title, price, success } = response.data;
      
      setItemTitle(title || '');
      setItemPrice(price ? price.toString() : '');
      
      if (!price || !success) {
        setScrapeFailed(true);
      }
      
      setStage(1);
    } catch (error) {
      console.error(error);
      setItemTitle('');
      setItemPrice('');
      setScrapeFailed(true);
      setStage(1);
    } finally {
      setLoading(false);
    }
  };

  const handleRealityCheck = async (e) => {
    e.preventDefault();
    setAiError('');
    const numericPrice = parseFloat(itemPrice);
    if (!itemTitle || isNaN(numericPrice) || numericPrice <= 0) {
      alert("Please enter a valid title and price.");
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/evaluate`, {
         title: itemTitle,
         price: numericPrice
      });
      const { category, dynamic_threshold_hours, ai_reasoning } = response.data;
      
      // Stop execution if API key is dead or backend throws fallback error
      if (category === "Error") {
         setAiError(ai_reasoning);
         return; // Keep user on Stage 1 (Result Page)
      }
      
      const totalHours = numericPrice / hourlyLifeValue;
      const days = Math.floor(totalHours / 24);
      const hours = Math.floor(totalHours % 24);
      
      setResult({ 
         days, 
         hours, 
         totalHours, 
         price: numericPrice, 
         category, 
         dynamic_threshold_hours, 
         ai_reasoning 
      });
      setStage(2);
    } catch (error) {
       console.error(error);
       alert("AI Intercept Failed. Backend server may be offline.");
    } finally {
       setLoading(false);
    }
  };

  const handleCheckout = () => {
    // Red UI path enforces confirm text
    if (confirmText.trim().toUpperCase() === 'CONFIRM') {
      window.location.href = url || "https://google.com";
    }
  };

  const forceCheckout = () => {
    // Green UI path directly allows checkout
    window.location.href = url || "https://google.com";
  };

  let orbClass, riskLabel;
  if (riskLevel === 'low') {
    orbClass = "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]";
    riskLabel = "LOW";
  } else if (riskLevel === 'medium') {
    orbClass = "bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]";
    riskLabel = "ELEVATED";
  } else {
    orbClass = "bg-red-600 shadow-[0_0_25px_rgba(220,38,38,0.8)] animate-pulse";
    riskLabel = "HIGH";
  }

  const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 flex flex-col items-center py-8 px-4 sm:px-8 font-mono tracking-tight selection:bg-red-500 selection:text-white pb-24 relative overflow-hidden">
      
      {/* CHRONO-RISK HUD */}
      <div className="absolute top-4 right-4 md:fixed md:top-8 md:right-8 flex flex-col items-end gap-2 z-50 bg-black/60 backdrop-blur-md px-4 py-3 border border-zinc-800 rounded-lg shadow-2xl">
        <div className="text-xs font-mono uppercase font-bold tracking-widest text-zinc-500 flex justify-between w-full">
          <span>LOCAL TIME</span>
          <span>{formatTime(currentTime)}</span>
        </div>
        <div className="flex items-center gap-3 mt-1">
           <span className={`text-[10px] md:text-xs font-mono uppercase font-black transition-colors ${riskLevel === 'high' ? 'text-red-500' : 'text-zinc-300'}`}>
             [ SYS VULNERABILITY: <span className={riskLevel === 'high' ? 'text-red-500' : riskLevel === 'medium' ? 'text-amber-400' : 'text-emerald-500'}>{riskLabel}</span> ]
           </span>
           <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${orbClass} transition-all duration-300`} />
        </div>
        <button 
           onClick={cycleRiskOverride}
           className="text-[10px] text-zinc-600 hover:text-white uppercase transition-colors self-end mt-1 cursor-pointer"
           title="Cycle Override"
        >
          [DEV OVERRIDE]
        </button>
      </div>

      {/* HEADER */}
      <header className="w-full max-w-4xl flex flex-col md:flex-row justify-between items-end border-b-2 border-zinc-800 pb-8 mb-12 gap-8 relative z-10 pt-24 md:pt-0">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase cursor-pointer" onClick={() => {setStage(0); setUrl('');}}>TimeVault.</h1>
          <p className="text-zinc-500 mt-2 text-sm uppercase">Behavioral Finance Deterrent</p>
        </div>
        
        <div className="flex gap-4 items-end w-full md:w-auto">
          <div className="flex flex-col gap-1 w-full md:w-32">
            <label className="text-xs text-zinc-500 uppercase font-bold">Monthly Net (₹)</label>
            <input 
              type="number" 
              className="bg-zinc-900 border-2 border-zinc-800 p-2 text-white outline-none focus:border-red-500 transition-colors w-full appearance-none"
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-1 w-full md:w-32">
            <label className="text-xs text-zinc-500 uppercase font-bold">Fixed Costs (₹)</label>
            <input 
              type="number" 
              className="bg-zinc-900 border-2 border-zinc-800 p-2 text-white outline-none focus:border-red-500 transition-colors w-full appearance-none"
              value={expenses}
              onChange={(e) => setExpenses(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-1 border-l-2 border-zinc-800 pl-4 w-full md:w-auto">
            <label className="text-xs text-zinc-500 uppercase font-bold text-right">Hourly Life Value</label>
            <div className="text-2xl font-black text-white text-right">
              ₹{hourlyLifeValue.toFixed(2)}
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT PORTAL */}
      <main className="w-full max-w-4xl flex flex-col gap-16 flex-grow relative z-10">
        
        {/* STAGE 0: INPUT URL */}
        {(stage === 0 || stage === 1) && (
          <form onSubmit={handleScrape} className="relative group w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none text-zinc-600 group-focus-within:text-red-500 transition-colors">
              <LinkIcon size={32} />
            </div>
            <input
              type="url"
              required
              disabled={loading && stage === 0}
              className="w-full bg-zinc-900 border-4 border-zinc-800 p-8 pl-20 text-xl md:text-3xl text-white placeholder-zinc-700 outline-none focus:border-red-500 transition-colors uppercase font-black"
              placeholder="PASTE A PRODUCT LINK..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button 
              type="submit"
              disabled={loading || (stage === 1 && !url)}
              className="absolute inset-y-0 right-0 px-8 bg-zinc-800 hover:bg-red-600 text-white font-black text-xl transition-colors disabled:opacity-50 disabled:hover:bg-zinc-800 uppercase flex items-center justify-center border-l-4 border-zinc-950 cursor-pointer"
            >
              {loading && stage === 0 ? "SCRAPING..." : <ArrowRight size={32} />}
            </button>
          </form>
        )}

        {/* STAGE 1: EDIT / VERIFY SCRAPED DETAILS */}
        {stage === 1 && (
          <form onSubmit={handleRealityCheck} className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out bg-zinc-900/50 border-4 border-zinc-800 p-8">
            <div className="flex items-center gap-4 border-b-2 border-zinc-800 pb-4">
              <Edit3 size={24} className="text-zinc-500" />
              <h2 className="text-2xl font-black text-white uppercase">Verify Intercepted Data</h2>
            </div>

            {scrapeFailed && (
              <div className="p-4 bg-orange-950/30 border border-orange-900 text-orange-500 text-sm uppercase tracking-wider font-bold">
                Scraping failed or price obscured. Manually inject truth below.
              </div>
            )}

            {aiError && (
              <div className="p-4 bg-red-950/30 border border-red-900 border-l-4 border-l-red-500 text-red-400 text-sm uppercase tracking-wider font-bold">
                ⚠️ API ERROR: {aiError}
                <div className="mt-2 text-red-500/70 text-xs normal-case tracking-normal">
                  Your Gemini API Key is likely invalid or expired. Please update it in the backend/.env file. <br/>
                  (For testing without a key, type "minoxidil" or "sneakers" in the title).
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2 w-full">
              <label className="text-sm font-bold text-zinc-500 uppercase">Product Title</label>
              <input 
                type="text" 
                required
                className="w-full bg-zinc-950 border-2 border-zinc-800 p-4 text-xl text-white outline-none focus:border-red-500 transition-colors"
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
                placeholder="E.g. Premium Gadget"
              />
            </div>
            
            <div className="flex flex-col gap-2 w-full">
              <label className="text-sm font-bold text-zinc-500 uppercase">Exact Price (₹)</label>
              <input 
                type="number" 
                required
                step="0.01"
                min="1"
                className="w-full bg-zinc-950 border-2 border-zinc-800 p-4 text-2xl font-black text-white outline-none focus:border-red-500 transition-colors appearance-none"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="mt-4 w-full p-6 text-xl font-black uppercase tracking-widest transition-all duration-300 bg-white hover:bg-zinc-200 text-zinc-950 disabled:opacity-50 cursor-pointer"
            >
              {loading ? "ANALYZING LIFETIME IMPACT..." : "Get Reality Check"}
            </button>
          </form>
        )}

        {/* STAGE 2: DYNAMIC AI THRESHOLD GATE */}
        {stage === 2 && result && (
          <div className="flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out mt-8">
            <div className={`border-l-8 pl-8 space-y-4 ${result.totalHours < result.dynamic_threshold_hours ? 'border-emerald-500' : 'border-red-600'}`}>
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm text-opacity-80">Target Accquired</p>
              <h2 className="text-3xl font-black text-white line-clamp-2 uppercase">{itemTitle}</h2>
              <p className="text-2xl font-bold font-sans text-zinc-400">Price: ₹{result.price.toLocaleString()}</p>
            </div>

            <div className={`p-8 border-l-4 bg-zinc-900 border-zinc-800`}>
              <p className="text-lg md:text-xl font-medium text-zinc-300 leading-relaxed max-w-3xl italic">
                "{result.ai_reasoning}"
              </p>
            </div>

            {/* BRANCHING UI LOGIC */}
            {result.totalHours < result.dynamic_threshold_hours ? (
              
              // ==========================================
              // PATH A: CALM GREEN UI (SAFE / NECESSITY)
              // ==========================================
              <div className="bg-emerald-950/20 border-2 border-emerald-900/50 p-8 md:p-12 flex flex-col items-center gap-8 rounded-sm mx-auto w-full max-w-2xl">
                <CheckCircle size={64} className="text-emerald-500" strokeWidth={1.5} />
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-black text-emerald-400 uppercase tracking-wider">Purchase Cleared</h3>
                  <div className="flex gap-4 justify-center text-sm uppercase font-bold text-zinc-400">
                    <span className="px-3 py-1 bg-zinc-900 border border-zinc-800">CLASS: {result.category}</span>
                    <span className="px-3 py-1 bg-zinc-900 border border-zinc-800">LIMIT: {result.dynamic_threshold_hours} HRS</span>
                  </div>
                  <p className="text-emerald-200/70">At {Math.floor(result.totalHours)} hours of your life, this falls well within the permissible safety allowance. You may proceed unhindered.</p>
                </div>
                
                <div className="w-full flex flex-col gap-4 mt-4">
                  <button 
                    onClick={forceCheckout}
                    className="w-full p-6 text-xl font-black uppercase tracking-widest transition-all duration-300 bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] cursor-pointer"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>

            ) : (

              // ==========================================
              // PATH B: BRUTAL RED UI (IMPULSE / DANGEROUS)
              // ==========================================
              <>
                <div className="text-center py-8">
                  <p className="text-sm uppercase font-bold text-red-500 tracking-[0.3em] mb-4">Harsh Reality Check</p>
                  <h1 className="text-[10vw] md:text-8xl font-black text-red-600 leading-[0.85] uppercase break-words">
                    THIS WILL COST YOU <br/>
                    <span className="text-white">{result.days}</span> DAYS AND <br/>
                    <span className="text-white">{result.hours}</span> HOURS
                    <br/> OF YOUR LIFE.
                  </h1>
                </div>

                <div className="bg-red-950/20 border-2 border-red-900/50 p-8 md:p-12 flex flex-col items-center gap-8 mt-4 rounded-sm mx-auto w-full max-w-2xl">
                  <AlertTriangle size={64} className="text-red-500" strokeWidth={1.5} />
                  <div className="text-center space-y-4">
                    <h3 className="text-2xl font-black text-white uppercase tracking-wider">Are you absolutely sure?</h3>
                    <div className="flex gap-4 justify-center text-sm uppercase font-bold text-zinc-400">
                      <span className="px-3 py-1 bg-zinc-900 border border-zinc-800">CLASS: {result.category}</span>
                      <span className="px-3 py-1 bg-zinc-900 border border-zinc-800 text-red-400">LIMIT: {result.dynamic_threshold_hours} HRS</span>
                    </div>
                    <p className="text-zinc-400 text-sm">Trading away this portion of your finite existence for this item violates strict AI directives. If you accept this fate, manually type <span className="text-white font-black bg-zinc-900 px-2 py-1 select-none">CONFIRM</span> below.</p>
                  </div>
                  
                  <div className="w-full flex flex-col gap-4 mt-2">
                    <input 
                      type="text" 
                      className="w-full bg-zinc-950 border-2 border-red-900 p-4 text-center text-2xl font-black text-white outline-none focus:border-red-500 transition-colors uppercase placeholder-zinc-800 placeholder-opacity-50 tracking-widest disabled:opacity-50"
                      placeholder="TYPE 'CONFIRM'"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                    />
                    
                    <button 
                      disabled={confirmText.trim().toUpperCase() !== 'CONFIRM'}
                      onClick={handleCheckout}
                      className="w-full p-6 text-xl font-black uppercase tracking-widest transition-all duration-300 disabled:bg-zinc-900 disabled:text-zinc-700 disabled:cursor-not-allowed bg-red-600 hover:bg-red-500 text-white shadow-[0_0_40px_rgba(220,38,38,0.3)] hover:shadow-[0_0_60px_rgba(220,38,38,0.6)] disabled:shadow-none cursor-pointer"
                    >
                      GO TO CHECKOUT
                    </button>
                  </div>
                </div>
              </>
            )}

            <button 
              onClick={() => {setStage(0); setUrl('');}}
              className="mt-8 text-zinc-500 hover:text-white uppercase font-bold tracking-widest transition-colors w-fit self-center border-b-2 border-transparent hover:border-white mb-12 cursor-pointer"
            >
              Start Over
            </button>
          </div>
        )}
      </main>
      
    </div>
  );
}

export default App;
