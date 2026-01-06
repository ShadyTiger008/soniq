"use client";

import { useState } from "react";
import { X, Send, Bug, LifeBuoy, MessageSquare, CheckCircle2 } from "lucide-react";
import { apiClient } from "@frontend/lib/api-client";
import { toast } from "sonner";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal = ({ isOpen, onClose }: SupportModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    type: "BUG" as "BUG" | "HELP" | "FEEDBACK",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await apiClient.submitSupport(formData);
      if (response.success) {
        setIsSuccess(true);
        setFormData({ name: "", email: "", type: "BUG", message: "" });
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 3000);
      } else {
        toast.error(response.error || "Failed to submit report");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-[#0A0A0A] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300">
        
        {/* Header Decor */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#3FE080] to-transparent opacity-50" />
        
        {/* Success State Overlay */}
        {isSuccess && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0A0A0A] p-8 text-center animate-in fade-in duration-500">
             <div className="mb-6 h-20 w-20 rounded-full bg-[#3FE080]/10 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-[#3FE080] animate-bounce" />
             </div>
             <h3 className="mb-2 text-2xl font-black text-white italic tracking-tight">VIBE RECEIVED!</h3>
             <p className="text-[#A0A0B0] font-medium leading-relaxed">
               Your report has been sent to our DJs. We'll get back to you at <strong>{formData.email}</strong> as soon as possible.
             </p>
          </div>
        )}

        <div className="p-8 sm:p-10">
          <div className="mb-8 flex items-center justify-between">
            <div>
               <h2 className="text-3xl font-black text-white tracking-tighter italic">SUPPORT</h2>
               <p className="text-xs font-bold text-[#3FE080] uppercase tracking-[0.2em] mt-1">Found a bug or need help?</p>
            </div>
            <button 
              onClick={onClose}
              className="rounded-full bg-white/5 p-2 text-[#606070] transition-colors hover:bg-white/10 hover:text-white"
            >
               <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[#606070]">Your Name</label>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter name"
                    className="w-full rounded-2xl border border-white/5 bg-white/5 p-4 text-sm font-bold text-white placeholder-[#303040] transition-all focus:border-[#3FE080]/50 focus:bg-white/10 focus:outline-none"
                  />
               </div>
               <div>
                  <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[#606070]">Email Address</label>
                  <input 
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="name@example.com"
                    className="w-full rounded-2xl border border-white/5 bg-white/5 p-4 text-sm font-bold text-white placeholder-[#303040] transition-all focus:border-[#3FE080]/50 focus:bg-white/10 focus:outline-none"
                  />
               </div>
            </div>

            <div>
               <label className="mb-3 block text-[10px] font-black uppercase tracking-widest text-[#606070]">Issue Type</label>
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'BUG', label: 'Bug Report', icon: Bug },
                    { id: 'HELP', label: 'Get Help', icon: LifeBuoy },
                    { id: 'FEEDBACK', label: 'Feedback', icon: MessageSquare },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFormData({...formData, type: type.id as any})}
                      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border p-4 transition-all ${
                        formData.type === type.id 
                        ? "border-[#3FE080] bg-[#3FE080]/10 text-[#3FE080]" 
                        : "border-white/5 bg-white/5 text-[#606070] hover:bg-white/10 hover:text-white"
                      }`}
                    >
                       <type.icon className="h-5 w-5" />
                       <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                    </button>
                  ))}
               </div>
            </div>

            <div>
               <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-[#606070]">Description</label>
               <textarea 
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Tell us what happened..."
                  className="w-full resize-none rounded-2xl border border-white/5 bg-white/5 p-4 text-sm font-bold text-white placeholder-[#303040] transition-all focus:border-[#3FE080]/50 focus:bg-white/10 focus:outline-none"
               />
            </div>

            <button
               type="submit"
               disabled={isSubmitting}
               className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-[#3FE080] py-5 font-black text-black uppercase tracking-widest transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(63,224,128,0.3)] disabled:opacity-50 disabled:scale-100"
            >
               {isSubmitting ? (
                 <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
               ) : (
                 <>
                   <span>Submit Report</span>
                   <Send className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                 </>
               )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
