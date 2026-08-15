import { Calendar, Download, Search, X } from 'lucide-react';
import { Card } from '../components/Card';
import { StatusChip } from '../components/StatusChip';
import { BillTypeIcon, getBillTypeLabel } from '../components/BillTypeIcon';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { useApp } from '../context/AppContext';
import { useState } from 'react';
import { useToast } from '../components/Toast';

export function TransactionHistory() {
  const { escrows: promises } = useApp();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [billTypeFilter, setBillTypeFilter] = useState('all');
  const [selectedTransaction, setSelectedTransaction] = useState<typeof promises[0] | null>(null);

  const filteredPromises = promises.filter(promise => {
    const matchesSearch = promise.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         promise.billDetails.provider?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || promise.status === statusFilter;
    const matchesBillType = billTypeFilter === 'all' || promise.billType === billTypeFilter;

    return matchesSearch && matchesStatus && matchesBillType;
  });

  const getDaysLeft = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Expired';
    return `${days} ${days === 1 ? 'day' : 'days'} left`;
  };

  return (
    <>
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#1E293B]">Transaction History</h1>
        <div className="flex gap-2">
          <Button variant="secondary">
            <Download size={16} />
            Download PDF
          </Button>
          <Button variant="secondary">
            <Download size={16} />
            Download CSV
          </Button>
        </div>
      </div>

      <Card>
        <div className="grid md:grid-cols-4 gap-4">
          <Input
            placeholder="Search recipient or provider..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search size={20} />}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-[#E2E8F0] rounded-2xl bg-white"
          >
            <option value="all">All Status</option>
            <option value="locked">Locked</option>
            <option value="pending">Pending</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="expired">Expired</option>
            <option value="disputed">Disputed</option>
          </select>

          <select
            value={billTypeFilter}
            onChange={(e) => setBillTypeFilter(e.target.value)}
            className="px-4 py-2 border border-[#E2E8F0] rounded-2xl bg-white"
          >
            <option value="all">All Bill Types</option>
            <option value="tuition">Tuition</option>
            <option value="electricity">Electricity</option>
            <option value="water">Water</option>
            <option value="internet">Internet</option>
            <option value="medical">Medical</option>
            <option value="rent">Rent</option>
            <option value="grocery">Grocery</option>
            <option value="medicine">Medicine</option>
            <option value="savings">Savings</option>
            <option value="custom">Custom</option>
          </select>

          <div className="flex items-center gap-2 px-4 py-2 border border-[#E2E8F0] rounded-2xl bg-white">
            <Calendar size={20} className="text-[#64748B]" />
            <input
              type="date"
              className="flex-1 outline-none text-sm"
              placeholder="Date range"
            />
          </div>
        </div>
      </Card>

      {filteredPromises.length === 0 ? (
        <Card>
          <EmptyState
            title="No transactions found"
            description="Try adjusting your filters or search term"
          />
        </Card>
      ) : (
        <>
          <div className="hidden md:block">
            <Card className="overflow-hidden p-0">
              <table className="w-full">
                <thead className="bg-[#EFF6FF]">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#1E293B]">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#1E293B]">Recipient</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#1E293B]">Bill Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#1E293B]">Amount</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#1E293B]">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-[#1E293B]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredPromises.map(promise => (
                    <tr
                      key={promise.id}
                      className="hover:bg-[#EFF6FF] transition-colors cursor-pointer"
                      onClick={() => setSelectedTransaction(promise)}
                    >
                      <td className="px-6 py-4 text-sm text-[#64748B]">
                        {new Date(promise.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#1E293B] font-medium">
                        {promise.recipientName}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <BillTypeIcon type={promise.billType} size={16} />
                          <span className="text-sm text-[#1E293B]">{getBillTypeLabel(promise.billType)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono font-semibold text-[#1E293B]">
                        ₱{promise.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <StatusChip status={promise.status} />
                      </td>
                      <td className="px-6 py-4">
                        <Button variant="ghost" className="text-sm" onClick={(e) => { e.stopPropagation(); setSelectedTransaction(promise); }}>View Details</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>

          <div className="md:hidden space-y-3">
            {filteredPromises.map(promise => (
              <Card key={promise.id} hoverable onClick={() => setSelectedTransaction(promise)}>
                <div className="flex items-start gap-3">
                  <BillTypeIcon type={promise.billType} />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-[#1E293B]">{getBillTypeLabel(promise.billType)}</h3>
                        <p className="text-sm text-[#64748B]">{promise.recipientName}</p>
                      </div>
                      <StatusChip status={promise.status} />
                    </div>
                    <p className="text-lg font-mono font-bold text-[#1E293B]">₱{promise.amount.toLocaleString()}</p>
                    <p className="text-sm text-[#64748B]">{new Date(promise.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {selectedTransaction && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedTransaction(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-3">
                <BillTypeIcon type={selectedTransaction.billType} size={32} />
                <div>
                  <h2 className="text-2xl font-bold text-[#1E293B]">{getBillTypeLabel(selectedTransaction.billType)} Transaction</h2>
                  <p className="text-[#64748B]">To {selectedTransaction.recipientName}</p>
                </div>
              </div>
              <button onClick={() => setSelectedTransaction(null)} className="text-[#64748B] hover:text-[#1E293B]">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-[#EFF6FF] rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B]">Amount</span>
                  <span className="text-3xl font-mono font-bold text-[#1E293B]">₱{selectedTransaction.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#64748B]">Status</span>
                  <StatusChip status={selectedTransaction.status} />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#64748B] mb-1">Recipient Name</p>
                  <p className="font-semibold text-[#1E293B]">{selectedTransaction.recipientName}</p>
                </div>
                <div>
                  <p className="text-sm text-[#64748B] mb-1">Deadline</p>
                  <p className="font-semibold text-[#1E293B]">{new Date(selectedTransaction.deadline).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-[#64748B] mb-1">Created</p>
                  <p className="font-semibold text-[#1E293B]">{new Date(selectedTransaction.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-[#64748B] mb-1">Time Left</p>
                  <p className="font-semibold text-[#1E293B]">{getDaysLeft(selectedTransaction.deadline)}</p>
                </div>
              </div>

              {Object.keys(selectedTransaction.billDetails).length > 0 && (
                <div>
                  <p className="text-sm text-[#64748B] mb-2">Bill Details</p>
                  <div className="bg-[#EFF6FF] p-4 rounded-2xl space-y-2">
                    {Object.entries(selectedTransaction.billDetails).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-[#64748B] capitalize">{key}</span>
                        <span className="font-semibold text-[#1E293B]">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-[#E2E8F0]">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => showToast('success', 'Transaction exported to PDF')}
                >
                  Export PDF
                </Button>
                <Button onClick={() => setSelectedTransaction(null)} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
