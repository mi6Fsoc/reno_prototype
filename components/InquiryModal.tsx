import React, { useState } from 'react';
import Button from './Button';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlanName?: string;
  propertyAddress?: string;
}

const InquiryModal: React.FC<InquiryModalProps> = ({
  isOpen,
  onClose,
  selectedPlanName = 'Portfolio Retrofit',
  propertyAddress = '',
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: propertyAddress,
    unitsCount: '6–12 units',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 700);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-[#181A20] border border-[#3E3426] rounded-[8px] p-6 sm:p-8 shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleResetAndClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 w-8 h-8 rounded-[6px] bg-[#221E19] border border-[#352D21] hover:border-primary text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
        >
          <i className="fas fa-times text-xs"></i>
        </button>

        {isSubmitted ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#25211B] border border-primary text-primary mx-auto flex items-center justify-center text-2xl">
              <i className="fas fa-check"></i>
            </div>
            <h3 className="text-2xl font-display font-semibold text-white">Inquiry Received</h3>
            <p className="text-sm font-serif-editorial text-[#FFE8B8] max-w-md mx-auto text-base">
              A certified Berlin renovation engineer from our advisory team will review your property dossier and contact you within 24 business hours.
            </p>
            <div className="p-3 bg-[#221E19] rounded-[6px] border border-[#322A1F] text-xs font-mono text-zinc-400">
              Reference: <span className="text-[#FFE8B8]">RENO-BER-{Math.floor(100000 + Math.random() * 900000)}</span>
            </div>
            <div className="pt-4">
              <Button onClick={handleResetAndClose} variant="primary" className="w-full">
                Return to Planner
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-[11px] font-mono uppercase tracking-wider text-primary">
                Berlin Technical Advisory
              </span>
              <h3 className="text-2xl font-display font-semibold text-white mt-1">
                Initiate Renovation Consultation
              </h3>
              <p className="text-xs font-mono text-zinc-400 mt-1">
                Selected Advisory: <span className="text-[#FFE8B8]">{selectedPlanName}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Felix Hoffmann"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#14151A] border border-[#322A1F] focus:border-primary focus:outline-none rounded-[6px] text-xs font-mono text-white placeholder:text-zinc-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    placeholder="name@propertyfund.de"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-[#14151A] border border-[#322A1F] focus:border-primary focus:outline-none rounded-[6px] text-xs font-mono text-white placeholder:text-zinc-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+49 30 12345678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-[#14151A] border border-[#322A1F] focus:border-primary focus:outline-none rounded-[6px] text-xs font-mono text-white placeholder:text-zinc-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-zinc-300 mb-1">Property Size / Units</label>
                  <select
                    value={formData.unitsCount}
                    onChange={(e) => setFormData({ ...formData, unitsCount: e.target.value })}
                    className="w-full px-3 py-2 bg-[#14151A] border border-[#322A1F] focus:border-primary focus:outline-none rounded-[6px] text-xs font-mono text-white"
                  >
                    <option value="1–5 units">1–5 units (Single Asset)</option>
                    <option value="6–12 units">6–12 units (Typical Altbau)</option>
                    <option value="13–30 units">13–30 units (Large Multifamily)</option>
                    <option value="30+ units">30+ units (Portfolio / Housing Co.)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">Property Address</label>
                <input
                  type="text"
                  placeholder="e.g. Torstraße 45, 10119 Berlin"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 bg-[#14151A] border border-[#322A1F] focus:border-primary focus:outline-none rounded-[6px] text-xs font-mono text-white placeholder:text-zinc-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1">Specific Objectives (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Seeking KfW 261 subsidy filing before Q3, tenant rent apportionment..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-[#14151A] border border-[#322A1F] focus:border-primary focus:outline-none rounded-[6px] text-xs font-mono text-white placeholder:text-zinc-600 resize-none"
                />
              </div>

              <div className="pt-2">
                <Button type="submit" isLoading={isSubmitting} variant="primary" className="w-full">
                  Submit Consultation Request
                </Button>
                <p className="text-[11px] font-mono text-center text-zinc-500 mt-2">
                  No commitment required · Confidential property evaluation
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default InquiryModal;
