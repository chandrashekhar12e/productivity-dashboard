import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Activity, TrendingUp, Clock, Package, AlertCircle } from 'lucide-react';

const API_BASE = 'https://api.anthropic.com/v1/messages';

const ProductivityDashboard = () => {
  const [factoryMetrics, setFactoryMetrics] = useState(null);
  const [workerMetrics, setWorkerMetrics] = useState([]);
  const [stationMetrics, setStationMetrics] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  
  const initializeData = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Generate realistic productivity data for a factory with 6 workers and 6 workstations. Return ONLY valid JSON with no preamble or markdown.

Structure:
{
  "factory": {
    "totalProductiveTime": <hours>,
    "totalProductionCount": <units>,
    "avgProductionRate": <units/hour>,
    "avgUtilization": <percentage>
  },
  "workers": [
    {
      "id": "W1",
      "name": "<name>",
      "activeTime": <hours>,
      "idleTime": <hours>,
      "utilization": <percentage>,
      "unitsProduced": <count>,
      "unitsPerHour": <rate>
    }
    // ... 6 workers total
  ],
  "stations": [
    {
      "id": "S1",
      "name": "<station name>",
      "occupancyTime": <hours>,
      "utilization": <percentage>,
      "unitsProduced": <count>,
      "throughputRate": <units/hour>
    }
    // ... 6 stations total
  ]
}

Make data realistic for an 8-hour shift. Ensure metrics are consistent.`
          }]
        })
      });

      const data = await response.json();
      const text = data.content[0].text.replace(/```json|```/g, '').trim();
      const metrics = JSON.parse(text);

      setFactoryMetrics(metrics.factory);
      setWorkerMetrics(metrics.workers);
      setStationMetrics(metrics.stations);
    } catch (error) {
      console.error('Error loading data:', error);
      
      setFactoryMetrics({
        totalProductiveTime: 42.5,
        totalProductionCount: 1847,
        avgProductionRate: 43.5,
        avgUtilization: 88.5
      });
      setWorkerMetrics([
        { id: 'W1', name: 'John Smith', activeTime: 7.2, idleTime: 0.8, utilization: 90, unitsProduced: 312, unitsPerHour: 43.3 },
        { id: 'W2', name: 'Maria Garcia', activeTime: 7.5, idleTime: 0.5, utilization: 93.8, unitsProduced: 328, unitsPerHour: 43.7 },
        { id: 'W3', name: 'James Johnson', activeTime: 6.8, idleTime: 1.2, utilization: 85, unitsProduced: 289, unitsPerHour: 42.5 },
        { id: 'W4', name: 'Sarah Lee', activeTime: 7.1, idleTime: 0.9, utilization: 88.8, unitsProduced: 305, unitsPerHour: 43 },
        { id: 'W5', name: 'Robert Chen', activeTime: 7.4, idleTime: 0.6, utilization: 92.5, unitsProduced: 321, unitsPerHour: 43.4 },
        { id: 'W6', name: 'Lisa Williams', activeTime: 6.5, idleTime: 1.5, utilization: 81.3, unitsProduced: 292, unitsPerHour: 44.9 }
      ]);
      setStationMetrics([
        { id: 'S1', name: 'Assembly Line A', occupancyTime: 7.3, utilization: 91.3, unitsProduced: 315, throughputRate: 43.2 },
        { id: 'S2', name: 'Assembly Line B', occupancyTime: 7.1, utilization: 88.8, unitsProduced: 308, throughputRate: 43.4 },
        { id: 'S3', name: 'Quality Check', occupancyTime: 6.9, utilization: 86.3, unitsProduced: 301, throughputRate: 43.6 },
        { id: 'S4', name: 'Packaging Unit', occupancyTime: 7.5, utilization: 93.8, unitsProduced: 325, throughputRate: 43.3 },
        { id: 'S5', name: 'Welding Station', occupancyTime: 6.7, utilization: 83.8, unitsProduced: 298, throughputRate: 44.5 },
        { id: 'S6', name: 'Paint Booth', occupancyTime: 7.0, utilization: 87.5, unitsProduced: 300, throughputRate: 42.9 }
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    initializeData();
  }, []);

  const handleRefreshData = async () => {
    setRefreshing(true);
    await initializeData();
    setRefreshing(false);
  };

  const MetricCard = ({ icon: Icon, label, value, unit, color }) => (
    <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900">
            {value}
            <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
          </p>
        </div>
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const utilizationData = workerMetrics.map(w => ({
    name: w.name.split(' ')[0],
    utilization: w.utilization
  }));

  const productionData = workerMetrics.map(w => ({
    name: w.name.split(' ')[0],
    units: w.unitsProduced
  }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Factory Productivity Dashboard</h1>
          <p className="text-blue-100">Real-time AI-powered worker and workstation monitoring</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Factory Overview</h2>
          <button
            onClick={handleRefreshData}
            disabled={refreshing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>

        {factoryMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              icon={Clock}
              label="Total Productive Time"
              value={factoryMetrics.totalProductiveTime.toFixed(1)}
              unit="hours"
              color="#3B82F6"
            />
            <MetricCard
              icon={Package}
              label="Total Production"
              value={factoryMetrics.totalProductionCount}
              unit="units"
              color="#10B981"
            />
            <MetricCard
              icon={TrendingUp}
              label="Avg Production Rate"
              value={factoryMetrics.avgProductionRate.toFixed(1)}
              unit="units/hr"
              color="#F59E0B"
            />
            <MetricCard
              icon={Activity}
              label="Avg Utilization"
              value={factoryMetrics.avgUtilization.toFixed(1)}
              unit="%"
              color="#8B5CF6"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Worker Utilization</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="utilization" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Production by Worker</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={productionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="units"
                >
                  {productionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Worker Metrics
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Worker</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Util %</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {workerMetrics.map((worker, idx) => (
                    <tr
                      key={worker.id}
                      onClick={() => setSelectedWorker(selectedWorker?.id === worker.id ? null : worker)}
                      className="hover:bg-blue-50 cursor-pointer"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{worker.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{worker.activeTime.toFixed(1)}h</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          worker.utilization >= 90 ? 'bg-green-100 text-green-800' :
                          worker.utilization >= 80 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {worker.utilization.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{worker.unitsProduced}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {selectedWorker && (
              <div className="p-4 bg-blue-50 border-t border-blue-100">
                <h4 className="font-semibold text-gray-800 mb-2">{selectedWorker.name} - Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Idle Time:</p>
                    <p className="font-semibold">{selectedWorker.idleTime.toFixed(1)} hours</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Production Rate:</p>
                    <p className="font-semibold">{selectedWorker.unitsPerHour.toFixed(1)} units/hr</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Workstation Metrics
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Station</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Occupancy</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Util %</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stationMetrics.map((station) => (
                    <tr
                      key={station.id}
                      onClick={() => setSelectedStation(selectedStation?.id === station.id ? null : station)}
                      className="hover:bg-blue-50 cursor-pointer"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{station.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{station.occupancyTime.toFixed(1)}h</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          station.utilization >= 90 ? 'bg-green-100 text-green-800' :
                          station.utilization >= 80 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {station.utilization.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{station.unitsProduced}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {selectedStation && (
              <div className="p-4 bg-blue-50 border-t border-blue-100">
                <h4 className="font-semibold text-gray-800 mb-2">{selectedStation.name} - Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Throughput Rate:</p>
                    <p className="font-semibold">{selectedStation.throughputRate.toFixed(1)} units/hr</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Units:</p>
                    <p className="font-semibold">{selectedStation.unitsProduced} units</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-semibold mb-1">Demo Mode</p>
            <p>This dashboard displays simulated data. In production, metrics would be computed from real AI event streams stored in the database.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductivityDashboard;