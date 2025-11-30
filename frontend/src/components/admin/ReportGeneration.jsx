import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { 
  Loader2, FileText, Download, RefreshCw, Plus, X, 
  BarChart3, Users, ShoppingBag, Calendar, CheckCircle, AlertCircle, Clock, Check
} from 'lucide-react';

const ReportGeneration = () => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalSales: 0, totalOrders: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshLoading, setRefreshLoading] = useState(false);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newReport, setNewReport] = useState({ type: 'Sales', name: '' });
  const [isGenerating, setIsGenerating] = useState(false);

  // Notification State
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  // Auto-hide notifications
  useEffect(() => {
    if (successMsg || errorMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg('');
        setErrorMsg('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg, errorMsg]);

  const loadData = async () => {
    if (!refreshLoading) setLoading(true);
    try {
      const [reportsData, statsData] = await Promise.all([
        apiService.getReports(),
        apiService.getReportStats()
      ]);
      setReports(reportsData || []);
      setStats(statsData || { totalUsers: 0, totalSales: 0, totalOrders: 0 });
    } catch (error) {
      console.error("Failed to load reports data", error);
    } finally {
      setLoading(false);
      setRefreshLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshLoading(true);
    await loadData();
    setSuccessMsg('Data refreshed successfully');
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setErrorMsg('');
    try {
      // Auto-generate name if empty
      const reportName = newReport.name || `${newReport.type} Report - ${new Date().toLocaleDateString()}`;
      
      const response = await apiService.generateReport(newReport.type, reportName);
      
      // Add new report to list (backend returns the created object)
      setReports([response.report, ...reports]);
      setShowModal(false);
      setNewReport({ type: 'Sales', name: '' });
      setSuccessMsg('Report generated successfully!');
    } catch (error) {
      setErrorMsg('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = (report) => {
    // Simulate download
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report.data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${report.name}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Generated': return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle };
      case 'Pending': return { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock };
      case 'Failed': return { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle };
      default: return { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: FileText };
    }
  };

  if (loading) return <div className="flex justify-center h-96 items-center"><Loader2 className="w-10 h-10 animate-spin text-purple-600"/></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Toast Notification */}
      {successMsg && (
        <div className="fixed top-20 right-4 bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-xl z-50 flex items-center gap-3 animate-in slide-in-from-top-2">
          <div className="bg-white/20 p-1 rounded-full"><Check className="w-4 h-4"/></div>
          <span className="font-medium">{successMsg}</span>
        </div>
      )}
      
      {errorMsg && (
        <div className="fixed top-20 right-4 bg-red-600 text-white px-6 py-3 rounded-xl shadow-xl z-50 flex items-center gap-3 animate-in slide-in-from-top-2">
          <div className="bg-white/20 p-1 rounded-full"><AlertCircle className="w-4 h-4"/></div>
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Analytics & Reports</h1>
          <p className="text-slate-500 mt-1">Generate insights on platform performance.</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={handleRefresh} 
                disabled={refreshLoading}
                className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 font-medium hover:border-purple-500 hover:text-purple-600 transition-colors flex items-center gap-2"
            >
                <RefreshCw className={`w-4 h-4 ${refreshLoading ? 'animate-spin' : ''}`}/>
                <span>Sync Data</span>
            </button>
            <button 
                onClick={() => setShowModal(true)} 
                className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white px-5 py-2 rounded-xl font-bold shadow-lg shadow-purple-200 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
                <Plus className="w-5 h-5"/> 
                <span>New Report</span>
            </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
            label="Total Sales" 
            value={`$${stats.totalSales.toLocaleString()}`} 
            subtext="Platform-wide revenue"
            icon={BarChart3} 
            color="emerald" 
        />
        <StatCard 
            label="Total Users" 
            value={stats.totalUsers.toLocaleString()} 
            subtext="Farmers, Consumers & Admins"
            icon={Users} 
            color="purple" 
        />
        <StatCard 
            label="Total Orders" 
            value={stats.totalOrders.toLocaleString()} 
            subtext="Completed transactions"
            icon={ShoppingBag} 
            color="blue" 
        />
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">Recent Reports</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                    <tr>
                        <th className="px-6 py-4">Report Name</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Generated On</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {reports.map((report) => {
                        const statusConfig = getStatusConfig(report.status);
                        const StatusIcon = statusConfig.icon;
                        
                        return (
                            <tr key={report._id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800 flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                                            <FileText size={20}/>
                                        </div>
                                        {report.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                                        {report.type} Analysis
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center text-sm text-slate-500 gap-1.5">
                                        <Calendar size={14}/>
                                        {new Date(report.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border gap-1.5 ${statusConfig.color}`}>
                                        <StatusIcon size={12}/>
                                        {report.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => downloadReport(report)}
                                        disabled={report.status !== 'Generated'}
                                        className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Download size={16}/> Download
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {reports.length === 0 && (
                <div className="text-center py-20 text-slate-400">
                    <FileText size={48} className="mx-auto mb-4 opacity-50"/>
                    <p>No reports generated yet.</p>
                    <button onClick={() => setShowModal(true)} className="text-purple-600 font-bold hover:underline mt-2">Create your first report</button>
                </div>
            )}
        </div>
      </div>

      {/* Generate Report Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)} />
            
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-slate-800">Generate Report</h3>
                    <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-500"/></button>
                </div>
                
                <form onSubmit={handleGenerate} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Report Type</label>
                        <div className="grid grid-cols-1 gap-3">
                            {['Sales', 'Users', 'Products'].map(type => (
                                <label key={type} className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${newReport.type === type ? 'border-purple-500 bg-purple-50' : 'border-slate-100 hover:border-purple-200'}`}>
                                    <div className="flex items-center gap-3">
                                        <input 
                                            type="radio" 
                                            name="reportType" 
                                            value={type} 
                                            checked={newReport.type === type}
                                            onChange={() => setNewReport({...newReport, type})}
                                            className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                                        />
                                        <span className={`font-bold ${newReport.type === type ? 'text-purple-900' : 'text-slate-600'}`}>
                                            {type} Performance
                                        </span>
                                    </div>
                                    {newReport.type === type && <CheckCircle size={18} className="text-purple-600"/>}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Custom Name (Optional)</label>
                        <input 
                            type="text" 
                            value={newReport.name} 
                            onChange={(e) => setNewReport({...newReport, name: e.target.value})}
                            placeholder="e.g., Q3 Financial Overview" 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                        />
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setShowModal(false)} 
                            disabled={isGenerating}
                            className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isGenerating}
                            className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 flex justify-center items-center gap-2"
                        >
                            {isGenerating ? <Loader2 className="animate-spin"/> : 'Generate Now'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-Component: Stat Card ---
const StatCard = ({ label, value, subtext, icon: Icon, color }) => {
    const colors = {
        emerald: 'bg-emerald-50 text-emerald-600',
        purple: 'bg-purple-50 text-purple-600',
        blue: 'bg-blue-50 text-blue-600',
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className={`p-4 rounded-2xl ${colors[color]}`}>
                <Icon size={28} strokeWidth={2.5}/>
            </div>
            <div>
                <p className="text-slate-500 font-bold text-sm tracking-wide uppercase">{label}</p>
                <h3 className="text-3xl font-extrabold text-slate-900 my-1">{value}</h3>
                <p className="text-slate-400 text-xs font-medium">{subtext}</p>
            </div>
        </div>
    );
};

export default ReportGeneration;