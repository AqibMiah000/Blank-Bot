import React, { useState } from 'react';
import { Plus, CreditCard, Sparkles, Trash2, Edit2, ShieldCheck, MapPin, Upload } from 'lucide-react';
import { BillingProfile } from '../types';
import { ProfileModal } from '../components/ProfileModal';
import { AddressJigModal } from '../components/AddressJigModal';
import { AYCDImportModal } from '../components/AYCDImportModal';

interface ProfilesPageProps {
  profiles: BillingProfile[];
  onSaveProfile: (profile: BillingProfile) => Promise<void>;
  onDeleteProfile: (profileId: string) => Promise<void>;
}

export const ProfilesPage: React.FC<ProfilesPageProps> = ({
  profiles,
  onSaveProfile,
  onDeleteProfile,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJigOpen, setIsJigOpen] = useState(false);
  const [isAYCDModalOpen, setIsAYCDModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<BillingProfile | null>(null);
  const [jigBaseAddress, setJigBaseAddress] = useState<any>(null);

  const handleOpenJig = (baseAddress: any) => {
    setJigBaseAddress(baseAddress);
    setIsJigOpen(true);
  };

  const handleImportAYCDProfiles = async (newProfiles: BillingProfile[]) => {
    for (const p of newProfiles) {
      await onSaveProfile(p);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-surface-950 overflow-hidden">
      {/* Action Header */}
      <div className="p-4 px-6 border-b border-surface-800 flex items-center justify-between bg-surface-900/40">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setEditingProfile(null);
              setIsModalOpen(true);
            }}
            className="px-3.5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Profile</span>
          </button>
          <button
            onClick={() => setIsAYCDModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-indigo-600/30 to-brand-600/30 hover:from-indigo-600/40 hover:to-brand-600/40 text-brand-200 border border-brand-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            title="Import or Export profiles with AYCD Profile Builder (JSON & CSV)"
          >
            <Upload className="w-4 h-4 text-brand-400" />
            <span>AYCD Toolbox Sync</span>
          </button>
          <button
            onClick={() => {
              setJigBaseAddress(profiles[0]?.shippingAddress || null);
              setIsJigOpen(true);
            }}
            className="px-3.5 py-2 bg-surface-800 hover:bg-surface-700 text-brand-300 border border-brand-500/30 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Address Jig Tool</span>
          </button>
        </div>

        <div className="flex items-center space-x-2 text-xs text-surface-400 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>AES-256-GCM Hardware Encrypted</span>
        </div>
      </div>

      {/* Profile Cards Grid */}
      <div className="flex-1 p-6 overflow-y-auto">
        {profiles.length === 0 ? (
          <div className="h-72 flex flex-col items-center justify-center text-surface-500 space-y-3">
            <CreditCard className="w-12 h-12 text-surface-700" />
            <p className="text-sm font-medium">No billing profiles found.</p>
            <p className="text-xs text-surface-600">
              Add your shipping and virtual payment cards to start checking out.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="bg-surface-900 border border-surface-800/90 rounded-2xl p-5 space-y-4 hover:border-brand-500/40 transition-all shadow-lg hover:shadow-brand-500/5 group"
              >
                {/* Profile Top Bar */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      {profile.profileName}
                    </h3>
                    <span className="text-[11px] text-surface-400 font-mono">
                      {profile.email}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setEditingProfile(profile);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-400 hover:text-white"
                      title="Edit Profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteProfile(profile.id)}
                      className="p-1.5 rounded-lg bg-surface-800 hover:bg-rose-600/20 text-surface-400 hover:text-rose-400"
                      title="Delete Profile"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Virtual Card Representation */}
                <div className="bg-gradient-to-tr from-surface-950 to-surface-900 p-3.5 rounded-xl border border-surface-700/60 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold uppercase tracking-wider text-brand-400">
                      {profile.payment.cardBrand}
                    </span>
                    <span className="text-surface-500 font-mono">
                      {profile.payment.expMonth}/{profile.payment.expYear}
                    </span>
                  </div>
                  <div className="font-mono text-sm tracking-widest text-slate-100 font-bold">
                    {profile.payment.maskedPan}
                  </div>
                  <div className="text-[11px] text-surface-400 truncate">
                    {profile.payment.cardholderName}
                  </div>
                </div>

                {/* Shipping Snippet */}
                <div className="text-xs text-surface-400 space-y-1 pt-1 border-t border-surface-800/80">
                  <div className="flex items-center space-x-1.5 text-surface-300 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                    <span className="truncate">{profile.shippingAddress.fullName}</span>
                  </div>
                  <div className="font-mono text-[11px] text-surface-400 pl-5 truncate">
                    {profile.shippingAddress.addressLine1}
                    {profile.shippingAddress.addressLine2
                      ? `, ${profile.shippingAddress.addressLine2}`
                      : ''}
                    , {profile.shippingAddress.city} {profile.shippingAddress.state}{' '}
                    {profile.shippingAddress.zipCode}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ProfileModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProfile(null);
        }}
        onSave={onSaveProfile}
        initialProfile={editingProfile}
        onOpenJigModal={handleOpenJig}
      />

      <AddressJigModal
        isOpen={isJigOpen}
        onClose={() => setIsJigOpen(false)}
        baseAddress={jigBaseAddress}
      />

      <AYCDImportModal
        isOpen={isAYCDModalOpen}
        onClose={() => setIsAYCDModalOpen(false)}
        onImportProfiles={handleImportAYCDProfiles}
        existingProfiles={profiles}
      />
    </div>
  );
};
