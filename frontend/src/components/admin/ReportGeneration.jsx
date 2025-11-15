// components/admin/ReportGeneration.jsx
import React from 'react';

const ReportGeneration = () => {
  const reports = [
    { id: 1, name: 'Monthly Sales Report', type: 'Sales', date: '2024-03-01', status: 'Generated' },
    { id: 2, name: 'User Growth Analysis', type: 'Users', date: '2024-03-15', status: 'Pending' },
    { id: 3, name: 'Product Performance', type: 'Products', date: '2024-03-10', status: 'Generated' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Report Generation</h2>
          <p className="text-gray-600">Generate and manage platform reports</p>
        </div>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
          Generate New Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border text-center">
          <div className="text-2xl font-bold text-purple-600 mb-2">1,247</div>
          <div className="text-gray-600">Total Users</div>
        </div>
        <div className="bg-white rounded-xl p-6 border text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">$89,450</div>
          <div className="text-gray-600">Total Sales</div>
        </div>
        <div className="bg-white rounded-xl p-6 border text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">3,842</div>
          <div className="text-gray-600">Total Orders</div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{report.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      report.status === 'Generated' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">Download</button>
                      <button className="text-green-600 hover:text-green-900">Regenerate</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportGeneration;