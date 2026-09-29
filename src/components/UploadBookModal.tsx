import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { BookItem } from '../types';
import { INITIAL_CATEGORIES } from '../data/initialBooks';

interface UploadBookModalProps {
  onClose: () => void;
  onAddBook: (newBook: BookItem) => void;
}

export const UploadBookModal: React.FC<UploadBookModalProps> = ({
  onClose,
  onAddBook,
}) => {
  const [titleMm, setTitleMm] = useState('');
  const [authorMm, setAuthorMm] = useState('');
  const [category, setCategory] = useState('fiqh');
  const [descriptionMm, setDescriptionMm] = useState('');
  const [totalPages, setTotalPages] = useState('24');
  const [isMemberOnly, setIsMemberOnly] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [coverColor, setCoverColor] = useState('from-emerald-800 to-teal-950');
  const [textContent, setTextContent] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Auto-populate title if empty
      if (!titleMm) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        setTitleMm(cleanName);
      }

      // If text file, read text
      if (file.type.includes('text') || file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setTextContent(event.target.result as string);
          }
        };
        reader.readAsText(file);
      }

      // Create Object URL for PDF
      const url = URL.createObjectURL(file);
      setFileUrl(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleMm.trim()) return;

    const selectedCategoryObj = INITIAL_CATEGORIES.find((c) => c.id === category);

    const newBook: BookItem = {
      id: `custom-book-${Date.now()}`,
      titleMm: titleMm.trim(),
      authorMm: authorMm.trim() || 'စာရေးသူ / ဆရာတော်',
      category: category,
      categoryMm: selectedCategoryObj ? selectedCategoryObj.nameMm : 'အထွေထွေ အစ္စလာမ့်စာပေ',
      descriptionMm: descriptionMm.trim() || 'ဤစာအုပ်သည် အသုံးပြုသူ ကိုယ်တိုင် တင်သွင်းထားသော စာအုပ်/PDF ဖြစ်ပါသည်။',
      coverColor: coverColor,
      totalPages: parseInt(totalPages, 10) || 20,
      isMemberOnly: isMemberOnly,
      language: 'my',
      isUserUploaded: true,
      publishedYear: new Date().getFullYear().toString(),
      readCount: 1,
      rating: 5.0,
      pdfUrl: fileUrl,
      chapters: [
        {
          id: 'ch-custom-1',
          titleMm: 'အခန်း (၁) - အစပြုခြင်း',
          pageNumber: 1,
          content:
            textContent ||
            `${titleMm}\n\nတင်သွင်းသူ: ${authorMm || 'အသင်းဝင်'}\n\nဤစာအုပ်တွင် တင်သွင်းထားသော PDF ဖိုင်ကို အွန်လိုင်းတွင် တိုက်ရိုက် ဖတ်ရှုလေ့လာနိုင်ပါသည်။`,
        },
      ],
    };

    onAddBook(newBook);
    onClose();
  };

  const coverOptions = [
    { label: 'မြစိမ်းရောင် (Emerald)', value: 'from-emerald-800 to-teal-950' },
    { label: 'ရွှေညိုရောင် (Amber Bronze)', value: 'from-amber-800 to-amber-950' },
    { label: 'သမုဒ္ဒရာပြာ (Deep Lapis)', value: 'from-blue-900 to-indigo-950' },
    { label: 'ကြက်သွေးနီရောင် (Ruby Red)', value: 'from-rose-900 to-stone-900' },
    { label: 'မီးသွေးရောင် (Charcoal Black)', value: 'from-stone-800 to-stone-950' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-800" />
            <h3 className="font-serif font-bold text-base text-stone-900 font-myanmar">
              စာအုပ် / PDF အသစ် တင်သွင်းရန်
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-myanmar">
          {/* File Upload Box */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              PDF သို့မဟုတ် စာအုပ်ဖိုင် ရွေးချယ်ရန် (.pdf, .txt)
            </label>
            <div className="border-2 border-dashed border-stone-300 hover:border-emerald-700 rounded-xl p-4 text-center cursor-pointer transition-colors bg-stone-50/50">
              <input
                type="file"
                accept=".pdf,.txt,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload-input"
              />
              <label htmlFor="file-upload-input" className="cursor-pointer space-y-1 block">
                <FileText className="w-8 h-8 text-stone-400 mx-auto" />
                {selectedFile ? (
                  <div className="text-emerald-800 font-semibold truncate max-w-xs mx-auto">
                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                ) : (
                  <>
                    <p className="font-semibold text-stone-800">
                      ဖိုင်ရွေးချယ်ရန် ဤနေရာကို နှိပ်ပါ
                    </p>
                    <p className="text-[11px] text-stone-500">PDF သို့မဟုတ် Text စာအုပ်များ</p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Book Title */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              စာအုပ် အမည် *
            </label>
            <input
              type="text"
              required
              value={titleMm}
              onChange={(e) => setTitleMm(e.target.value)}
              placeholder="ဥပမာ: အခြေခံ သာသနာ့ဗဟုသုတ လက်စွဲ"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              ကျမ်းပြုဆရာ / စာရေးသူ
            </label>
            <input
              type="text"
              value={authorMm}
              onChange={(e) => setAuthorMm(e.target.value)}
              placeholder="ဥပမာ: မော်လာနာ ဦးတင်အေး"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
            />
          </div>

          {/* Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                ကဏ္ဍ (Category)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              >
                {INITIAL_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameMm}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                စာမျက်နှာ ခန့်မှန်းခြေ
              </label>
              <input
                type="number"
                min="1"
                value={totalPages}
                onChange={(e) => setTotalPages(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 font-mono focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>
          </div>

          {/* Cover Color Theme */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              စာအုပ် အဖုံးဒီဇိုင်း အရောင်
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {coverOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setCoverColor(opt.value)}
                  className={`p-2 rounded-lg border text-left flex items-center gap-2 transition-all ${
                    coverColor === opt.value
                      ? 'border-emerald-700 ring-2 ring-emerald-700/30 font-semibold'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full bg-gradient-to-br ${opt.value} shrink-0`}></span>
                  <span className="text-[11px] truncate">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-stone-700 font-semibold mb-1">
              စာအုပ် အကျဉ်းချုပ် ဖော်ပြချက်
            </label>
            <textarea
              rows={3}
              value={descriptionMm}
              onChange={(e) => setDescriptionMm(e.target.value)}
              placeholder="စာအုပ်ပါ အကြောင်းအရာ အနှစ်ချုပ်ကို ဖော်ပြပေးပါ..."
              className="w-full px-3 py-2 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-700 resize-none"
            />
          </div>

          {/* Member Only Checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="member-only-toggle"
              checked={isMemberOnly}
              onChange={(e) => setIsMemberOnly(e.target.checked)}
              className="rounded border-stone-300 text-emerald-800 focus:ring-emerald-700 w-4 h-4"
            />
            <label htmlFor="member-only-toggle" className="text-stone-700 cursor-pointer">
              မန်ဘာဝင်ထားသူများသာ သီးသန့် ဖတ်ရှုခွင့်ပြုမည် (Member Only)
            </label>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
            >
              ပယ်ဖျက်မည်
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-900 hover:bg-emerald-800 text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>စာအုပ်စင်သို့ တင်မည်</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
