import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  DollarSign,
  Zap,
  TrendingUp,
  Search,
  Download,
  Trash2,
  Send,
  Plus,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  XCircle,
  Package,
} from 'lucide-react';
import { CheckoutRecord, Retailer } from '../types';

interface CheckoutsPageProps {
  checkouts: CheckoutRecord[];
  onAddCheckout: (record: CheckoutRecord) => Promise<void>;
  onDeleteCheckout: (id: string) => Promise<void>;
  onClearCheckouts: () => Promise<void>;
  discordWebhookUrl?: string;
}

export const CheckoutsPage: React.FC<CheckoutsPageProps> = ({
  checkouts,
  onAddCheckout,
  onDeleteCheckout,
  onClearCheckouts,
  discordWebhookUrl,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRetailer, setSelectedRetailer] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New order form state
  const [newOrder, setNewOrder] = useState<{
    orderId: string;
    retailer: Retailer;
    productName: string;
    identifier: string;
    price: string;
    profileName: string;
    cardMask: string;
    latency: string;
    status: 'COMPLETED' | 'CANCELLED' | 'PENDING_SHIPMENT';
  }>({
    orderId: '',
    retailer: 'bestbuy',
    productName: '',
    identifier: '',
    price: '54.99',
    profileName: 'Primary Profile',
    cardMask: '•••• 4242',
    latency: '340',
    status: 'COMPLETED',
  });

  // Calculate high-level summary metrics
  const stats = useMemo(() => {
    const totalOrders = checkouts.length;
    let totalSpend = 0;
    let totalLatency = 0;
    let validLatencyCount = 0;
    const retailerCounts: Record<string, number> = {};

    checkouts.forEach((c) => {
      const priceNum = typeof c.price === 'number' ? c.price : parseFloat(String(c.price).replace(/[^0-9.]/g, ''));
      if (!isNaN(priceNum) && c.status === 'COMPLETED') {
        totalSpend += priceNum;
      }
      if (c.latency > 0) {
        totalLatency += c.latency;
        validLatencyCount++;
      }
      retailerCounts[c.retailer] = (retailerCounts[c.retailer] || 0) + 1;
    });

    const avgLatency = validLatencyCount > 0 ? Math.round(totalLatency / validLatencyCount) : 0;
    let topRetailer = 'None';
    let maxCount = 0;
    Object.entries(retailerCounts).forEach(([ret, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topRetailer = ret.toUpperCase();
      }
    });

    return {
      totalOrders,
      totalSpend: totalSpend.toFixed(2),
      avgLatency,
      topRetailer,
    };
  }, [checkouts]);

  // Filter and search
  const filteredCheckouts = useMemo(() => {
    return checkouts.filter((c) => {
      const matchesSearch =
        searchQuery === '' ||
        c.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.profileName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRetailer = selectedRetailer === 'all' || c.retailer === selectedRetailer;
      const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;

      return matchesSearch && matchesRetailer && matchesStatus;
    });
  }, [checkouts, searchQuery, selectedRetailer, selectedStatus]);

  const handleCopyOrderId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendWebhook = async (record: CheckoutRecord) => {
    if (!discordWebhookUrl) {
      setWebhookStatus('Error: No Discord Webhook URL configured in Settings!');
      setTimeout(() => setWebhookStatus(null), 3500);
      return;
    }

    if (window.blankBotAPI?.sendDiscordWebhook) {
      try {
        await window.blankBotAPI.sendDiscordWebhook(discordWebhookUrl, {
          title: `Checkout: ${record.productName}`,
          sku: record.identifier,
          retailer: record.retailer,
          price: `$${record.price}`,
          profileName: record.profileName,
          maskedCard: record.cardMask || '•••• 4242',
          latency: record.latency || 450,
          orderId: record.orderId,
        });
        setWebhookStatus(`Discord notification sent for Order #${record.orderId}!`);
        setTimeout(() => setWebhookStatus(null), 3000);
      } catch (err: any) {
        setWebhookStatus(`Failed to send webhook: ${err?.message || err}`);
        setTimeout(() => setWebhookStatus(null), 3500);
      }
    }
  };

  const handleExportCSV = () => {
    if (checkouts.length === 0) return;
    const headers = ['Order ID', 'Date', 'Retailer', 'Product', 'SKU/ASIN', 'Price', 'Profile', 'Latency(ms)', 'Status'];
    const rows = checkouts.map((c) => [
      `"${c.orderId}"`,
      `"${new Date(c.timestamp).toISOString()}"`,
      `"${c.retailer}"`,
      `"${c.productName.replace(/"/g, '""')}"`,
      `"${c.identifier}"`,
      `"${c.price}"`,
      `"${c.profileName}"`,
      c.latency,
      `"${c.status}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `blank_bot_checkouts_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    if (checkouts.length === 0) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(checkouts, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `blank_bot_checkouts_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const orderId =
      newOrder.orderId.trim() ||
      `${newOrder.retailer.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const record: CheckoutRecord = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      orderId,
      retailer: newOrder.retailer,
      productName: newOrder.productName.trim() || 'Custom Checkout Item',
      identifier: newOrder.identifier.trim() || 'MANUAL-INPUT',
      price: parseFloat(newOrder.price) || 0,
      profileName: newOrder.profileName.trim() || 'Manual Profile',
      cardMask: newOrder.cardMask.trim() || '•••• 4242',
      latency: parseInt(newOrder.latency) || 350,
      timestamp: Date.now(),
      status: newOrder.status,
    };

    await onAddCheckout(record);
    setIsAddModalOpen(false);
    setNewOrder({
      orderId: '',
      retailer: 'bestbuy',
      productName: '',
      identifier: '',
      price: '54.99',
      profileName: 'Primary Profile',
      cardMask: '•••• 4242',
      latency: '340',
      status: 'COMPLETED',
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-surface-950 overflow-y-auto">
      {/* Toast Notification */}
      {webhookStatus && (
        <div className="fixed top-4 right-4 z-50 bg-surface-900 border border-emerald-500/60 shadow-xl px-4 py-3 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300 animate-in fade-in slide-in-from-top-2">
          <Send className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{webhookStatus}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 border-b border-surface-800/80 bg-surface-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">Checkouts &amp; Order History</h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-medium">
                {checkouts.length} Logged
              </span>
            </div>
            <p className="text-xs text-surface-400 mt-1">
              Historical ledger of all automated and manual retail settlements, order IDs, latencies, and transaction records.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md hover:shadow-emerald-900/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Order</span>
            </button>
            <button
              onClick={handleExportCSV}
              disabled={checkouts.length === 0}
              className="px-3 py-1.5 bg-surface-800 hover:bg-surface-700 text-surface-200 disabled:opacity-40 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              disabled={checkouts.length === 0}
              className="px-3 py-1.5 bg-surface-800 hover:bg-surface-700 text-surface-200 disabled:opacity-40 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>
            {checkouts.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear all logged checkouts? This action cannot be undone.')) {
                    onClearCheckouts();
                  }
                }}
                className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-800/40 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          <div className="p-3.5 rounded-xl bg-surface-900/80 border border-surface-800/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-surface-400 uppercase tracking-wider block">Total Orders</span>
              <span className="text-xl font-bold text-white mt-0.5 block">{stats.totalOrders}</span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-900/80 border border-surface-800/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-surface-400 uppercase tracking-wider block">Total Spent</span>
              <span className="text-xl font-bold text-white mt-0.5 block">${stats.totalSpend}</span>
            </div>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-900/80 border border-surface-800/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-surface-400 uppercase tracking-wider block">Average Latency</span>
              <span className="text-xl font-bold text-white mt-0.5 block">
                {stats.avgLatency > 0 ? `${stats.avgLatency}ms` : '—'}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Zap className="w-4 h-4" />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-900/80 border border-surface-800/80 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-surface-400 uppercase tracking-wider block">Top Retailer</span>
              <span className="text-xl font-bold text-white mt-0.5 block">{stats.topRetailer}</span>
            </div>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 border-b border-surface-800/60 bg-surface-900/20 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-surface-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Order #, SKU, Item name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surface-900 border border-surface-800 rounded-lg text-xs text-white placeholder-surface-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={selectedRetailer}
            onChange={(e) => setSelectedRetailer(e.target.value)}
            className="px-2.5 py-1.5 bg-surface-900 border border-surface-800 rounded-lg text-xs text-surface-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Retailers</option>
            <option value="bestbuy">Best Buy</option>
            <option value="walmart">Walmart</option>
            <option value="target">Target</option>
            <option value="amazon">Amazon</option>
            <option value="apple">Apple</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-surface-900 border border-surface-800 rounded-lg text-xs text-surface-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING_SHIPMENT">Pending Shipment</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="p-6">
        {filteredCheckouts.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-surface-800/80 rounded-2xl bg-surface-900/20">
            <Package className="w-10 h-10 text-surface-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-surface-200">No Checkouts Found</h3>
            <p className="text-xs text-surface-400 mt-1 max-w-sm mx-auto">
              {searchQuery || selectedRetailer !== 'all' || selectedStatus !== 'all'
                ? 'No past orders matched your filters. Try resetting your search parameters.'
                : 'When your automated tasks achieve successful checkouts, they will be logged here synchronously with their Order IDs and latencies.'}
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 px-3.5 py-1.5 bg-surface-800 hover:bg-surface-700 text-emerald-400 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Manual Order</span>
            </button>
          </div>
        ) : (
          <div className="border border-surface-800/80 rounded-xl overflow-hidden bg-surface-900/40">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-800 bg-surface-900/80 text-[11px] font-mono text-surface-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Date / Time</th>
                  <th className="py-3 px-3">Retailer</th>
                  <th className="py-3 px-4">Item &amp; Target</th>
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-3">Profile</th>
                  <th className="py-3 px-3">Latency</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/50 text-xs">
                {filteredCheckouts.map((record) => (
                  <tr key={record.id} className="hover:bg-surface-850/40 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-4 whitespace-nowrap text-surface-300">
                      <div className="font-mono text-[11px] text-surface-300">
                        {new Date(record.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-surface-400">
                        {new Date(record.timestamp).toLocaleTimeString()}
                      </div>
                    </td>

                    {/* Retailer */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          record.retailer === 'bestbuy'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : record.retailer === 'walmart'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : record.retailer === 'target'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : record.retailer === 'amazon'
                            ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                            : 'bg-zinc-500/10 text-zinc-300 border border-zinc-500/20'
                        }`}
                      >
                        {record.retailer}
                      </span>
                    </td>

                    {/* Product Name & SKU */}
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-semibold text-white truncate" title={record.productName}>
                        {record.productName}
                      </div>
                      <div className="text-[10px] text-surface-400 font-mono flex items-center gap-1.5 mt-0.5">
                        <span>SKU: {record.identifier}</span>
                        {record.isDryRun && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 text-[9px] font-bold">
                            DRY-RUN
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Order ID */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-emerald-400 font-medium">{record.orderId}</span>
                        <button
                          onClick={() => handleCopyOrderId(record.orderId)}
                          className="p-1 text-surface-400 hover:text-white rounded transition-colors"
                          title="Copy Order ID"
                        >
                          {copiedId === record.orderId ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Profile */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="text-surface-200 font-medium">{record.profileName}</div>
                      <div className="text-[10px] text-surface-400 font-mono">
                        {record.cardMask || '•••• 4242'}
                      </div>
                    </td>

                    {/* Latency */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-emerald-400 font-mono font-medium">
                        <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span>{record.latency}ms</span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-3 whitespace-nowrap font-bold text-white font-mono">
                      ${typeof record.price === 'number' ? record.price.toFixed(2) : record.price}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          record.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : record.status === 'PENDING_SHIPMENT'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-red-500/10 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {record.status === 'COMPLETED' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : record.status === 'PENDING_SHIPMENT' ? (
                          <Clock className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        <span>{record.status}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleSendWebhook(record)}
                          className="p-1.5 text-surface-400 hover:text-emerald-400 hover:bg-surface-800 rounded-lg transition-all"
                          title="Send to Discord Webhook"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteCheckout(record.id)}
                          className="p-1.5 text-surface-400 hover:text-red-400 hover:bg-surface-800 rounded-lg transition-all"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Order Creation Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-5 border-b border-surface-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">Record Manual Order / Checkout</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-surface-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManualOrder} className="p-5 space-y-3.5">
              <div>
                <label className="text-[11px] font-mono text-surface-400 uppercase tracking-wider block mb-1">
                  Retailer
                </label>
                <select
                  value={newOrder.retailer}
                  onChange={(e) => setNewOrder({ ...newOrder, retailer: e.target.value as Retailer })}
                  className="w-full px-3 py-2 bg-surface-950 border border-surface-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="bestbuy">Best Buy US</option>
                  <option value="walmart">Walmart Supercenter</option>
                  <option value="target">Target Operations</option>
                  <option value="amazon">Amazon Direct</option>
                  <option value="apple">Apple Store</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-mono text-surface-400 uppercase tracking-wider block mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pokémon Chaos Rising Booster Box"
                  value={newOrder.productName}
                  onChange={(e) => setNewOrder({ ...newOrder, productName: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-950 border border-surface-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-surface-400 uppercase tracking-wider block mb-1">
                    SKU / ASIN
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 6578912"
                    value={newOrder.identifier}
                    onChange={(e) => setNewOrder({ ...newOrder, identifier: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-950 border border-surface-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-surface-400 uppercase tracking-wider block mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={newOrder.price}
                    onChange={(e) => setNewOrder({ ...newOrder, price: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-950 border border-surface-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-surface-400 uppercase tracking-wider block mb-1">
                    Order ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Leave blank to auto-generate"
                    value={newOrder.orderId}
                    onChange={(e) => setNewOrder({ ...newOrder, orderId: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-950 border border-surface-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-surface-400 uppercase tracking-wider block mb-1">
                    Latency (ms)
                  </label>
                  <input
                    type="number"
                    value={newOrder.latency}
                    onChange={(e) => setNewOrder({ ...newOrder, latency: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-950 border border-surface-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-surface-400 uppercase tracking-wider block mb-1">
                    Profile Name
                  </label>
                  <input
                    type="text"
                    value={newOrder.profileName}
                    onChange={(e) => setNewOrder({ ...newOrder, profileName: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-950 border border-surface-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-mono text-surface-400 uppercase tracking-wider block mb-1">
                    Status
                  </label>
                  <select
                    value={newOrder.status}
                    onChange={(e) =>
                      setNewOrder({
                        ...newOrder,
                        status: e.target.value as 'COMPLETED' | 'CANCELLED' | 'PENDING_SHIPMENT',
                      })
                    }
                    className="w-full px-3 py-2 bg-surface-950 border border-surface-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="COMPLETED">Completed</option>
                    <option value="PENDING_SHIPMENT">Pending Shipment</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-surface-800/80">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 bg-surface-800 hover:bg-surface-700 text-surface-300 rounded-lg text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-emerald-950"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
