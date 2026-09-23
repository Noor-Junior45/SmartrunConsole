import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Wrench, 
  User, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  UploadCloud, 
  Star, 
  ShieldCheck, 
  Briefcase, 
  Plus, 
  X,
  Flame,
  Award,
  DollarSign
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../context/ToastContext';
import { Technician, TechnicianSector, TechnicianStatus, VerificationStatus } from '../types';

interface TechnicianFormViewProps {
  technicianId?: string;
  onCancel: () => void;
  onSuccess: () => void;
}

const SECTOR_OPTIONS: TechnicianSector[] = [
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

const COMMON_AREAS = [
  'Saltlake',
  'Newtown',
  'Rajarhat',
  'Dumdum',
  'Kolkata Central',
  'Howrah',
  'Ballygunge',
  'Gariahat',
  'Behala',
  'Kasba',
];

export function TechnicianFormView({
  technicianId,
  onCancel,
  onSuccess,
}: TechnicianFormViewProps) {
  const isEditing = Boolean(technicianId);
  const { showToast } = useToast();

  // Basic Details
  const [name, setName] = useState('');
  const [title, setTitle] = useState('Senior Specialist');
  const [badgeId, setBadgeId] = useState('');
  const [experienceYears, setExperienceYears] = useState<string>('5');
  const [primarySector, setPrimarySector] = useState<TechnicianSector>('Electrician');
  const [photo, setPhoto] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Status & Verification
  const [status, setStatus] = useState<TechnicianStatus>('available');
  const [statusText, setStatusText] = useState('Available for booking');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('verified');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [featured, setFeatured] = useState(false);

  // Contact
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  // Service Details
  const [emergencySupport, setEmergencySupport] = useState(false);
  const [workingHours, setWorkingHours] = useState('10:00 AM TO 6:00 PM');
  const [startingRate, setStartingRate] = useState<string>('399');
  const [rateUnit, setRateUnit] = useState('base inspection visit');

  // Arrays (Tags)
  const [serviceAreas, setServiceAreas] = useState<string[]>(['Saltlake', 'Newtown']);
  const [areaInput, setAreaInput] = useState('');

  const [subSectors, setSubSectors] = useState<string[]>([]);
  const [subSectorInput, setSubSectorInput] = useState('');

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  const [toolsCarried, setToolsCarried] = useState<string[]>([]);
  const [toolInput, setToolInput] = useState('');

  const [certifications, setCertifications] = useState<string[]>([]);
  const [certInput, setCertInput] = useState('');

  // Bio
  const [about, setAbout] = useState('');
  const [aiDescription, setAiDescription] = useState('');

  // Performance / Stats
  const [rating, setRating] = useState<string>('5.0');
  const [reviewsCount, setReviewsCount] = useState<string>('0');
  const [completedJobs, setCompletedJobs] = useState<string>('0');

  // UI state
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Load existing technician data
  useEffect(() => {
    if (!technicianId) return;

    let mounted = true;
    async function loadTechnician() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('technicians')
          .select('*')
          .eq('id', technicianId)
          .single();

        if (error) throw error;

        if (data && mounted) {
          setName(data.name || '');
          setTitle(data.title || 'Senior Specialist');
          setBadgeId(data.badge_id || '');
          setExperienceYears(data.experience_years !== undefined ? String(data.experience_years) : '5');
          setPrimarySector((data.primary_sector as TechnicianSector) || 'Electrician');
          setPhoto(data.photo || '');
          setStatus((data.status as TechnicianStatus) || 'available');
          setStatusText(data.status_text || 'Available for booking');
          setVerificationStatus((data.verification_status as VerificationStatus) || 'verified');
          setLicenseNumber(data.license_number || '');
          setIssuingAuthority(data.issuing_authority || '');
          setFeatured(Boolean(data.featured));

          setPhone(data.phone || '');
          setWhatsapp(data.whatsapp || '');
          setEmail(data.email || '');

          setEmergencySupport(Boolean(data.emergency_support));
          setWorkingHours(data.working_hours || '10:00 AM TO 6:00 PM');
          setStartingRate(data.starting_rate !== undefined ? String(data.starting_rate) : '399');
          setRateUnit(data.rate_unit || 'base inspection visit');

          setServiceAreas(Array.isArray(data.service_areas) ? data.service_areas : []);
          setSubSectors(Array.isArray(data.sub_sectors) ? data.sub_sectors : []);
          setSkills(Array.isArray(data.skills) ? data.skills : []);
          setToolsCarried(Array.isArray(data.tools_carried) ? data.tools_carried : []);
          setCertifications(Array.isArray(data.certifications) ? data.certifications : []);

          setAbout(data.about || '');
          setAiDescription(data.ai_description || '');

          setRating(data.rating !== undefined ? String(data.rating) : '5.0');
          setReviewsCount(data.reviews_count !== undefined ? String(data.reviews_count) : '0');
          setCompletedJobs(data.completed_jobs !== undefined ? String(data.completed_jobs) : '0');
        }
      } catch (err: unknown) {
        console.error('Error loading technician:', err);
        const msg = err instanceof Error ? err.message : 'Could not fetch technician details.';
        setFormError(msg);
        showToast({
          type: 'error',
          title: 'Load Failed',
          description: msg,
        });
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadTechnician();
    return () => {
      mounted = false;
    };
  }, [technicianId]);

  // Handle Photo Upload
  const handlePhotoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      showToast({
        type: 'warning',
        title: 'Invalid File',
        description: 'Please select an image file (JPG, PNG, WebP).',
      });
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `technicians/${crypto.randomUUID()}-${cleanName}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      if (publicUrlData?.publicUrl) {
        setPhoto(publicUrlData.publicUrl);
        showToast({
          type: 'success',
          title: 'Photo Uploaded',
          description: 'Technician avatar photo linked successfully.',
        });
      }
    } catch (err: unknown) {
      console.error('Photo upload error:', err);
      showToast({
        type: 'error',
        title: 'Upload Failed',
        description: err instanceof Error ? err.message : 'Could not upload technician photo.',
      });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Tag helper
  const addTag = (
    list: string[],
    setList: (arr: string[]) => void,
    val: string,
    setVal: (s: string) => void
  ) => {
    const trimmed = val.trim();
    if (!trimmed) return;
    if (!list.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      setList([...list, trimmed]);
    }
    setVal('');
  };

  const removeTag = (list: string[], setList: (arr: string[]) => void, itemToRemove: string) => {
    setList(list.filter((item) => item.toLowerCase() !== itemToRemove.toLowerCase()));
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Please enter technician name.');
      return;
    }

    if (!phone.trim()) {
      setFormError('Please enter technician contact phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<Technician> = {
        name: name.trim(),
        title: title.trim() || 'Senior Specialist',
        badge_id: badgeId.trim() || null,
        experience_years: Number(experienceYears) || 0,
        primary_sector: primarySector,
        sub_sectors: subSectors,
        photo: photo.trim() || null,
        rating: Number(rating) || 5.0,
        reviews_count: Number(reviewsCount) || 0,
        completed_jobs: Number(completedJobs) || 0,
        verification_status: verificationStatus,
        license_number: licenseNumber.trim() || null,
        issuing_authority: issuingAuthority.trim() || null,
        status,
        status_text: statusText.trim() || 'Available for booking',
        phone: phone.trim(),
        email: email.trim() || null,
        whatsapp: whatsapp.trim() || phone.trim() || null,
        emergency_support: emergencySupport,
        service_areas: serviceAreas,
        working_hours: workingHours.trim() || '10:00 AM TO 6:00 PM',
        starting_rate: Number(startingRate) || 0,
        rate_unit: rateUnit.trim() || 'base inspection visit',
        about: about.trim(),
        ai_description: aiDescription.trim() || null,
        certifications,
        skills,
        tools_carried: toolsCarried,
        featured,
      };

      if (isEditing && technicianId) {
        const { error } = await supabase
          .from('technicians')
          .update(payload)
          .eq('id', technicianId);

        if (error) throw error;

        showToast({
          type: 'success',
          title: 'Technician Updated',
          description: `Updated profile for "${name}".`,
        });
      } else {
        const newId = crypto.randomUUID();
        const { error } = await supabase
          .from('technicians')
          .insert({
            id: newId,
            ...payload,
            created_at: new Date().toISOString(),
          });

        if (error) throw error;

        showToast({
          type: 'success',
          title: 'Technician Added',
          description: `"${name}" is now on the active technician roster.`,
        });
      }

      onSuccess();
    } catch (err: unknown) {
      console.error('Error saving technician:', err);
      const msg = err instanceof Error ? err.message : 'Failed to save technician.';
      setFormError(msg);
      showToast({
        type: 'error',
        title: 'Save Failed',
        description: msg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-3 text-slate-500 font-mono">
        <Loader2 className="w-8 h-8 animate-spin text-[#2e4a3d]" />
        <p className="text-xs uppercase tracking-wider font-semibold">Loading Technician Record...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Header / Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1a1716]/10 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 bg-white hover:bg-slate-100 border border-[#1a1716]/15 rounded-sm transition cursor-pointer"
            title="Back to Technicians"
          >
            <ArrowLeft className="w-4 h-4 text-[#1a1716]" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-[#2e4a3d]" />
              <h1 className="text-xl font-display font-bold italic tracking-tight text-[#1a1716]">
                {isEditing ? `Edit Technician: ${name || 'Profile'}` : 'Register New Technician'}
              </h1>
            </div>
            <p className="text-xs font-mono text-[#1a1716]/60">
              {isEditing ? `ID: ${technicianId}` : 'Add verified field specialist to the Giriraj roster'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-mono uppercase tracking-wider bg-white border border-[#1a1716]/20 hover:bg-slate-100 text-[#1a1716] rounded-sm transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-mono uppercase tracking-wider font-bold bg-[#2e4a3d] hover:bg-[#2e4a3d]/90 text-white rounded-sm transition flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Save Changes' : 'Publish to Roster'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {formError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono flex items-center gap-2 rounded-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{formError}</span>
        </div>
      )}

      {/* Form Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN (2 Cols): Core Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Basic Profile & Photo */}
          <div className="bg-white p-6 border border-[#1a1716]/10 shadow-2xs space-y-4">
            <h2 className="font-mono text-xs uppercase tracking-wider font-bold text-[#1a1716] border-b border-[#1a1716]/10 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-[#2e4a3d]" />
              Technician Profile & Photo
            </h2>

            {/* Photo Avatar & Upload */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-[#f2efeb]/50 border border-[#1a1716]/10 rounded-sm">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-200 border-2 border-[#2e4a3d] shrink-0 shadow-sm">
                {photo ? (
                  <img src={photo} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <User className="w-8 h-8" />
                    <span className="text-[9px] font-mono mt-0.5">No Photo</span>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="text-xs font-semibold text-[#1a1716]">Profile Avatar</div>
                <p className="text-[11px] text-[#1a1716]/60">
                  Upload a clear portrait photo. Stored in public Supabase storage.
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <label className="px-3 py-1.5 bg-[#2e4a3d] hover:bg-[#2e4a3d]/90 text-white text-xs font-mono uppercase tracking-wider rounded-sm transition flex items-center gap-1.5 cursor-pointer">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{isUploadingPhoto ? 'Uploading...' : 'Upload Avatar'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      ref={photoInputRef}
                      disabled={isUploadingPhoto}
                      onChange={(e) => handlePhotoUpload(e.target.files)}
                      className="hidden"
                    />
                  </label>

                  {photo && (
                    <button
                      type="button"
                      onClick={() => setPhoto('')}
                      className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-mono rounded-sm transition"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="pt-1">
                  <input
                    type="url"
                    placeholder="Or paste direct image URL (https://...)"
                    value={photo}
                    onChange={(e) => setPhoto(e.target.value)}
                    className="w-full text-xs font-mono px-3 py-1.5 bg-white border border-[#1a1716]/20 rounded-sm focus:outline-none focus:border-[#2e4a3d]"
                  />
                </div>
              </div>
            </div>

            {/* Name, Title, Sector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-[#1a1716] mb-1">
                  Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deepak Giri, Ramesh Mondal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-[#1a1716]/20 rounded-sm focus:outline-none focus:border-[#2e4a3d]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-[#1a1716] mb-1">
                  Professional Title / Designation
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Master Electrician, Giri"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-[#1a1716]/20 rounded-sm focus:outline-none focus:border-[#2e4a3d]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-[#1a1716] mb-1">
                  Primary Sector <span className="text-rose-600">*</span>
                </label>
                <select
                  value={primarySector}
                  onChange={(e) => setPrimarySector(e.target.value as TechnicianSector)}
                  className="w-full text-xs px-3 py-2 bg-white border border-[#1a1716]/20 rounded-sm focus:outline-none focus:border-[#2e4a3d]"
                >
                  {SECTOR_OPTIONS.map((sec) => (
                    <option key={sec} value={sec}>
                      {sec}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-[#1a1716] mb-1">
                  Experience (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 bg-white border border-[#1a1716]/20 rounded-sm focus:outline-none focus:border-[#2e4a3d]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-[#1a1716] mb-1">
                  Badge ID / Staff Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. GIR-ELEC-01"
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 bg-white border border-[#1a1716]/20 rounded-sm focus:outline-none focus:border-[#2e4a3d]"
                />
              </div>
            </div>

            {/* Sub-sectors / Specialties */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-mono uppercase font-semibold text-[#1a1716]">
                Sub-sectors & Specializations
              </label>
              <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-[#f2efeb]/40 border border-[#1a1716]/15 rounded-sm">
                {subSectors.map((sec) => (
                  <span
                    key={sec}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#2e4a3d]/10 text-[#2e4a3d] text-xs font-mono rounded-xs"
                  >
                    <span>{sec}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(subSectors, setSubSectors, sec)}
                      className="text-[#2e4a3d] hover:text-rose-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <div className="flex-1 flex items-center min-w-[150px]">
                  <input
                    type="text"
                    placeholder="Add specialty (e.g. Inverter Wiring) & press Enter..."
                    value={subSectorInput}
                    onChange={(e) => setSubSectorInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(subSectors, setSubSectors, subSectorInput, setSubSectorInput);
                      }
                    }}
                    className="w-full text-xs px-2 py-1 bg-transparent focus:outline-none placeholder:text-slate-400"
                  />
                  {subSectorInput.trim() && (
                    <button
                      type="button"
                      onClick={() => addTag(subSectors, setSubSectors, subSectorInput, setSubSectorInput)}
                      className="px-2 py-0.5 bg-[#2e4a3d] text-white text-[10px] font-mono rounded-xs"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div className="bg-white p-6 border border-[#1a1716]/10 shadow-2xs space-y-4">
            <h2 className="font-mono text-xs uppercase tracking-wider font-bold text-[#1a1716] border-b border-[#1a1716]/10 pb-3 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#2e4a3d]" />
              Contact Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-[#1a1716] mb-1">
                  Phone Number <span className="text-rose-600">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 6239006295"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 bg-white border border-[#1a1716]/20 rounded-sm focus:outline-none focus:border-[#2e4a3d]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-[#1a1716] mb-1 flex items-center justify-between">
                  <span>WhatsApp Number</span>
                  {phone && whatsapp !== phone && (
                    <button
                      type="button"
                      onClick={() => setWhatsapp(phone)}
                      className="text-[10px] text-[#2e4a3d] hover:underline font-mono normal-case"
                    >
                      Same as phone
                    </button>
                  )}
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 6239006295"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 bg-white border border-[#1a1716]/20 rounded-sm focus:outline-none focus:border-[#2e4a3d]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-[#1a1716] mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="technician@giriraj.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-[#1a1716]/20 rounded-sm focus:outline-none focus:border-[#2e4a3d]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Pricing & Service Coverage */}
          <div className="bg-white p-6 border border-[#1a1716]/10 shadow-2xs space-y-4">
            <h2 className="font-mono text-xs uppercase tracking-wider font-bold text-[#1a1716] border-b border-[#1a1716]/10 pb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#2e4a3d]" />
              Rates & Service Coverage
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-[#1a1716] mb-1">
                  Starting Rate (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={startingRate}
                  onChange={(e) => setStartingRate(e.target.value)}
                  className="w-full text-xs font-mono font-bold px-3 py-2 bg-white border border-[#1a1716]/20 rounded-sm focus:outline-none focus:border-[#2e4a3d]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-[#1a1716] mb-1">
                  Rate Unit / Billing Basis
                </label>
                <input
                  type="text"
                  placeholder="e.g. base inspection visit, per hour"
                  value={rateUnit}
                  onChange={(e) => setRateUnit(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-[#1a1716]/20 rounded-sm focus:outline-none focus:border-[#2e4a3d]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase font-semibold text-[#1a1716] mb-1">
                  Working Hours
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10:00 AM TO 6:00 PM"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-[#1a1716]/20 rounded-sm focus:outline-none focus:border-[#2e4a3d]"
                />
              </div>
            </div>

            {/* Service Areas */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-mono uppercase font-semibold text-[#1a1716]">
                Service Areas / Neighborhoods
              </label>
              <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-[#f2efeb]/40 border border-[#1a1716]/15 rounded-sm">
                {serviceAreas.map((area) => (
                  <span
                    key={area}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-slate-200 text-slate-800 text-xs font-mono rounded-xs shadow-2xs"
                  >
                    <MapPin className="w-2.5 h-2.5 text-[#2e4a3d]" />
                    <span>{area}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(serviceAreas, setServiceAreas, area)}
                      className="text-slate-400 hover:text-rose-600 ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <div className="flex-1 flex items-center min-w-[150px]">
                  <input
                    type="text"
                    placeholder="Type area (e.g. Rajarhat) & press Enter..."
                    value={areaInput}
                    onChange={(e) => setAreaInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(serviceAreas, setServiceAreas, areaInput, setAreaInput);
                      }
                    }}
                    className="w-full text-xs px-2 py-1 bg-transparent focus:outline-none placeholder:text-slate-400"
                  />
                  {areaInput.trim() && (
                    <button
                      type="button"
                      onClick={() => addTag(serviceAreas, setServiceAreas, areaInput, setAreaInput)}
                      className="px-2 py-0.5 bg-[#2e4a3d] text-white text-[10px] font-mono rounded-xs"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>

              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-1 pt-1">
                <span className="text-[10px] text-slate-500 font-mono">Quick add:</span>
                {COMMON_AREAS.filter((ca) => !serviceAreas.includes(ca)).slice(0, 6).map((ca) => (
                  <button
                    key={ca}
                    type="button"
                    onClick={() => addTag(serviceAreas, setServiceAreas, ca, () => {})}
                    className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xs transition cursor-pointer"
                  >
                    + {ca}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Bio & AI Elevator Pitch */}
          <div className="bg-white p-6 border border-[#1a1716]/10 shadow-2xs space-y-4">
            <h2 className="font-mono text-xs uppercase tracking-wider font-bold text-[#1a1716] border-b border-[#1a1716]/10 pb-3">
              About & Credentials
            </h2>

            <div>
              <label className="block text-xs font-mono uppercase font-semibold text-[#1a1716] mb-1">
                About / Background Summary
              </label>
              <textarea
                rows={3}
                placeholder="Background, years in trade, residential and commercial experience..."
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-[#1a1716]/20 rounded-sm focus:outline-none focus:border-[#2e4a3d] leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase font-semibold text-[#1a1716] mb-1 flex items-center justify-between">
                <span>AI Profile Summary / Elevator Pitch</span>
                <span className="text-[10px] text-slate-400 font-normal">Highlighted on storefront cards</span>
              </label>
              <textarea
                rows={2}
                placeholder="Certified residential specialist with extensive experience in wiring, diagnosis, and clean installation..."
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-[#1a1716]/20 rounded-sm focus:outline-none focus:border-[#2e4a3d] leading-relaxed font-mono"
              />
            </div>

            {/* Skills & Tools */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <label className="block text-xs font-mono uppercase font-semibold text-[#1a1716]">
                  Key Skills
                </label>
                <div className="flex flex-wrap gap-1 p-2 bg-[#f2efeb]/40 border border-[#1a1716]/15 rounded-sm min-h-[34px]">
                  {skills.map((sk) => (
                    <span
                      key={sk}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white border border-slate-200 text-[11px] font-mono rounded-xs"
                    >
                      <span>{sk}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(skills, setSkills, sk)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="+ Add skill..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(skills, setSkills, skillInput, setSkillInput);
                      }
                    }}
                    className="text-xs px-1 py-0.5 bg-transparent focus:outline-none flex-1 min-w-[80px]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono uppercase font-semibold text-[#1a1716]">
                  Tools Carried
                </label>
                <div className="flex flex-wrap gap-1 p-2 bg-[#f2efeb]/40 border border-[#1a1716]/15 rounded-sm min-h-[34px]">
                  {toolsCarried.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white border border-slate-200 text-[11px] font-mono rounded-xs"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(toolsCarried, setToolsCarried, t)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    placeholder="+ Add tool..."
                    value={toolInput}
                    onChange={(e) => setToolInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(toolsCarried, setToolsCarried, toolInput, setToolInput);
                      }
                    }}
                    className="text-xs px-1 py-0.5 bg-transparent focus:outline-none flex-1 min-w-[80px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (1 Col): Status, Verification & Flags */}
        <div className="space-y-6">
          {/* Availability & Status */}
          <div className="bg-white p-6 border border-[#1a1716]/10 shadow-2xs space-y-4">
            <h2 className="font-mono text-xs uppercase tracking-wider font-bold text-[#1a1716] border-b border-[#1a1716]/10 pb-3">
              Availability & Visibility
            </h2>

            <div>
              <label className="block text-xs font-mono uppercase font-semibold text-[#1a1716] mb-1">
                Current Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TechnicianStatus)}
                className="w-full text-xs font-mono font-bold px-3 py-2 bg-white border border-[#1a1716]/20 rounded-sm focus:outline-none focus:border-[#2e4a3d]"
              >
                <option value="available">🟢 Available for booking</option>
                <option value="busy">🟡 Busy on a job</option>
                <option value="offline">⚪ Offline / Off Duty</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase font-semibold text-[#1a1716] mb-1">
                Status Caption Text
              </label>
              <input
                type="text"
                placeholder="e.g. Available for booking"
                value={statusText}
                onChange={(e) => setStatusText(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-[#1a1716]/20 rounded-sm focus:outline-none focus:border-[#2e4a3d]"
              />
            </div>

            {/* Emergency Support Toggle */}
            <div className="flex items-center justify-between gap-3 p-3 bg-rose-50 border border-rose-200 font-mono rounded-xs">
              <div>
                <div className="text-[11px] font-bold text-rose-950 flex items-center gap-1 uppercase">
                  <Flame className="w-3.5 h-3.5 text-rose-600" />
                  24/7 Emergency Calls
                </div>
                <div className="text-[10px] text-rose-800">Available for urgent repair jobs</div>
              </div>
              <button
                type="button"
                onClick={() => setEmergencySupport(!emergencySupport)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                  emergencySupport ? 'bg-rose-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                    emergencySupport ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Featured Technician Toggle */}
            <div className="flex items-center justify-between gap-3 p-3 bg-amber-50/70 border border-amber-200/60 font-mono rounded-xs">
              <div>
                <div className="text-[11px] font-bold text-amber-950 flex items-center gap-1 uppercase">
                  <Star className="w-3.5 h-3.5 text-amber-600" />
                  Featured Technician
                </div>
                <div className="text-[10px] text-amber-800/80">Highlight at top of directory</div>
              </div>
              <button
                type="button"
                onClick={() => setFeatured(!featured)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                  featured ? 'bg-amber-500' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out ${
                    featured ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Verification & License */}
          <div className="bg-white p-6 border border-[#1a1716]/10 shadow-2xs space-y-4">
            <h2 className="font-mono text-xs uppercase tracking-wider font-bold text-[#1a1716] border-b border-[#1a1716]/10 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2e4a3d]" />
              Verification & Licensing
            </h2>

            <div>
              <label className="block text-xs font-mono uppercase font-semibold text-[#1a1716] mb-1">
                Verification Status
              </label>
              <select
                value={verificationStatus}
                onChange={(e) => setVerificationStatus(e.target.value as VerificationStatus)}
                className="w-full text-xs font-mono font-semibold px-3 py-2 bg-white border border-[#1a1716]/20 rounded-sm focus:outline-none focus:border-[#2e4a3d]"
              >
                <option value="verified">✅ Verified (Badge Active)</option>
                <option value="pending">⏳ Pending Verification</option>
                <option value="under_review">🔍 Under Review</option>
                <option value="rejected">❌ Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase font-semibold text-[#1a1716] mb-1">
                License Number
              </label>
              <input
                type="text"
                placeholder="e.g. WB-LIC-001"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2 bg-white border border-[#1a1716]/20 rounded-sm focus:outline-none focus:border-[#2e4a3d]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase font-semibold text-[#1a1716] mb-1">
                Issuing Authority
              </label>
              <input
                type="text"
                placeholder="e.g. West Bengal Electrical Licensing Board"
                value={issuingAuthority}
                onChange={(e) => setIssuingAuthority(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-[#1a1716]/20 rounded-sm focus:outline-none focus:border-[#2e4a3d]"
              />
            </div>
          </div>

          {/* Social Proof & Ratings */}
          <div className="bg-white p-6 border border-[#1a1716]/10 shadow-2xs space-y-4">
            <h2 className="font-mono text-xs uppercase tracking-wider font-bold text-[#1a1716] border-b border-[#1a1716]/10 pb-3">
              Performance & Ratings
            </h2>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#1a1716]/70 mb-1">
                  Rating (1-5)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className="w-full text-xs font-mono font-bold px-2 py-1.5 bg-white border border-[#1a1716]/20 rounded-sm text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-[#1a1716]/70 mb-1">
                  Reviews
                </label>
                <input
                  type="number"
                  min="0"
                  value={reviewsCount}
                  onChange={(e) => setReviewsCount(e.target.value)}
                  className="w-full text-xs font-mono px-2 py-1.5 bg-white border border-[#1a1716]/20 rounded-sm text-center"
                />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase text-[#1a1716]/70 mb-1">
                  Jobs Done
                </label>
                <input
                  type="number"
                  min="0"
                  value={completedJobs}
                  onChange={(e) => setCompletedJobs(e.target.value)}
                  className="w-full text-xs font-mono px-2 py-1.5 bg-white border border-[#1a1716]/20 rounded-sm text-center"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
