import React from 'react';
import { Order } from '@/lib/types/order';
import { format } from 'date-fns';
import { Logo } from '@/components/ui/Logo';

interface InvoiceTemplateProps {
  order: Order;
}

const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ order }) => {
  return (
    <div className="p-12 bg-white text-zinc-900 font-sans w-[800px] min-h-[1100px] border border-zinc-200">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-8 mb-8">
        <div>
          <Logo variant="black" width={120} height={30} className="mb-2" />
          <p className="text-sm font-bold text-zinc-500 uppercase tracking-[0.2em]">Official B2B Order Invoice</p>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-black uppercase mb-1 tracking-tighter">Invoice</h2>
          <p className="text-sm font-mono font-bold text-zinc-600">#{order.id.toString().padStart(6, '0')}</p>
          <p className="text-[10px] font-black text-zinc-400 mt-2 uppercase tracking-widest">{format(new Date(order.createdAt), "MMMM d, yyyy")}</p>
        </div>
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-2 gap-16 mb-16">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 border-b border-zinc-100 pb-1">From</h3>
          {/* <Logo variant="black" width={120} height={30} className="mb-2" /> */}
          <p className="text-xs text-zinc-500 leading-relaxed mt-2 font-medium">
            Yenibosna Merkez mh. Meryem Ana sk.,<br />
            Bahcelievler, No: 20/22,<br />
            34197 Istanbul, Turkiye
          </p>
          <p className="text-xs font-black mt-3 text-red-600">proseries@stafupro.com</p>
        </div>
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 border-b border-zinc-100 pb-1">Bill To</h3>
          <p className="font-black text-base uppercase tracking-tight">{order.dealer?.companyName}</p>
          <p className="text-xs text-zinc-500 leading-relaxed mt-2 font-medium whitespace-pre-line">
            {order.dealer?.address || "No address provided"}
          </p>
          <div className="mt-3 flex flex-col gap-1">
            {order.dealer?.phone && (
              <p className="text-xs font-bold text-zinc-700">T: {order.dealer.phone}</p>
            )}
            <p className="text-[10px] text-zinc-400 font-bold font-mono tracking-tighter uppercase">ID: STF-{order.dealerId}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-12 table-fixed">
        <thead>
          <tr className="border-b-2 border-zinc-900">
            <th className="py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-500 w-[45%]">Description</th>
            <th className="py-4 text-left text-[10px] font-black uppercase tracking-widest text-zinc-500 w-[20%] pl-4">SKU</th>
            <th className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-zinc-500 w-[10%]">Qty</th>
            <th className="py-4 text-right text-[10px] font-black uppercase tracking-widest text-zinc-500 w-[12%]">Unit Price</th>
            <th className="py-4 text-right text-[10px] font-black uppercase tracking-widest text-zinc-500 w-[13%]">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200">
          {order.items.map((item) => (
            <tr key={item.id} className="group">
              <td className="py-5 pr-4">
                <p className="font-black text-[13px] uppercase leading-tight tracking-tight text-zinc-900">{item.productVariant.product.title}</p>
                <p className="text-[10px] text-zinc-500 font-bold mt-1.5 uppercase tracking-wide">{item.productVariant.title}</p>
              </td>
              <td className="py-5 pl-4 align-top">
                <p className="text-[10px] font-mono font-bold text-zinc-600 break-all leading-relaxed bg-zinc-50 p-1.5 rounded border border-zinc-100 italic">{item.productVariant.sku || "N/A"}</p>
              </td>
              <td className="py-5 text-center align-top">
                <span className="text-sm font-black text-zinc-900">{item.quantity}</span>
              </td>
              <td className="py-5 text-right align-top">
                <span className="text-xs font-mono font-bold text-zinc-700">₺{Number(item.unitPrice).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </td>
              <td className="py-5 text-right align-top">
                <span className="text-sm font-mono font-black text-zinc-900">₺{(Number(item.unitPrice) * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals & Signature */}
      <div className="flex justify-between items-start mt-12">
        <div className="w-[45%]">
                   
          {/* Signature Section */}
          <div className="mt-16 group">
             <div className="w-64 border-b-2 border-zinc-900 pb-2">
                {/* Visual line for signature */}
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-3 pl-2 italic">Authorized Dealer Signature</p>
          </div>
        </div>

        <div className="w-[35%]">
          <div className="space-y-4">
            <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase tracking-[0.1em]">
              <span>Subtotal</span>
              <span className="font-mono text-zinc-900">₺{Number(order.totalAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-zinc-500 uppercase tracking-[0.1em]">
              <span>Taxes (0%)</span>
              <span className="font-mono text-zinc-900">₺0,00</span>
            </div>
            <div className="pt-6 border-t-4 border-zinc-900 flex justify-between items-center">
              <span className="text-base font-black uppercase tracking-tighter">Total Due</span>
              <div className="text-right">
                <span className="text-red-600 font-mono text-2xl font-black tracking-tighter">
                  ₺{Number(order.totalAmount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-32 pt-8 border-t border-zinc-100 text-center">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em]">
          THANK YOU FOR YOUR CONTINUED PARTNERSHIP
        </p>
        <p className="text-[9px] font-bold text-zinc-300 mt-2">© 2026 STAFU PRO SERIES. ALL RIGHTS RESERVED.</p>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
