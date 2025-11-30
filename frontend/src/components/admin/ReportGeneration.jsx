import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { Loader2, FileText, Download, RefreshCw, Plus, X, BarChart3, Users, ShoppingBag } from 'lucide-react';

const ReportGeneration = () => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalSales: 0, totalOrders: 0 });
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newReport, setNewReport] = useState({ type: 'Sales', name: '' });
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reportsData, statsData] = await Promise.all([
        apiService.getReports(),
        apiService.getReportStats()
      ]);
      setReports(reportsData);
      setStats(statsData);
    } catch (error) {
      console.error("Failed to load reports data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      // Auto-generate name if empty
      const reportName = newReport.name || `${newReport.type} Report - ${new Date().toLocaleDateString()}`;
      
      const response = await apiService.generateReport(newReport.type, reportName);
      
      // Add new report to list (backend returns the created object)
      setReports([response.report, ...reports]);
      setShowModal(false);
      setNewReport({ type: 'Sales', name: '' });
      alert('Report generated successfully!');
    } catch (error) {
      alert('Failed to generate report');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReport = (report) => {
    // In a real app, this would download a PDF/CSV file from report.fileUrl
    // For now, we simulate downloading the JSON data
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report.data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${report.name}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Helper for Status Badge
  const getStatusColor = (status) => {
    switch (status) {
      case 'Generated': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Report Generation</h2>
          <p className="text-gray-600">Generate and manage platform analytics</p>
        </div>
        <div className="flex space-x-3">
            <button onClick={loadData} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
                <RefreshCw className="w-4 h-4"/> <span>Refresh</span>
            </button>
            <button onClick={() => setShowModal(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                <Plus className="w-4 h-4"/> <span>Generate New Report</span>
            </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border text-center shadow-sm">
          <div className="flex justify-center mb-2 text-purple-600"><Users className="w-6 h-6"/></div>
          <div className="text-2xl font-bold text-gray-800">{stats.totalUsers.toLocaleString()}</div>
          <div className="text-gray-600 text-sm">Total Users</div>
        </div>
        <div className="bg-white rounded-xl p-6 border text-center shadow-sm">
          <div className="flex justify-center mb-2 text-green-600"><BarChart3 className="w-6 h-6"/></div>
          <div className="text-2xl font-bold text-gray-800">${stats.totalSales.toLocaleString()}</div>
          <div className="text-gray-600 text-sm">Total Sales</div>
        </div>
        <div className="bg-white rounded-xl p-6 border text-center shadow-sm">
          <div className="flex justify-center mb-2 text-blue-600"><ShoppingBag className="w-6 h-6"/></div>
          <div className="text-2xl font-bold text-gray-800">{stats.totalOrders.toLocaleString()}</div>
          <div className="text-gray-600 text-sm">Total Orders</div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-600"/></div>
        ) : (
            <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Report Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Generated</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                {reports.map((report) => (
                    <tr key={report._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400"/>
                            {report.name}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{report.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-2">
                        <button 
                            onClick={() => downloadReport(report)}
                            disabled={report.status !== 'Generated'}
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="w-4 h-4"/> Download
                        </button>
                        </div>
                    </td>
                    </tr>
                ))}
                {reports.length === 0 && (
                    <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                            No reports generated yet. Click "Generate New Report" to start.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        )}
      </div>

      {/* Generate Report Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Generate Report</h3>
                <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-500"/></button>
            </div>
            
            <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                    <select 
                        value={newReport.type} 
                        onChange={(e) => setNewReport({...newReport, type: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
                    >
                        <option value="Sales">Sales Report</option>
                        <option value="Users">User Growth Analysis</option>
                        <option value="Products">Product Performance</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Report Name (Optional)</label>
                    <input 
                        type="text" 
                        value={newReport.name}
                        onChange={(e) => setNewReport({...newReport, name: e.target.value})}
                        placeholder={`e.g., Monthly ${newReport.type} Report`}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                <div className="pt-2 flex gap-3">
                    <button 
                        type="button" 
                        onClick={() => setShowModal(false)} 
                        disabled={isGenerating}
                        className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={isGenerating}
                        className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors flex justify-center items-center gap-2"
                    >
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : "Generate"}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGeneration;