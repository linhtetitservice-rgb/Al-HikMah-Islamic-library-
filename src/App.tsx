import React, { useState, useEffect, useCallback } from 'react';
import { HeaderPrayerBar } from './components/HeaderPrayerBar';
import { Navigation } from './components/Navigation';
import { LibraryView } from './components/LibraryView';
import { BookReaderModal } from './components/BookReaderModal';
import { FatwaView } from './components/FatwaView';
import { ZakatCalculator } from './components/ZakatCalculator';
import { MemberModal } from './components/MemberModal';
import { UploadBookModal } from './components/UploadBookModal';
import { PrayerTimesModal } from './components/PrayerTimesModal';
import { Footer } from './components/Footer';
import { DailyWisdom } from './components/DailyWisdom';
import { INITIAL_BOOKS } from './data/initialBooks';
import { INITIAL_FATWAS } from './data/initialFatwas';
import { MYANMAR_CITIES } from './utils/islamicTimes';
import { BookItem, CityLocation, FatwaItem, UserProfile } from './types';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<'library' | 'fatwa' | 'zakat' | 'prayer'>('library');

  // Selected City (Default Yangon)
  const [selectedCity, setSelectedCity] = useState<CityLocation>(() => {
    const saved = localStorage.getItem('alhikmah_city');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return MYANMAR_CITIES[0];
      }
    }
    return MYANMAR_CITIES[0];
  });

  // Books State with LocalStorage
  const [books, setBooks] = useState<BookItem[]>(() => {
    const saved = localStorage.getItem('alhikmah_books');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_BOOKS;
      }
    }
    return INITIAL_BOOKS;
  });

  // Fatwas State with LocalStorage
  const [fatwas, setFatwas] = useState<FatwaItem[]>(() => {
    const saved = localStorage.getItem('alhikmah_fatwas');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_FATWAS;
      }
    }
    return INITIAL_FATWAS;
  });

  // Current User with LocalStorage
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('alhikmah_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Modals
  const [readingBook, setReadingBook] = useState<BookItem | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authPromptMessage, setAuthPromptMessage] = useState<string | undefined>(undefined);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showPrayerModal, setShowPrayerModal] = useState<boolean>(false);
  const [showDailyWisdomModal, setShowDailyWisdomModal] = useState<boolean>(false);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('alhikmah_city', JSON.stringify(selectedCity));
  }, [selectedCity]);

  useEffect(() => {
    localStorage.setItem('alhikmah_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('alhikmah_fatwas', JSON.stringify(fatwas));
  }, [fatwas]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('alhikmah_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('alhikmah_user');
    }
  }, [currentUser]);

  // Auth requirement handler for member-only books
  const handleRequireAuth = (actionDescription: string) => {
    setAuthPromptMessage(actionDescription);
    setShowAuthModal(true);
  };

  // Add Book / PDF
  const handleAddBook = (newBook: BookItem) => {
    setBooks((prev) => [newBook, ...prev]);
    // Automatically open the reader for the newly added book
    setReadingBook(newBook);
  };

  // Submit Fatwa Question
  const handleSubmitFatwaQuestion = (q: {
    title: string;
    category: string;
    questionText: string;
    name: string;
  }) => {
    const newFatwa: FatwaItem = {
      id: `fatwa-${Date.now()}`,
      fatwaNumber: `FTW-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      titleMm: q.title,
      category: q.category,
      categoryMm:
        q.category === 'ibadah'
          ? 'အိဗာဒသ် (နမားဇ်နှင့် သန့်ရှင်းရေး)'
          : q.category === 'roza'
          ? 'ရမ်ဇာန်နှင့် ဥပုသ်သီလ'
          : q.category === 'zakat'
          ? 'ဇကာသ်နှင့် စီးပွားရေး/အတိုး'
          : q.category === 'nikah'
          ? 'နိကာဟ်နှင့် မိသားစုရေးရာ'
          : 'ဆေးဝါးနှင့် ခေတ်ပေါ်ပြဿနာများ',
      questioner: q.name,
      questionMm: q.questionText,
      answerMm:
        'အဆ္စလာမုအလိုင်းကုမ်။ အသင်၏ မေးမြန်းချက်ကို ဒါရုလ် အိဖ်သာဟ် ဓမ္မသတ်ကော်မတီက စိစစ်ဆဲ ဖြစ်ပါသည်။ တရားတော်နှင့်အညီ ဆုံးဖြတ်ချက်ကို မကြာမီ ထုတ်ပြန်ပေးပါမည်။ (လောလောဆယ်တွင် စိစစ်ဆဲအဆင့်၌ ရှိပါသည်)',
      referencesMm: ['ဒါရုလ် အိဖ်သာဟ် မှတ်တမ်းအမှတ် ' + Date.now()],
      muftiOrBoard: 'ဒါရုလ် အိဖ်သာဟ် စိစစ်ရေးဘုတ်အဖွဲ့',
      dateMm: 'ယနေ့',
      views: 1,
    };

    setFatwas((prev) => [newFatwa, ...prev]);
  };

  // Update Bookmark in User Profile
  const handleUpdateBookmark = useCallback((bookId: string, page: number, chapterTitle: string) => {
    setCurrentUser((prevUser) => {
      if (!prevUser) {
        handleRequireAuth('စာမျက်နှာကို မှတ်သားရန် မန်ဘာအကောင့်ဖြင့် ဝင်ရောက်ပေးပါ');
        return null;
      }

      const currentBook = books.find((b) => b.id === bookId);
      const bookTitle = currentBook ? currentBook.titleMm : 'စာအုပ်';

      const existingIndex = prevUser.bookmarks.findIndex(
        (b) => b.bookId === bookId && b.page === page
      );

      let updatedBookmarks = [...prevUser.bookmarks];
      if (existingIndex >= 0) {
        // Remove bookmark
        updatedBookmarks.splice(existingIndex, 1);
      } else {
        // Add bookmark
        updatedBookmarks.unshift({
          bookId,
          bookTitle,
          page,
          chapterTitle,
          date: 'ယခုလေးတင်',
        });
      }

      return {
        ...prevUser,
        bookmarks: updatedBookmarks,
      };
    });
  }, [books]);

  // Add Personal Note
  const handleAddNote = useCallback((bookId: string, page: number, noteText: string) => {
    setCurrentUser((prevUser) => {
      if (!prevUser) {
        handleRequireAuth('မှတ်စုရေးသား သိမ်းဆည်းရန် မန်ဘာအကောင့်ဖြင့် ဝင်ရောက်ပေးပါ');
        return null;
      }

      const currentBook = books.find((b) => b.id === bookId);
      const bookTitle = currentBook ? currentBook.titleMm : 'စာအုပ်';

      const newNote = {
        id: `note-${Date.now()}`,
        bookId,
        bookTitle,
        page,
        text: noteText,
        createdAt: new Date().toLocaleDateString('en-GB'),
      };

      return {
        ...prevUser,
        personalNotes: [newNote, ...prevUser.personalNotes],
      };
    });
  }, [books]);

  // Update Reading History
  const handleUpdateHistory = useCallback((bookId: string, page: number) => {
    setCurrentUser((prevUser) => {
      if (!prevUser) return null;

      // Guard: If reading history already shows this page as lastPage, return existing reference
      const existing = prevUser.readingHistory.find((h) => h.bookId === bookId);
      if (existing && existing.lastPage === page) {
        return prevUser;
      }

      const currentBook = books.find((b) => b.id === bookId);
      const bookTitle = currentBook ? currentBook.titleMm : (existing?.bookTitle || 'စာအုပ်');
      const totalPages = currentBook ? currentBook.totalPages : (existing?.totalPages || 1);

      const filtered = prevUser.readingHistory.filter((h) => h.bookId !== bookId);
      const updatedHistory = [
        {
          bookId,
          bookTitle,
          lastPage: page,
          totalPages,
          lastReadDate: 'ယနေ့',
        },
        ...filtered,
      ];

      return {
        ...prevUser,
        readingHistory: updatedHistory,
      };
    });
  }, [books]);

  // Open book directly to bookmarked page
  const handleOpenBookFromBookmark = (bookId: string, page: number) => {
    const targetBook = books.find((b) => b.id === bookId);
    if (targetBook) {
      setReadingBook(targetBook);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 selection:bg-emerald-100 selection:text-emerald-950 font-sans">
      {/* 1. Header Prayer Times & Astronomical Zawal Bar (နမားဇ် ၅ ကြိမ်၊ နေထွက်၊ နေဝင်၊ မွန်းတည့်ဇဝါလ် နှင့် အစ္စလာမ့်ပြက္ခဒိန်) */}
      <HeaderPrayerBar
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        onOpenPrayerModal={() => setShowPrayerModal(true)}
      />

      {/* 2. Top Bar Navigation (Brand, Nav links, Action controls) */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuthModal={() => {
          setAuthPromptMessage(undefined);
          setShowAuthModal(true);
        }}
        onOpenUploadModal={() => setShowUploadModal(true)}
        onOpenDailyWisdom={() => setShowDailyWisdomModal(true)}
      />

      {/* 3. Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'library' && (
          <LibraryView
            books={books}
            currentUser={currentUser}
            onOpenBook={(book) => setReadingBook(book)}
            onOpenUploadModal={() => setShowUploadModal(true)}
            onRequireAuth={handleRequireAuth}
          />
        )}

        {activeTab === 'fatwa' && (
          <FatwaView
            fatwas={fatwas}
            currentUser={currentUser}
            onSubmitQuestion={handleSubmitFatwaQuestion}
          />
        )}

        {activeTab === 'zakat' && <ZakatCalculator />}

        {activeTab === 'prayer' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-5">
                <div>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 font-myanmar">
                    နမားဇ်ငါးကြိမ် အချိန်ဇယားနှင့် နက္ခတ္တဆိုင်ရာ အချိန်များ
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 font-myanmar leading-relaxed mt-1">
                    အင်တာနက် Network (University of Islamic Sciences, Karachi 18°/18° စံနှုန်း) မှ တိုက်ရိုက်ရယူထားသော မြန်မာစံတော်ချိန် တရားဝင် အချိန်ဇယား ဖြစ်ပါသည်။
                  </p>
                </div>
                <button
                  onClick={() => setShowPrayerModal(true)}
                  className="px-4 py-2.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold font-myanmar transition-colors flex items-center gap-2 shadow-xs"
                >
                  <span>တစ်လစာ အချိန်ဇယား အပြည့်အစုံ ကြည့်ရှုရန်</span>
                  <span>→</span>
                </button>
              </div>

              {/* City & Method Guidance */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-myanmar text-xs">
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                  <span className="text-emerald-900 font-bold block text-sm">လက်ရှိ ရွေးချယ်ထားသော မြို့</span>
                  <p className="text-emerald-800 text-xs">
                    {selectedCity.nameMm} မြို့ ({selectedCity.nameEn}) · လောင်ဂျီတွဒ် {selectedCity.lng}° · လတ္တီတွဒ် {selectedCity.lat}°
                  </p>
                </div>

                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
                  <span className="text-amber-900 font-bold block text-sm">တွက်ချက်မှု စံနှုန်း (Method)</span>
                  <p className="text-amber-800 text-xs">
                    University of Islamic Sciences, Karachi (Fajr 18° / Isha 18°) · မြန်မာပြည် ဒါရုလ်အိဖ်သာဟ် စံနှုန်း
                  </p>
                </div>

                <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
                  <span className="text-stone-900 font-bold block text-sm">အချိန်ဇယား ရယူခြင်း</span>
                  <p className="text-stone-700 text-xs">
                    Network Server မှ အလိုအလျောက် တိုက်ရိုက်ချိန်ညှိပေးထားပြီး ရက်စွဲနှင့် စံတော်ချိန် တိကျမှန်ကန်ပါသည်။
                  </p>
                </div>
              </div>

              {/* Quick Prompt to view timetable */}
              <div className="p-5 bg-gradient-to-r from-emerald-950 to-[#0e271d] text-white rounded-xl flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1 font-myanmar">
                  <span className="text-amber-300 font-bold text-sm block">
                    နေ့စဉ် နမားဇ်အချိန်ဇယားများကို စာမျက်နှာအထက်ပိုင်းရှိ Header Bar တွင် တိုက်ရိုက် ကြည့်ရှုနိုင်ပါသည်
                  </span>
                  <p className="text-emerald-200 text-xs">
                    စုဗဟ် (ဖဂျရ်)၊ နေထွက်၊ မွန်းတည့် (ဇဝါလ်)၊ ဇုဟ်ရ်၊ အဆွရ်၊ နေဝင် (ဝါဖြေ)၊ မဂ်ရိဗ်၊ အီရှာ နှင့် မက္ကရူဟ် အချိန်များ
                  </p>
                </div>
                <button
                  onClick={() => setShowPrayerModal(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-xs rounded-lg transition-colors font-myanmar shadow-xs"
                >
                  ပြက္ခဒိန် အပြည့်အစုံ ဖွင့်ရန်
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. Footer */}
      <Footer
        onSelectTab={setActiveTab}
        onOpenUploadModal={() => setShowUploadModal(true)}
      />

      {/* MODAL 1: Book/PDF Reader Modal */}
      {readingBook && (
        <BookReaderModal
          book={readingBook}
          currentUser={currentUser}
          onClose={() => setReadingBook(null)}
          onUpdateBookmark={handleUpdateBookmark}
          onAddNote={handleAddNote}
          onUpdateHistory={handleUpdateHistory}
        />
      )}

      {/* MODAL 2: Member Authentication & Profile Modal */}
      {showAuthModal && (
        <MemberModal
          currentUser={currentUser}
          onLogin={(user) => {
            setCurrentUser(user);
            setShowAuthModal(false);
            setShowDailyWisdomModal(true);
          }}
          onLogout={() => setCurrentUser(null)}
          onClose={() => {
            setShowAuthModal(false);
            setAuthPromptMessage(undefined);
          }}
          onOpenBookFromBookmark={handleOpenBookFromBookmark}
          books={books}
          promptMessage={authPromptMessage}
        />
      )}

      {/* MODAL 3: Book & PDF Upload Modal */}
      {showUploadModal && (
        <UploadBookModal
          onClose={() => setShowUploadModal(false)}
          onAddBook={handleAddBook}
        />
      )}

      {/* MODAL 4: Full Prayer Times & Astronomical Schedule Modal */}
      {showPrayerModal && (
        <PrayerTimesModal
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
          onClose={() => setShowPrayerModal(false)}
        />
      )}

      {/* MODAL 5: Daily Wisdom Spiritual Quote Modal */}
      {showDailyWisdomModal && (
        <DailyWisdom
          currentUser={currentUser}
          onClose={() => setShowDailyWisdomModal(false)}
          isModal={true}
        />
      )}
    </div>
  );
}
