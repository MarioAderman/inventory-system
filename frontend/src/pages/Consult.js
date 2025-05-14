import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getInventoryValue } from '../services/api';
import { format } from 'date-fns';

const Consult = () => {
  const [inventoryData, setInventoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    setLoading(true);
    try {
      const res = await getInventoryValue();
      setInventoryData(res.data);
      setMessage(res.data.message || '');
    } catch (err) {
      setMessage('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const computeMetrics = () => {
    if (!inventoryData?.fifoData) return {};

    let totalInventoryValue = 0;
    let totalProfit = 0;
    let totalCOGS = 0;

    Object.values(inventoryData.fifoData).forEach(({ purchases, sales }) => {
      let sold = [...sales];
      let fifoPurchases = [...purchases].sort((a, b) => a.batch_id - b.batch_id);

      // Calculate remaining inventory value
      fifoPurchases.forEach(batch => {
        totalInventoryValue += batch.quantity * batch.cost_per_unit;
      });

      // Calculate COGS & Profit
      fifoPurchases.forEach(batch => {
        while (sold.length > 0 && batch.quantity > 0) {
          const sale = sold[0];
          const qtyToSell = Math.min(batch.quantity, sale.quantity);

          totalCOGS += qtyToSell * batch.cost_per_unit;

          // Assume sale price = cost + 30% for this example
          const estimatedPrice = batch.cost_per_unit * 1.3;
          totalProfit += qtyToSell * (estimatedPrice - batch.cost_per_unit);

          batch.quantity -= qtyToSell;
          sale.quantity -= qtyToSell;

          if (sale.quantity === 0) sold.shift();
        }
      });
    });

    return { totalInventoryValue, totalProfit, totalCOGS };
  };

  const { totalInventoryValue, totalProfit, totalCOGS } = computeMetrics();

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Inventory Metrics</h1>

        {message && (
          <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
            {message}
          </div>
        )}

        <div className="mb-6 flex gap-4 flex-wrap">
          <div className="flex flex-col">
            <label className="text-sm">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-2 py-1 border dark:border-gray-600"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded px-2 py-1 border dark:border-gray-600"
            />
          </div>
          <button
            onClick={fetchInventoryData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded self-end"
          >
            Refresh Data
          </button>
        </div>

        {loading ? (
          <p>Loading metrics...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-md">
              <h2 className="text-xl font-semibold mb-2">Total Inventory Value</h2>
              <p className="text-2xl font-bold">${totalInventoryValue.toFixed(2)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-md">
              <h2 className="text-xl font-semibold mb-2">Total Profit</h2>
              <p className="text-2xl font-bold">${totalProfit.toFixed(2)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded shadow-md">
              <h2 className="text-xl font-semibold mb-2">Total COGS</h2>
              <p className="text-2xl font-bold">${totalCOGS.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Consult;
