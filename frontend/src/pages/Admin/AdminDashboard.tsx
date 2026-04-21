import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import Button from '../../components/Button';

const AdminDashboard = () => {
    return (
        <div className="min-h-screen w-full flex bg-[#F8F9FA] font-sans text-gray-800">
            {/* LEFT SIDEBAR COMPONENT */}
            <AdminSidebar />

            {/* MAIN CONTENT DIV */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* TOP NAVIGATION */}
                <AdminNavbar />

                {/* SCROLLABLE AREA */}
                <div className="flex-1 overflow-auto p-8 flex gap-8">
                    
                    {/* LEFT TWO-THIRDS */}
                    <div className="flex-1 flex flex-col space-y-8">
                        {/* Header Block */}
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">System Overview</h1>
                                <p className="text-gray-500 text-sm">Real-time surveillance and rescue coordination status.</p>
                            </div>
                            <div className="relative flex items-center">
                                <span className="absolute left-3 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </span>
                                <input 
                                    type="text" 
                                    placeholder="Search operations..." 
                                    className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#B45309] focus:border-transparent w-64 shadow-sm transition-all"
                                />
                            </div>
                        </div>

                        {/* Top Cards grid */}
                        <div className="grid grid-cols-4 gap-6">
                            {/* Card 1 */}
                            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_14px_rgba(0,0,0,0.02)] flex flex-col justify-between h-36">
                                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-[#F97316]">
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">1,284</p>
                                    <p className="text-[10px] font-bold text-gray-500 tracking-wider uppercase mt-1">Total Reports</p>
                                </div>
                            </div>
                            {/* Card 2 */}
                            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_14px_rgba(0,0,0,0.02)] flex flex-col justify-between h-36">
                                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-500">
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-5 4a1 1 0 00-1 1v1H5a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2H8v-1a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">42</p>
                                    <p className="text-[10px] font-bold text-gray-500 tracking-wider uppercase mt-1">Pending Rescues</p>
                                </div>
                            </div>
                            {/* Card 3 - Solid Orange */}
                            <div className="bg-[#B45309] rounded-2xl p-6 shadow-xl shadow-orange-900/10 flex flex-col justify-between h-36 text-white transform scale-105 relative z-10 transition-transform">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold">318</p>
                                    <p className="text-[10px] font-bold tracking-wider uppercase mt-1 opacity-90">Rescued this Month</p>
                                </div>
                            </div>
                            {/* Card 4 */}
                            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_14px_rgba(0,0,0,0.02)] flex flex-col justify-between h-36">
                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900">156</p>
                                    <p className="text-[10px] font-bold text-gray-500 tracking-wider uppercase mt-1">Active Rescuers</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Incident Reports Table */}
                        <div className="bg-white rounded-3xl shadow-[0_2px_14px_rgba(0,0,0,0.02)] overflow-hidden">
                            <div className="flex justify-between items-center p-6 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900">Recent Incident Reports</h3>
                                <a href="#" className="text-xs font-bold text-[#B45309] hover:underline">View All</a>
                            </div>
                            
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                        <th className="px-6 py-4 font-bold">Species</th>
                                        <th className="px-6 py-4 font-bold">Condition</th>
                                        <th className="px-6 py-4 font-bold">AI Insight</th>
                                        <th className="px-6 py-4 font-bold text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-gray-100">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center space-x-3">
                                                <div className="bg-gray-100 p-2 rounded-lg text-gray-500">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" clipRule="evenodd" /></svg>
                                                </div>
                                                <p className="text-sm font-bold text-gray-900 w-24 leading-snug">Dog<br/><span className="text-gray-500 font-normal text-xs">(Husky Mix)</span></p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded bg-red-50 text-red-600 text-[9px] font-bold uppercase tracking-wider">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
                                                Severely Injured
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-xs text-gray-500 italic max-w-[200px]">Possible road accident; high trauma.</p>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <Button variant="secondary" size="sm" className="shrink-0">
                                                Dispatch
                                            </Button>
                                        </td>
                                    </tr>

                                     <tr className="border-b border-gray-100">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center space-x-3">
                                                <div className="bg-gray-100 p-2 rounded-lg text-gray-500">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-5 4a1 1 0 00-1 1v1H5a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2H8v-1a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                                </div>
                                                <p className="text-sm font-bold text-gray-900 w-24 leading-snug">Cat<br/><span className="text-gray-500 font-normal text-xs">(Tabby)</span></p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded bg-orange-50 text-[#ea580c] text-[9px] font-bold uppercase tracking-wider">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] mr-1.5"></span>
                                                Malnourished
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-xs text-gray-500 italic max-w-[200px]">Stray colony behavior; requires trap/neuter.</p>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <Button variant="gray" size="sm" className="shrink-0">
                                                Review
                                            </Button>
                                        </td>
                                    </tr>

                                    <tr className="">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center space-x-3">
                                                <div className="bg-gray-100 p-2 rounded-lg text-gray-500">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                                                </div>
                                                <p className="text-sm font-bold text-gray-900 w-24 leading-snug">Dog<br/><span className="text-gray-500 font-normal text-xs">(Stray)</span></p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                             <span className="inline-flex items-center px-2.5 py-1 rounded bg-red-50 text-red-600 text-[9px] font-bold uppercase tracking-wider">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
                                                Skin Infection
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="text-xs text-gray-500 italic max-w-[200px]">Mange suspected; contagious alert.</p>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <Button variant="secondary" size="sm" className="shrink-0">
                                                Dispatch
                                            </Button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Live Activity Heatmap Section */}
                        <div className="bg-white rounded-3xl shadow-[0_2px_14px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Live Activity Heatmap</h3>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Stray Density & Hotspots</p>
                                </div>
                                <div className="flex items-center space-x-3 text-xs bg-gray-50 rounded px-2.5 py-1">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase">Filter:</span>
                                    <span className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Last 24 Hours</span>
                                </div>
                            </div>
                            
                            <div className="w-full h-80 rounded-2xl overflow-hidden relative border border-gray-100 bg-[#1A4543]">
                                {/* Using a placeholder SVG or CSS gradients to mimic the heatmap look from the image since we don't have the actual map image */}
                                <div className="absolute inset-0 opacity-80" style={{
                                    backgroundImage: `radial-gradient(ellipse at 50% 50%, #ea580c 0%, #facc15 20%, #4ade80 40%, transparent 60%),
                                                      radial-gradient(ellipse at 30% 70%, #ef4444 0%, #f97316 20%, transparent 50%),
                                                      radial-gradient(ellipse at 80% 30%, #ef4444 0%, #facc15 30%, transparent 60%)`,
                                    filter: 'blur(30px)'
                                }}></div>

                                {/* Map visual markers overlay */}
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
                                    {/* Mock continent shapes */}
                                    <svg viewBox="0 0 1000 500" className="w-full h-full fill-current text-white"><path d="M400,200 Q450,150 500,200 T600,300 M200,100... (Mock Paths)"/></svg>
                                </div>

                                {/* Zoom controls */}
                                <div className="absolute bottom-4 right-4 flex flex-col space-y-2">
                                    <Button variant="light" size="icon" className="shadow-lg text-gray-600 border-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                    </Button>
                                    <Button variant="light" size="icon" className="shadow-lg text-gray-600 border-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                                    </Button>
                                </div>

                                {/* Peak Hotspot Box */}
                                <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                                        Peak Hotspot <span className="text-red-500 ml-1">+12%</span>
                                    </p>
                                    <p className="text-sm font-bold text-gray-900 mt-1">Industrial District</p>
                                    <div className="w-full h-1 bg-gray-200 mt-2 rounded">
                                        <div className="w-[80%] h-1 bg-[#B45309] rounded"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>


                    {/* RIGHT SIDEBAR (AI Insights) */}
                    <div className="w-80 flex-shrink-0 flex flex-col gap-6">
                        
                        <div className="bg-[#EAE5DF] rounded-[2rem] p-6 pb-8 flex-1">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-[#B45309] shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">AI Smart Insights</h3>
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Operational Intelligence</p>
                                </div>
                            </div>

                            {/* Alert 1 - Disease */}
                            <div className="bg-red-50/70 border border-red-100 rounded-2xl p-5 mb-4 text-center">
                                <div className="flex justify-center mb-2 text-red-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                </div>
                                <h4 className="text-[11px] font-bold text-red-700 uppercase tracking-widest mb-2">Disease Alert</h4>
                                <p className="text-[11px] text-red-600/80 leading-relaxed max-w-[200px] mx-auto mb-4">
                                    Cluster of 5 reports showing symptoms of Parvovirus in the East Sector. Recommend isolation protocols for incoming rescues.
                                </p>
                                <Button variant="danger" size="md" fullWidth className="text-[10px] uppercase tracking-wider">
                                    Activate Alert
                                </Button>
                            </div>

                            {/* Alert 2 - Resource */}
                            <div className="bg-[#EADCA6] bg-opacity-60 border border-[#D1B155] rounded-2xl p-5 text-left mb-6">
                                <div className="flex items-start space-x-3 mb-2">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#856616] mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" /></svg>
                                    <div>
                                        <h4 className="text-[11px] font-bold text-[#856616] uppercase tracking-widest mb-1.5">Resource Efficiency</h4>
                                        <p className="text-[10px] text-[#856616]/80 leading-relaxed">
                                            Rescuer density is high in North Zone, but 60% of reports are in West Zone. Suggest re-dispatching 3 mobile units.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex space-x-2 mt-4 ml-8">
                                    <Button variant="warning" size="xs" className="flex-1">
                                        Optimize
                                    </Button>
                                     <Button variant="soft-warning" size="xs" className="flex-1 text-[#856616] font-bold">
                                        Ignore
                                    </Button>
                                </div>
                            </div>
                            


                            {/* Success Rate Chart */}
                            <div className="bg-white rounded-2xl p-5 mb-8">
                                <div className="flex justify-between items-center mb-4">
                                     <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Success Rate</h4>
                                     <span className="text-xs font-bold text-green-600">+24%</span>
                                </div>
                                {/* Mock bar chart */}
                                <div className="flex items-end justify-between h-16 mb-3 px-2 gap-1">
                                    <div className="w-full bg-gray-100 rounded-t h-[40%]"></div>
                                    <div className="w-full bg-green-100 rounded-t h-[50%]"></div>
                                    <div className="w-full bg-green-300 rounded-t h-[60%]"></div>
                                    <div className="w-full bg-green-500 rounded-t h-[75%]"></div>
                                    <div className="w-full bg-green-700 rounded-t h-[100%]"></div>
                                    <div className="w-full bg-[#F97316] rounded-t h-[50%]"></div>
                                    <div className="w-full bg-[#1A4543] rounded-t h-[65%]"></div>
                                </div>
                                <p className="text-[9px] text-gray-400 italic text-center">
                                    Adoption rates are rising due to "Warm Image" initiative.
                                </p>
                            </div>

                            {/* Quick Broadcast */}
                            <div>
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Quick Broadcast</h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button variant="light" size="none" className="py-3 rounded-xl flex-col font-normal hover:border-gray-50/50 hover:shadow-md">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mb-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg>
                                        <span className="text-[10px] font-bold text-gray-700">Rescuers</span>
                                    </Button>
                                     <Button variant="light" size="none" className="py-3 rounded-xl flex-col font-normal hover:border-gray-50/50 hover:shadow-md">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mb-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                        <span className="text-[10px] font-bold text-gray-700">Vets</span>
                                    </Button>
                                </div>
                            </div>
                        </div>

                    </div>
                    
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
