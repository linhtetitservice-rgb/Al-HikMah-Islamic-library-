import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileText,
  Headphones,
  Music,
  Play,
  Pause,
  CheckCircle2,
  Volume2,
  Clock,
  Sparkles,
  Link as LinkIcon,
  ShieldAlert,
  ShieldCheck,
  Lock,
  LogIn,
} from 'lucide-react';
import { BookItem, UserProfile } from '../types';
import { INITIAL_CATEGORIES } from '../data/initialBooks';
import { isUserAdmin, ADMIN_EMAIL } from '../utils/auth';

interface UploadBookModalProps {
  currentUser: UserProfile | null;
  onClose: () => void;
  onAddBook: (newBook: BookItem) => void;
  onRequireAuth?: (prompt?: string) => void;
}

export const UploadBookModal: React.FC<UploadBookModalProps> = ({
  currentUser,
  onClose,
  onAddBook,
  onRequireAuth,
}) => {
  const isAdmin = isUserAdmin(currentUser);

  // If user is admin, allow choosing audio, otherwise default to book
  const [mediaType, setMediaType] = useState<'book' | 'audio'>('book');
  const [titleMm, setTitleMm] = useState('');
  const [authorMm, setAuthorMm] = useState('');
  const [reciterMm, setReciterMm] = useState('');
  const [category, setCategory] = useState('fiqh');
  const [descriptionMm, setDescriptionMm] = useState('');
  const [totalPages, setTotalPages] = useState('24');
  const [isMemberOnly, setIsMemberOnly] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [audioUrlInput, setAudioUrlInput] = useState<string>('');
  const [audioDuration, setAudioDuration] = useState<string>('');
  const [audioFileSize, setAudioFileSize] = useState<string>('');
  const [coverColor, setCoverColor] = useState('from-emerald-800 to-teal-950');
  const [textContent, setTextContent] = useState('');
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [audioSourceMode, setAudioSourceMode] = useState<'file' | 'url'>('file');

  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const formatSecondsToMinutes = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleMediaTypeChange = (type: 'book' | 'audio') => {
    setMediaType(type);
    setSelectedFile(null);
    setFileUrl('');
    setIsPlayingPreview(false);
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    if (type === 'audio') {
      setCategory('audio');
      setCoverColor('from-violet-900 to-indigo-950');
    } else {
      setCategory('fiqh');
      setCoverColor('from-emerald-800 to-teal-950');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      // Auto-populate title if empty
      if (!titleMm) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_.-]+/g, ' ');
        setTitleMm(cleanName);
      }

      const sizeInMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      setAudioFileSize(sizeInMb);

      // Create Object URL for playback / viewing
      const url = URL.createObjectURL(file);
      setFileUrl(url);

      if (mediaType === 'audio') {
        // Load audio metadata to get exact duration
        const audio = new Audio(url);
        audio.onloadedmetadata = () => {
          if (audio.duration && !isNaN(audio.duration)) {
            setAudioDuration(formatSecondsToMinutes(audio.duration));
          }
        };
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
    }
  };

  const togglePreviewAudio = () => {
    const effectiveUrl = fileUrl || audioUrlInput;
    if (!effectiveUrl) return;

    if (!previewAudioRef.current) {
      previewAudioRef.current = new Audio(effectiveUrl);
      previewAudioRef.current.onended = () => setIsPlayingPreview(false);
    } else if (previewAudioRef.current.src !== effectiveUrl) {
      previewAudioRef.current.src = effectiveUrl;
    }

    if (isPlayingPreview) {
      previewAudioRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      previewAudioRef.current
        .play()
        .then(() => {
          setIsPlayingPreview(true);
        })
        .catch((err) => console.warn('Preview playback failed:', err));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Security check: Only Admin can add audio items
    if (mediaType === 'audio') {
      if (!isAdmin) {
        alert(
          'ခွင့်ပြုချက် မရှိပါ! အသံဖိုင်နှင့် တရားတော်များကို စီမံခန့်ခွဲသူ (Admin) သာလျှင် တင်ခွင့်ရှိပါသည်။'
        );
        return;
      }
    }

    if (!titleMm.trim()) return;

    // Stop preview audio if playing
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }

    const selectedCategoryObj = INITIAL_CATEGORIES.find((c) => c.id === category);
    const effectiveAudioUrl = fileUrl || audioUrlInput.trim() || undefined;

    const newBook: BookItem = {
      id: `${mediaType === 'audio' ? 'custom-audio' : 'custom-book'}-${Date.now()}`,
      titleMm: titleMm.trim(),
      authorMm:
        mediaType === 'audio'
          ? reciterMm.trim() || authorMm.trim() || 'အသံဖိုင် ဓမ္မကထိက ဆရာတော်'
          : authorMm.trim() || 'စာရေးသူ / ဆရာတော်',
      category: category,
      categoryMm: selectedCategoryObj
        ? selectedCategoryObj.nameMm
        : mediaType === 'audio'
        ? 'အသံဖိုင်နှင့် တရားတော်များ'
        : 'အထွေထွေ အစ္စလာမ့်စာပေ',
      descriptionMm:
        descriptionMm.trim() ||
        (mediaType === 'audio'
          ? 'ဤအသံဖိုင်သည် စီမံခန့်ခွဲသူ (Admin) မှ စာကြည့်တိုက်သို့ တင်သွင်းထားသော တရားတော်/ကုရ်အာန် အသံတော်ဖိုင် ဖြစ်ပါသည်။'
          : 'ဤစာအုပ်သည် အသုံးပြုသူ ကိုယ်တိုင် တင်သွင်းထားသော စာအုပ်/PDF ဖြစ်ပါသည်။'),
      coverColor: coverColor,
      totalPages: mediaType === 'audio' ? 1 : parseInt(totalPages, 10) || 20,
      isMemberOnly: isMemberOnly,
      language: 'my',
      isUserUploaded: true,
      publishedYear: new Date().getFullYear().toString(),
      readCount: 1,
      rating: 5.0,
      mediaType: mediaType,
      pdfUrl: mediaType === 'book' ? fileUrl : undefined,
      audioUrl: mediaType === 'audio' ? effectiveAudioUrl : undefined,
      audioDuration: mediaType === 'audio' ? audioDuration || '05:00' : undefined,
      reciterOrSpeakerMm:
        mediaType === 'audio'
          ? reciterMm.trim() || authorMm.trim() || 'ဓမ္မကထိက ဆရာတော်'
          : undefined,
      audioFileSize: audioFileSize || undefined,
      chapters: [
        {
          id: `ch-custom-${Date.now()}`,
          titleMm:
            mediaType === 'audio'
              ? 'အသံဖိုင် ရှင်းလင်းချက်နှင့် နားဆင်ရန်'
              : 'အခန်း (၁) - အစပြုခြင်း',
          pageNumber: 1,
          content:
            textContent ||
            `${titleMm.trim()}\n\nဟောကြား/ရွတ်ဖတ်သူ: ${
              reciterMm || authorMm || 'ဆရာတော်'
            }\n\n${
              descriptionMm ||
              (mediaType === 'audio'
                ? 'အသံဖိုင်ကို အပေါ်ရှိ Audio Player ဖြင့် တိုက်ရိုက် နားဆင်နိုင်ပါသည်။'
                : 'ဤစာအုပ်တွင် တင်သွင်းထားသော PDF ဖိုင်ကို အွန်လိုင်းတွင် တိုက်ရိုက် ဖတ်ရှုလေ့လာနိုင်ပါသည်။')
            }`,
        },
      ],
    };

    onAddBook(newBook);
    onClose();
  };

  const coverOptions = [
    { label: 'မြစိမ်းရောင် (Emerald)', value: 'from-emerald-800 to-teal-950' },
    { label: 'ခရမ်းပြာရောင် (Violet / Audio)', value: 'from-violet-900 to-indigo-950' },
    { label: 'ရွှေညိုရောင် (Amber Bronze)', value: 'from-amber-800 to-amber-950' },
    { label: 'သမုဒ္ဒရာပြာ (Deep Lapis)', value: 'from-blue-900 to-indigo-950' },
    { label: 'ကြက်သွေးနီရောင် (Ruby Red)', value: 'from-rose-900 to-stone-900' },
    { label: 'မီးသွေးရောင် (Charcoal Black)', value: 'from-stone-800 to-stone-950' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl text-white ${mediaType === 'audio' ? 'bg-violet-900' : 'bg-emerald-900'}`}>
              {mediaType === 'audio' ? <Headphones className="w-5 h-5 text-amber-300" /> : <Upload className="w-5 h-5 text-amber-300" />}
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900 font-myanmar">
                {mediaType === 'audio' ? 'တရားတော် / ကုရ်အာန် အသံဖိုင် တင်သွင်းရန်' : 'စာအုပ် / PDF အသစ် တင်သွင်းရန်'}
              </h3>
              <p className="text-[11px] text-stone-500 font-myanmar">
                {mediaType === 'audio'
                  ? 'အသံဖိုင် တင်သွင်းခြင်းကို စီမံခန့်ခွဲသူ (Admin) သာ ဆောင်ရွက်ခွင့် ရှိပါသည်'
                  : 'PDF စာအုပ်များ သို့မဟုတ် စာတမ်းများကို စာကြည့်တိုက်သို့ ထည့်သွင်းပါ'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (previewAudioRef.current) previewAudioRef.current.pause();
              onClose();
            }}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Type Toggle: Book / PDF vs Audio */}
        <div className="px-6 pt-4 pb-1">
          <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-xl border border-stone-200 text-xs font-myanmar">
            <button
              type="button"
              onClick={() => handleMediaTypeChange('book')}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all font-semibold ${
                mediaType === 'book'
                  ? 'bg-white text-emerald-950 shadow-sm border border-stone-200/80'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-800" />
              <span>စာအုပ် / PDF တင်ရန်</span>
            </button>

            <button
              type="button"
              onClick={() => handleMediaTypeChange('audio')}
              className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all font-semibold relative ${
                mediaType === 'audio'
                  ? 'bg-white text-violet-950 shadow-sm border border-stone-200/80'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Headphones className="w-4 h-4 text-violet-700" />
              <span>အသံဖိုင် တင်ရန် (Audio)</span>
              {!isAdmin && (
                <Lock className="w-3 h-3 text-amber-600 ml-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* AUDIO ADMIN ACCESS CONTROL STATUS */}
        {mediaType === 'audio' && (
          <div className="px-6 pt-2">
            {isAdmin ? (
              <div className="p-3 bg-gradient-to-r from-violet-950 via-indigo-950 to-stone-900 text-white rounded-xl flex items-center justify-between text-xs border border-violet-700/60 shadow-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-amber-400/20 text-amber-300 rounded-lg shrink-0">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <div className="font-bold text-amber-300 flex items-center gap-1.5 font-myanmar">
                      <span>Admin အတည်ပြုပြီး</span>
                      <span className="text-[10px] bg-amber-400 text-stone-950 px-1.5 py-0.2 rounded font-mono font-bold">
                        AUTHORIZED
                      </span>
                    </div>
                    <p className="text-[11px] text-violet-200 font-myanmar mt-0.5">
                      Admin အကောင့် ({currentUser?.email}) အနေဖြင့် မိမိထည့်လိုသော အသံဖိုင်များကို လွတ်လပ်စွာ တင်သွင်းနိုင်ပါသည်။
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-900 text-xs font-myanmar">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>အသံဖိုင် တင်သွင်းခွင့် ကန့်သတ်ချက် (Admin သာလျှင် တင်ခွင့်ရှိသည်)</span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed font-myanmar">
                  အစ္စလာမ့်တရားတော်များနှင့် ကုရ်အာန်အသံဖိုင်များသည် တိကျမှန်ကန်မှု အရေးကြီးသဖြင့် စာကြည့်တိုက်သို့ အသံဖိုင် တင်သွင်းခြင်းကို စီမံခန့်ခွဲသူ Admin (<code className="font-mono text-rose-900 bg-rose-100 px-1 py-0.5 rounded font-semibold">{ADMIN_EMAIL}</code>) သာလျှင် တင်ခွင့်ရှိစေရန် ကန့်သတ်ထားပါသည်။
                </p>
                {currentUser ? (
                  <p className="text-[11px] text-stone-600 font-myanmar">
                    လက်ရှိအကောင့် (<span className="font-mono text-stone-800">{currentUser.email}</span>) သည် သာမန်အသင်းဝင်အကောင့် ဖြစ်သောကြောင့် စာအုပ်နှင့် PDF များကိုသာ တင်သွင်းနိုင်ပါသည်။
                  </p>
                ) : (
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onRequireAuth) {
                          onRequireAuth('အသံဖိုင် တင်သွင်းရန် Admin အကောင့်ဖြင့် ဝင်ရောက်ပါ');
                        }
                      }}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors font-myanmar"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Admin အကောင့်ဖြင့် ဝင်ရောက်မည်</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMediaTypeChange('book')}
                      className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg text-xs font-myanmar font-medium"
                    >
                      စာအုပ် / PDF သို့ ပြန်သွားမည်
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-myanmar">
          {/* If Audio is selected and user is NOT Admin, disable input interactions */}
          {mediaType === 'audio' && !isAdmin ? (
            <div className="p-8 text-center space-y-3 bg-stone-50 rounded-2xl border border-stone-200">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="font-serif font-bold text-sm text-stone-900">
                အသံဖိုင် တင်သွင်းခွင့် ပိတ်ထားပါသည်
              </h4>
              <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                အသံဖိုင်နှင့် တရားတော်များကို Admin မှလွဲ၍ အခြားသူများ တင်သွင်းခွင့် မရှိပါ။ စာအုပ် သို့မဟုတ် PDF ဖိုင်များကိုမူ စိတ်ကြိုက် တင်သွင်းနိုင်ပါသည်။
              </p>
              <button
                type="button"
                onClick={() => handleMediaTypeChange('book')}
                className="px-4 py-2 bg-emerald-900 hover:bg-emerald-800 text-white font-semibold rounded-xl text-xs"
              >
                စာအုပ် / PDF တင်ရန် သို့ ပြောင်းပါ
              </button>
            </div>
          ) : (
            <>
              {/* Audio Source Mode: File vs URL (When mediaType === 'audio') */}
              {mediaType === 'audio' && (
                <div className="flex items-center gap-2 p-1 bg-violet-50/60 rounded-xl border border-violet-200/80">
                  <button
                    type="button"
                    onClick={() => setAudioSourceMode('file')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      audioSourceMode === 'file'
                        ? 'bg-violet-900 text-white shadow-2xs'
                        : 'text-violet-950 hover:bg-violet-100'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>စက်ထဲမှ အသံဖိုင်တင်ရန် (MP3 / Audio)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudioSourceMode('url')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      audioSourceMode === 'url'
                        ? 'bg-violet-900 text-white shadow-2xs'
                        : 'text-violet-950 hover:bg-violet-100'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>တိုက်ရိုက် Audio URL / Stream</span>
                  </button>
                </div>
              )}

              {/* File Upload Box (If not URL mode) */}
              {(mediaType === 'book' || (mediaType === 'audio' && audioSourceMode === 'file')) && (
                <div>
                  <label className="block text-stone-800 font-semibold mb-1">
                    {mediaType === 'audio'
                      ? 'အသံဖိုင် ရွေးချယ်ရန် (.mp3, .m4a, .wav, .aac, .ogg)'
                      : 'PDF သို့မဟုတ် စာအုပ်ဖိုင် ရွေးချယ်ရန် (.pdf, .txt, .doc)'}
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                      mediaType === 'audio'
                        ? 'border-violet-300 hover:border-violet-700 bg-violet-50/30'
                        : 'border-emerald-300 hover:border-emerald-700 bg-emerald-50/20'
                    }`}
                  >
                    <input
                      type="file"
                      accept={
                        mediaType === 'audio'
                          ? 'audio/*,.mp3,.m4a,.wav,.aac,.ogg,.opus'
                          : '.pdf,.txt,.doc,.docx'
                      }
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload-input"
                    />
                    <label htmlFor="file-upload-input" className="cursor-pointer space-y-2 block">
                      {mediaType === 'audio' ? (
                        <Music className="w-8 h-8 text-violet-600 mx-auto" />
                      ) : (
                        <FileText className="w-8 h-8 text-emerald-700 mx-auto" />
                      )}
                      <div>
                        <span className="font-semibold text-stone-800 underline">
                          {selectedFile ? selectedFile.name : 'ဖိုင်ကို နှိပ်၍ ရွေးချယ်ပါ'}
                        </span>
                        <p className="text-[11px] text-stone-500 mt-1">
                          {mediaType === 'audio'
                            ? 'MP3, M4A, WAV ဖိုင်များကို တိုက်ရိုက် ထည့်သွင်းနိုင်ပါသည်'
                            : 'PDF သို့မဟုတ် Text စာအုပ်ဖိုင်များ (အများဆုံး 15MB)'}
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Direct Audio URL input (If audio URL mode) */}
              {mediaType === 'audio' && audioSourceMode === 'url' && (
                <div>
                  <label className="block text-stone-800 font-semibold mb-1">
                    အွန်လိုင်း အသံဖိုင် / Stream URL လိပ်စာ *
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="https://example.com/lecture.mp3 သို့မဟုတ် Quran Radio Stream"
                      value={audioUrlInput}
                      onChange={(e) => setAudioUrlInput(e.target.value)}
                      className="w-full p-2.5 pl-8 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-violet-600"
                    />
                    <LinkIcon className="w-4 h-4 text-stone-400 absolute left-2.5 top-3" />
                  </div>
                </div>
              )}

              {/* Audio In-Modal Preview & Duration */}
              {mediaType === 'audio' && (fileUrl || audioUrlInput) && (
                <div className="p-3 bg-violet-950 text-white rounded-xl space-y-2 border border-violet-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-amber-300" />
                      <span className="font-semibold text-xs text-amber-200">
                        အသံဖိုင် စမ်းသပ်နားဆင်ခြင်း
                      </span>
                    </div>
                    {audioDuration && (
                      <span className="text-[11px] font-mono text-stone-300 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-300" />
                        ကြာမြင့်ချိန်: {audioDuration}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={togglePreviewAudio}
                      className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      {isPlayingPreview ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>ရပ်တန့်မည်</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>ဖွင့်စမ်းမည်</span>
                        </>
                      )}
                    </button>
                    <span className="text-[11px] text-stone-300">
                      {isPlayingPreview ? 'အသံဖိုင် ဖွင့်နေပါသည်...' : 'တင်သွင်းခြင်းမပြုမီ စမ်းသပ်နားဆင်နိုင်ပါသည်'}
                    </span>
                  </div>
                </div>
              )}

              {/* Title Input */}
              <div>
                <label className="block text-stone-800 font-semibold mb-1">
                  {mediaType === 'audio' ? 'တရားတော် / ကုရ်အာန် ခေါင်းစဉ် *' : 'စာအုပ် ခေါင်းစဉ် (မြန်မာ/ပါဠိ/အာရဗီ) *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    mediaType === 'audio'
                      ? 'ဥပမာ: ဂျုမုအဟ် သောကြာတရားဒေသနာတော် (သို့) စူရဟ် ယာစီးန်'
                      : 'ဥပမာ: အစ္စလာမ့် ဖိကာဟ်တရားတော် စာအုပ်'
                  }
                  value={titleMm}
                  onChange={(e) => setTitleMm(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              {/* Author / Speaker Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-800 font-semibold mb-1">
                    {mediaType === 'audio' ? 'ဟောကြားသူ / ရွတ်ဖတ်သူ ဆရာတော် *' : 'ရေးသားပြုစုသူ / ဘာသာပြန်သူ *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      mediaType === 'audio' ? 'ဥပမာ: ကာရီ မစ်ရှာရီ / ဆရာတော်...' : 'ဥပမာ: မောင်လာနာ...'
                    }
                    value={mediaType === 'audio' ? reciterMm : authorMm}
                    onChange={(e) => {
                      if (mediaType === 'audio') {
                        setReciterMm(e.target.value);
                      } else {
                        setAuthorMm(e.target.value);
                      }
                    }}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block text-stone-800 font-semibold mb-1">ကဏ္ဍ / ဘာသာရပ်</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  >
                    {mediaType === 'audio' ? (
                      <>
                        <option value="audio">အသံဖိုင်နှင့် တရားတော်များ (Audio / Bayan)</option>
                        <option value="quran">ကျမ်းမြတ်ကုရ်အာန် ရွတ်ဖတ်သံ (Quran Recitation)</option>
                        <option value="hadith">ဟဒီးစ်တော်ဆိုင်ရာ တရားဒေသနာ</option>
                        <option value="fiqh">ဖိကာဟ်တရားတော် ရှင်းလင်းချက်</option>
                      </>
                    ) : (
                      INITIAL_CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nameMm}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-stone-800 font-semibold mb-1">
                  {mediaType === 'audio' ? 'တရားဒေသနာ အနှစ်ချုပ် / မိတ်ဆက်' : 'စာအုပ် မိတ်ဆက် အကျဉ်းချုပ်'}
                </label>
                <textarea
                  rows={2}
                  placeholder="တရားတော် သို့မဟုတ် စာအုပ်အကြောင်း အကျဉ်းချုပ်..."
                  value={descriptionMm}
                  onChange={(e) => setDescriptionMm(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              {/* Cover Gradient Selector */}
              <div>
                <label className="block text-stone-800 font-semibold mb-1.5">
                  မျက်နှာဖုံး အရောင်စုံ
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {coverOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setCoverColor(opt.value)}
                      className={`p-2 rounded-xl border flex items-center gap-2 text-left transition-all ${
                        coverColor === opt.value
                          ? 'border-emerald-600 bg-emerald-50 ring-1 ring-emerald-600'
                          : 'border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-gradient-to-br ${opt.value} shrink-0 shadow-2xs`} />
                      <span className="truncate text-[11px]">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Member Only Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="member-only-toggle"
                  checked={isMemberOnly}
                  onChange={(e) => setIsMemberOnly(e.target.checked)}
                  className="rounded text-emerald-800 focus:ring-emerald-700 cursor-pointer"
                />
                <label htmlFor="member-only-toggle" className="text-stone-700 cursor-pointer select-none">
                  အသင်းဝင်များသာ ဝင်ရောက်ကြည့်ရှု/နားဆင်ခွင့် ပြုမည်
                </label>
              </div>
            </>
          )}

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                if (previewAudioRef.current) previewAudioRef.current.pause();
                onClose();
              }}
              className="px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 rounded-xl font-medium transition-colors"
            >
              ပယ်ဖျက်မည်
            </button>

            <button
              type="submit"
              disabled={mediaType === 'audio' && !isAdmin}
              className={`px-5 py-2 text-white rounded-xl font-semibold transition-all flex items-center gap-2 shadow-xs ${
                mediaType === 'audio' && !isAdmin
                  ? 'bg-stone-400 cursor-not-allowed opacity-60'
                  : mediaType === 'audio'
                  ? 'bg-gradient-to-r from-violet-900 to-indigo-900 hover:from-violet-800 hover:to-indigo-800 text-white'
                  : 'bg-emerald-900 hover:bg-emerald-800 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>
                {mediaType === 'audio'
                  ? isAdmin
                    ? 'အသံဖိုင် စာကြည့်တိုက်သို့ တင်မည်'
                    : 'Admin သာ တင်ခွင့်ရှိသည်'
                  : 'စာအုပ် တင်သွင်းမည်'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
