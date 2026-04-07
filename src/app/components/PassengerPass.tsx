import { QrCode, CreditCard, ShieldCheck, Download } from 'lucide-react';
import { PassengerUser } from '../types/metro';

interface PassengerPassProps {
  user: PassengerUser;
}

export function PassengerPass({ user }: PassengerPassProps) {
  const qrData = `METRO-PASS-${user.cardNumber}-${user.id}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}&color=0f172a&bgcolor=ffffff`;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-md mx-auto">
      <div className="w-full flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-500 rounded-lg">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Digital Pass</h3>
        </div>
        <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          Verified
        </div>
      </div>

      {/* QR Code Area */}
      <div className="relative p-4 bg-white rounded-2xl border-2 border-slate-100 dark:border-slate-800 mb-6 group cursor-pointer overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/5 dark:bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Download className="w-8 h-8 text-slate-600 dark:text-slate-300 transform translate-y-4 group-hover:translate-y-0 transition-transform" />
        </div>
        <img 
          src={qrUrl} 
          alt="Passenger QR Code" 
          className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
          onLoad={(e) => (e.currentTarget.style.opacity = '1')}
          style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
        />
      </div>

      {/* Card Info */}
      <div className="w-full space-y-4">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg">
              <CreditCard className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Smart Card Number</p>
              <p className="text-sm font-mono font-bold text-slate-900 dark:text-white">{user.cardNumber}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Holder Name</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Account Status</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Active</p>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 px-4">
          Scan this QR code at any Metro or Railway gate sensor to authenticate your journey. Ensure your balance is maintained.
        </p>
      </div>
    </div>
  );
}
