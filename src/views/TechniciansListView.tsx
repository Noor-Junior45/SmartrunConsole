import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  Filter, 
  Phone, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MapPin, 
  Star, 
  Edit, 
  Trash2, 
  Flame, 
  ShieldCheck, 
  Briefcase, 
  Loader2, 
  RefreshCw,
  ExternalLink,
  UserCheck,
  UserX,
  Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../context/ToastContext';
import { Technician, TechnicianSector, TechnicianStatus, VerificationStatus } from '../types';
import { DeleteTechnicianModal } from '../components/DeleteTechnicianModal';

interface TechniciansListViewProps {
  onCreateTechnician: () => void;
  onEditTechnician: (id: string) => void;
}

const SECTOR_FILTERS: (TechnicianSector | 'All')[] = [
  'All',
  'Electrician',
  'Plumber',
  'HVAC Technician',
  'Carpenter',
  'Mason',
  'Painter',
  'Appliance Repair',
  'Security & CCTV',
  'Solar & Inverter',
  'General Maintenance',
];

export function TechniciansListView({
  onCreateTechnician,
  onEditTechnician,
}: TechniciansListViewProps) {
  const { showToast } = useToast();
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState<TechnicianSector | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<TechnicianStatus | 'All'>('All');
  const [verificationFilter, setVerificationFilter] = useState<VerificationStatus | 'All'>('All');
  const [selectedForDelete, setSelectedForDelete] = useState<Technician | null>(null);
  const [isUpdatingStatusId, setIsUpdatingStatusId] = useState<string | null>(null);

  // Fetch technicians from Supabase
  const loadTechnicians = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('technicians')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTechnicians(data || []);
    } catch (err: unknown) {
      console.error('Error fetching technicians:', err);
      showToast({
        type: 'error',
        title: 'Load Failed',
        description: err instanceof Error ? err.message : 'Could not fetch technicians list.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTechnicians();
  }, []);

  // Quick inline status change (available / busy / offline)
  const handleQuickStatusChange = async (techId: string, newStatus: TechnicianStatus) => {
    setIsUpdatingStatusId(techId);
    try {
      const statusCaptions: Record<TechnicianStatus, string> = {
        available: 'Available for booking',
        busy: 'Busy on a job',
        offline: 'Offline',
      };

      const { error } = await supabase
        .from('technicians')
        .update({
          status: newStatus,
          status_text: statusCaptions[newStatus],
        })
        .eq('id', techId);

      if (error) throw error;

      setTechnicians((prev) =>
        prev.map((t) =>
          t.id === techId
            ? { ...t, status: newStatus, status_text: statusCaptions[newStatus] }
            : t
        )
      );

      showToast({
        type: 'success',
        title: 'Status Updated',
        description: `Technician status updated to ${newStatus}.`,
      });
    } catch (err: unknown) {
      console.error('Error updating status:', err);
      showToast({
        type: 'error',
        title: 'Update Failed',
        description: err instanceof Error ? err.message : 'Could not update status.',
      });
    } finally {
      setIsUpdatingStatusId(null);
    }
  };

  // Filtered list
  const filteredTechnicians = useMemo(() => {
    return technicians.filter((tech) => {
      // Sector filter
      if (sectorFilter !== 'All' && tech.primary_sector !== sectorFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'All' && tech.status !== statusFilter) {
        return false;
      }

      // Verification filter
      if (verificationFilter !== 'All' && tech.verification_status !== verificationFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = tech.name?.toLowerCase().includes(query);
        const matchPhone = tech.phone?.toLowerCase().includes(query);
        const matchTitle = tech.title?.toLowerCase().includes(query);
        const matchBadge = tech.badge_id?.toLowerCase().includes(query);
        const matchSector = tech.primary_sector?.toLowerCase().includes(query);
        const matchArea = (tech.service_areas || []).some((a) =>
          a.toLowerCase().includes(query)
        );
        const matchSubSector = (tech.sub_sectors || []).some((s) =>
          s.toLowerCase().includes(query)
        );

        if (
          !matchName &&
          !matchPhone &&
          !matchTitle &&
          !matchBadge &&
          !matchSector &&
          !matchArea &&
          !matchSubSector
        ) {
          return false;
        }
      }

      return true;
    });
  }, [technicians, sectorFilter, statusFilter, verificationFilter, searchQuery]);

  // Key stats
  const totalCount = technicians.length;
  const availableCount = technicians.filter((t) => t.status === 'available').length;
  const verifiedCount = technicians.filter((t) => t.verification_status === 'verified').length;
  const emergencyCount = technicians.filter((t) => t.emergency_support).length;

  return (
    <div id="technicians-management-view" className="space-y-6 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a1716]/10 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-[#2e4a3d] text-white flex items-center justify-center shadow-xs">
              <Wrench className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-display font-bold italic tracking-tight text-[#1a1716]">
              Field Technicians Roster
            </h1>
          </div>
          <p className="text-xs font-mono text-[#1a1716]/60 mt-1">
            Manage certified electricians, plumbers, and maintenance specialists linked to Giriraj services
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadTechnicians}
            disabled={isLoading}
            className="p-2 bg-white hover:bg-slate-100 border border-[#1a1716]/15 rounded-sm transition cursor-pointer text-[#1a1716]"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={onCreateTechnician}
            className="px-4 py-2 bg-[#2e4a3d] hover:bg-[#2e4a3d]/90 text-white text-xs font-mono uppercase tracking-wider font-bold rounded-sm transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Technician</span>
          </button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 border border-[#1a1716]/10 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-[#1a1716]/60">Total Roster</span>
            <Wrench className="w-4 h-4 text-[#2e4a3d]" />
          </div>
          <div className="text-2xl font-mono font-bold text-[#1a1716] mt-1">{totalCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Active profiles on Supabase</div>
        </div>

        <div className="bg-white p-4 border border-[#1a1716]/10 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-[#1a1716]/60">Available Now</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-700 mt-1">{availableCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Ready for instant dispatch</div>
        </div>

        <div className="bg-white p-4 border border-[#1a1716]/10 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-[#1a1716]/60">Verified Pros</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-blue-800 mt-1">{verifiedCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">ID & license vetted</div>
        </div>

        <div className="bg-white p-4 border border-[#1a1716]/10 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-[#1a1716]/60">24/7 Emergency</span>
            <Flame className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-rose-800 mt-1">{emergencyCount}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Night & urgent coverage</div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 border border-[#1a1716]/10 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by technician name, phone, area (e.g. Saltlake), or sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-[#f2efeb]/50 border border-[#1a1716]/15 rounded-sm focus:outline-none focus:border-[#2e4a3d]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-mono"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TechnicianStatus | 'All')}
              className="text-xs px-2.5 py-2 bg-[#f2efeb]/50 border border-[#1a1716]/15 rounded-sm focus:outline-none font-mono"
            >
              <option value="All">All Statuses</option>
              <option value="available">🟢 Available</option>
              <option value="busy">🟡 Busy</option>
              <option value="offline">⚪ Offline</option>
            </select>

            {/* Verification filter */}
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value as VerificationStatus | 'All')}
              className="text-xs px-2.5 py-2 bg-[#f2efeb]/50 border border-[#1a1716]/15 rounded-sm focus:outline-none font-mono"
            >
              <option value="All">All Verifications</option>
              <option value="verified">✅ Verified</option>
              <option value="pending">⏳ Pending</option>
              <option value="under_review">🔍 Under Review</option>
              <option value="rejected">❌ Rejected</option>
            </select>
          </div>
        </div>

        {/* Sector Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-[#1a1716]/10">
          <span className="text-[10px] font-mono text-slate-500 uppercase mr-1">Sector:</span>
          {SECTOR_FILTERS.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setSectorFilter(sec)}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-sm transition cursor-pointer ${
                sectorFilter === sec
                  ? 'bg-[#2e4a3d] text-white font-bold shadow-xs'
                  : 'bg-[#f2efeb]/70 hover:bg-[#f2efeb] text-[#1a1716]/80'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* Technicians List / Cards */}
      {isLoading ? (
        <div className="min-h-[300px] bg-white border border-[#1a1716]/10 flex flex-col items-center justify-center gap-3 text-slate-500 font-mono">
          <Loader2 className="w-8 h-8 animate-spin text-[#2e4a3d]" />
          <p className="text-xs uppercase tracking-wider font-semibold">Loading Technicians...</p>
        </div>
      ) : filteredTechnicians.length === 0 ? (
        <div className="bg-white border border-dashed border-[#1a1716]/20 p-12 text-center rounded-sm">
          <Wrench className="w-10 h-10 text-[#1a1716]/30 mx-auto mb-3" />
          <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-[#1a1716]">
            No Technicians Found
          </h3>
          <p className="text-xs text-[#1a1716]/60 max-w-md mx-auto mt-1 mb-4">
            {searchQuery || sectorFilter !== 'All' || statusFilter !== 'All'
              ? 'Try changing your search keywords or filter criteria.'
              : 'Add your first certified technician to activate service bookings.'}
          </p>
          <button
            type="button"
            onClick={onCreateTechnician}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2e4a3d] text-white text-xs font-mono uppercase tracking-wider rounded-sm font-semibold hover:bg-[#2e4a3d]/90 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Technician</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTechnicians.map((tech) => {
            const isAvailable = tech.status === 'available';
            const isBusy = tech.status === 'busy';
            const isUpdating = isUpdatingStatusId === tech.id;

            return (
              <div
                key={tech.id}
                className="bg-white border border-[#1a1716]/15 hover:border-[#2e4a3d]/50 transition-all rounded-sm shadow-2xs flex flex-col justify-between overflow-hidden"
              >
                {/* Card Top / Header */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    {/* Avatar with Status indicator */}
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                        {tech.photo ? (
                          <img
                            src={tech.photo}
                            alt={tech.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-lg">
                            {tech.name?.charAt(0) || 'T'}
                          </div>
                        )}
                      </div>

                      {/* Status dot */}
                      <span
                        className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                          isAvailable
                            ? 'bg-emerald-500'
                            : isBusy
                            ? 'bg-amber-500'
                            : 'bg-slate-400'
                        }`}
                        title={`Status: ${tech.status}`}
                      />
                    </div>

                    {/* Quick Status Dropdown */}
                    <div className="flex flex-col items-end gap-1">
                      <select
                        value={tech.status}
                        disabled={isUpdating}
                        onChange={(e) =>
                          handleQuickStatusChange(tech.id, e.target.value as TechnicianStatus)
                        }
                        className={`text-[11px] font-mono font-semibold px-2 py-1 rounded-sm border cursor-pointer ${
                          isAvailable
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : isBusy
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="available">🟢 Available</option>
                        <option value="busy">🟡 Busy</option>
                        <option value="offline">⚪ Offline</option>
                      </select>

                      {tech.featured && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded-xs border border-amber-200 font-bold">
                          <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                          Featured
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Name & Sector */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-[#1a1716] tracking-tight">
                        {tech.name}
                      </h3>
                      {tech.verification_status === 'verified' && (
                        <ShieldCheck
                          className="w-4 h-4 text-blue-600 shrink-0"
                          title="Verified Specialist"
                        />
                      )}
                    </div>

                    <div className="text-xs text-[#1a1716]/70 flex items-center gap-1.5 font-medium">
                      <span>{tech.title || 'Specialist'}</span>
                      <span>&bull;</span>
                      <span className="font-mono text-[11px] text-[#2e4a3d] font-bold">
                        {tech.primary_sector}
                      </span>
                    </div>

                    {tech.badge_id && (
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        ID: {tech.badge_id}
                      </div>
                    )}
                  </div>

                  {/* Rating, Experience & Emergency Badge */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono pt-1">
                    <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded-xs text-amber-900 border border-amber-200">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="font-bold">{tech.rating ?? '5.0'}</span>
                      <span className="text-[10px] text-amber-700">({tech.reviews_count || 0})</span>
                    </div>

                    <div className="text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-xs">
                      {tech.experience_years} yrs exp
                    </div>

                    {tech.completed_jobs ? (
                      <div className="text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-xs">
                        {tech.completed_jobs} jobs
                      </div>
                    ) : null}

                    {tech.emergency_support && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-xs border border-rose-200 font-bold uppercase">
                        <Flame className="w-3 h-3 text-rose-600" />
                        24/7
                      </span>
                    )}
                  </div>

                  {/* Pricing */}
                  <div className="p-2 bg-[#f2efeb]/60 rounded-sm border border-[#1a1716]/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-[#1a1716]/70 text-[11px]">Starting Rate:</span>
                    <span className="font-bold text-[#2e4a3d]">
                      ₹{tech.starting_rate}{' '}
                      <span className="text-[10px] text-slate-500 font-normal">
                        / {tech.rate_unit || 'visit'}
                      </span>
                    </span>
                  </div>

                  {/* Service Areas */}
                  {(tech.service_areas || []).length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      {tech.service_areas?.slice(0, 3).map((area) => (
                        <span
                          key={area}
                          className="text-[10px] font-mono px-1.5 py-0.2 bg-white border border-slate-200 text-slate-700 rounded-xs"
                        >
                          {area}
                        </span>
                      ))}
                      {(tech.service_areas?.length || 0) > 3 && (
                        <span className="text-[10px] font-mono text-slate-400">
                          +{(tech.service_areas?.length || 0) - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Sub sectors / specialties */}
                  {(tech.sub_sectors || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {tech.sub_sectors?.slice(0, 3).map((sub) => (
                        <span
                          key={sub}
                          className="text-[10px] font-mono px-1.5 py-0.2 bg-[#2e4a3d]/5 text-[#2e4a3d] rounded-xs"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Bottom / Actions */}
                <div className="p-3 bg-slate-50 border-t border-[#1a1716]/10 flex items-center justify-between gap-2">
                  {/* Quick Contact buttons */}
                  <div className="flex items-center gap-1.5">
                    {tech.phone && (
                      <a
                        href={`tel:${tech.phone}`}
                        className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-sm transition flex items-center gap-1 text-[11px] font-mono"
                        title={`Call ${tech.phone}`}
                      >
                        <Phone className="w-3.5 h-3.5 text-[#2e4a3d]" />
                        <span className="hidden sm:inline">{tech.phone}</span>
                      </a>
                    )}

                    {tech.whatsapp && (
                      <a
                        href={`https://wa.me/${tech.whatsapp.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-emerald-700 rounded-sm transition flex items-center gap-1 text-[11px] font-mono"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      </a>
                    )}
                  </div>

                  {/* Edit / Delete Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditTechnician(tech.id)}
                      className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-[#2e4a3d] rounded-sm transition cursor-pointer"
                      title="Edit technician"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedForDelete(tech)}
                      className="p-1.5 bg-white hover:bg-rose-50 border border-slate-200 text-slate-700 hover:text-rose-600 rounded-sm transition cursor-pointer"
                      title="Delete technician"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteTechnicianModal
        technician={selectedForDelete}
        isOpen={Boolean(selectedForDelete)}
        onClose={() => setSelectedForDelete(null)}
        onDeleted={(deletedId) => {
          setTechnicians((prev) => prev.filter((t) => t.id !== deletedId));
          setSelectedForDelete(null);
        }}
      />
    </div>
  );
}
