import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { HomepageSection } from '../../types';
import { FiSave, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface SectionForm {
  title_ar: string;
  title_fr: string;
  subtitle_ar: string;
  subtitle_fr: string;
  image: string;
  link: string;
  active: boolean;
}

const emptySectionForm: SectionForm = {
  title_ar: '',
  title_fr: '',
  subtitle_ar: '',
  subtitle_fr: '',
  image: '',
  link: '',
  active: false,
};

const HomepageManager: React.FC = () => {
  const [, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [heroForm, setHeroForm] = useState<SectionForm>(emptySectionForm);
  const [bannerForm, setBannerForm] = useState<SectionForm>(emptySectionForm);
  const [featuredActive, setFeaturedActive] = useState(false);
  const [newArrivalsActive, setNewArrivalsActive] = useState(false);
  const [offersActive, setOffersActive] = useState(false);

  // Store section IDs for updates
  const [sectionIds, setSectionIds] = useState<Record<string, string>>({});

  useEffect(() => {
    loadSections();
  }, []);

  const loadSections = async () => {
    try {
      const res = await api.getHomepageSections();
      const data: HomepageSection[] = res.sections || res || [];
      setSections(data);

      const ids: Record<string, string> = {};

      data.forEach((section) => {
        ids[section.section_type] = section.id;

        if (section.section_type === 'hero') {
          setHeroForm({
            title_ar: section.title_ar || '',
            title_fr: section.title_fr || '',
            subtitle_ar: section.subtitle_ar || '',
            subtitle_fr: section.subtitle_fr || '',
            image: section.image || '',
            link: section.link || '',
            active: section.active,
          });
        } else if (section.section_type === 'banner') {
          setBannerForm({
            title_ar: section.title_ar || '',
            title_fr: section.title_fr || '',
            subtitle_ar: section.subtitle_ar || '',
            subtitle_fr: section.subtitle_fr || '',
            image: section.image || '',
            link: section.link || '',
            active: section.active,
          });
        } else if (section.section_type === 'featured') {
          setFeaturedActive(section.active);
        } else if (section.section_type === 'new_arrivals') {
          setNewArrivalsActive(section.active);
        } else if (section.section_type === 'offers') {
          setOffersActive(section.active);
        }
      });

      setSectionIds(ids);
    } catch {
      toast.error('Failed to load homepage sections');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveHero = async () => {
    setSaving(true);
    try {
      await api.updateHero({
        title_ar: heroForm.title_ar,
        title_fr: heroForm.title_fr,
        subtitle_ar: heroForm.subtitle_ar,
        subtitle_fr: heroForm.subtitle_fr,
        image: heroForm.image || null,
        link: heroForm.link || null,
        active: heroForm.active,
      });
      toast.success('Hero section saved');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save hero section');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBanner = async () => {
    setSaving(true);
    try {
      await api.updateBanner({
        title_ar: bannerForm.title_ar,
        title_fr: bannerForm.title_fr,
        subtitle_ar: bannerForm.subtitle_ar,
        subtitle_fr: bannerForm.subtitle_fr,
        image: bannerForm.image || null,
        link: bannerForm.link || null,
        active: bannerForm.active,
      });
      toast.success('Banner section saved');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save banner section');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSection = async (sectionType: string, active: boolean) => {
    const id = sectionIds[sectionType];
    if (!id) {
      toast.error('Section not found');
      return;
    }

    try {
      await api.updateSection(id, { active });

      if (sectionType === 'featured') setFeaturedActive(active);
      else if (sectionType === 'new_arrivals') setNewArrivalsActive(active);
      else if (sectionType === 'offers') setOffersActive(active);

      toast.success(`${sectionType.replace('_', ' ')} section ${active ? 'enabled' : 'disabled'}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update section');
    }
  };

  const renderSectionForm = (
    label: string,
    form: SectionForm,
    setForm: React.Dispatch<React.SetStateAction<SectionForm>>,
    onSave: () => void
  ) => (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">{label}</h2>
        <button
          onClick={() => setForm((prev) => ({ ...prev, active: !prev.active }))}
          className="flex items-center gap-2 text-sm font-medium"
        >
          {form.active ? (
            <FiToggleRight size={24} style={{ color: '#FE8B7C' }} />
          ) : (
            <FiToggleLeft size={24} className="text-gray-400" />
          )}
          <span className={form.active ? 'text-green-600' : 'text-gray-500'}>
            {form.active ? 'Active' : 'Inactive'}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title (Arabic)</label>
          <input
            type="text"
            value={form.title_ar}
            onChange={(e) => setForm((prev) => ({ ...prev, title_ar: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm"
            dir="rtl"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title (French)</label>
          <input
            type="text"
            value={form.title_fr}
            onChange={(e) => setForm((prev) => ({ ...prev, title_fr: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle (Arabic)</label>
          <input
            type="text"
            value={form.subtitle_ar}
            onChange={(e) => setForm((prev) => ({ ...prev, subtitle_ar: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm"
            dir="rtl"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle (French)</label>
          <input
            type="text"
            value={form.subtitle_fr}
            onChange={(e) => setForm((prev) => ({ ...prev, subtitle_fr: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input
            type="text"
            value={form.image}
            onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm"
            placeholder="https://..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Link</label>
          <input
            type="text"
            value={form.link}
            onChange={(e) => setForm((prev) => ({ ...prev, link: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 text-sm"
            placeholder="/products or https://..."
          />
        </div>
      </div>

      {form.image && (
        <div className="mt-4">
          <p className="text-xs text-gray-500 mb-2">Preview:</p>
          <div className="w-full max-w-xs h-32 rounded-lg overflow-hidden bg-gray-100">
            <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50"
          style={{ backgroundColor: '#FE8B7C' }}
          onMouseEnter={(e) => {
            if (!saving) (e.target as HTMLElement).style.backgroundColor = '#F47768';
          }}
          onMouseLeave={(e) => {
            if (!saving) (e.target as HTMLElement).style.backgroundColor = '#FE8B7C';
          }}
        >
          <FiSave size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  const renderToggleSection = (
    label: string,
    description: string,
    active: boolean,
    sectionType: string
  ) => (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between">
      <div>
        <h3 className="text-base font-semibold text-gray-800">{label}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <button
        onClick={() => handleToggleSection(sectionType, !active)}
        className="flex-shrink-0"
      >
        {active ? (
          <FiToggleRight size={32} style={{ color: '#FE8B7C' }} />
        ) : (
          <FiToggleLeft size={32} className="text-gray-400" />
        )}
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#FE8B7C' }} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Homepage Manager</h1>

      <div className="space-y-6">
        {renderSectionForm('Hero Section', heroForm, setHeroForm, handleSaveHero)}
        {renderSectionForm('Banner Section', bannerForm, setBannerForm, handleSaveBanner)}

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">Section Toggles</h2>
          {renderToggleSection(
            'Featured Products',
            'Show featured products section on the homepage',
            featuredActive,
            'featured'
          )}
          {renderToggleSection(
            'New Arrivals',
            'Show new arrivals section on the homepage',
            newArrivalsActive,
            'new_arrivals'
          )}
          {renderToggleSection(
            'Offers Section',
            'Show sale/offers section on the homepage',
            offersActive,
            'offers'
          )}
        </div>
      </div>
    </div>
  );
};

export default HomepageManager;
