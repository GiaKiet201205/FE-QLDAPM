import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, GraduationCap, LoaderCircle, MessageCircle, Send, Trash2, X } from 'lucide-react';
import { useAccountData } from '../../features/accounts/hooks/useAccountData';
import { storeChatApi } from '../../services/storeChatApi';

const DEFAULT_QUESTIONS = [
  'Tôi mới bắt đầu, đăng ký học thế nào?',
  'Tôi xem lịch khai giảng và chọn lớp ở đâu?',
  'Giỏ hàng dùng như thế nào?',
  'Tôi thanh toán khóa học như thế nào?',
];
const SOURCE_PATHS = new Set(['/courses', '/schedule', '/cart', '/user/login', '/user/register', '/user/profile', '/user/forgot-password', '/contact', '/about']);

function visibleViewport() {
  const viewport = window.visualViewport;
  return { left: viewport?.offsetLeft || 0, top: viewport?.offsetTop || 0,
    width: viewport?.width || window.innerWidth, height: viewport?.height || window.innerHeight };
}

function Conversation() {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState(DEFAULT_QUESTIONS);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [viewport, setViewport] = useState(visibleViewport);
  const launcherRef = useRef(null);
  const inputRef = useRef(null);
  const conversationRef = useRef(null);
  const request = useRef(null);
  const busy = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    const update = () => setViewport(visibleViewport());
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener('resize', update);
    window.visualViewport?.addEventListener('scroll', update);
    return () => {
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener('scroll', update);
    };
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; request.current?.abort(); };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    const controller = new AbortController();
    storeChatApi.status(controller.signal).then((status) => {
      if (!controller.signal.aborted && status.suggestions?.length) setSuggestions(status.suggestions.map((item) => item.question));
    }).catch(() => { /* The default questions remain usable if status loading fails. */ });
    return () => controller.abort();
  }, [isOpen]);

  useEffect(() => {
    const conversation = conversationRef.current;
    if (conversation) conversation.scrollTop = conversation.scrollHeight;
  }, [isOpen, messages.length, pending]);

  function closeChat() {
    setIsOpen(false);
    requestAnimationFrame(() => launcherRef.current?.focus());
  }

  async function send(value) {
    const content = value.trim();
    if (!content || content.length > 2000 || busy.current) return;
    busy.current = true;
    setPending(true);
    setError('');
    setDraft('');
    const history = messages.slice(-8).map(({ role, content: text }) => ({ role, content: text.slice(0, 4000) }));
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'user', content }].slice(-39));
    const controller = new AbortController();
    request.current = controller;
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const result = await storeChatApi.send(content, history, controller.signal);
      if (mounted.current && !controller.signal.aborted) setMessages((current) => [...current, {
        id: crypto.randomUUID(), role: 'assistant', content: result.answer, sources: result.sources,
      }].slice(-40));
    } catch (failure) {
      if (!mounted.current) return;
      setError(controller.signal.aborted ? 'Yêu cầu đã hết thời gian chờ. Bạn có thể gửi lại.' : failure.message);
      setDraft(content);
      setMessages((current) => current.slice(0, -1));
    } finally {
      clearTimeout(timer);
      busy.current = false;
      if (mounted.current) { setPending(false); inputRef.current?.focus(); }
    }
  }

  function submit(event) {
    event.preventDefault();
    void send(draft);
  }

  return (
    <div className="pointer-events-none fixed z-40" style={viewport}>
      <div className="pointer-events-auto absolute bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 max-w-[390px] sm:right-6" style={{ width: isOpen ? 'calc(100% - 2rem)' : undefined }}>
      {isOpen ? (
        <section id="user-support-chat" role="dialog" aria-modal="false" aria-labelledby="user-support-title"
          onKeyDown={(event) => { if (event.key === 'Escape') { event.stopPropagation(); closeChat(); } }}
          style={{ height: Math.min(600, Math.max(0, viewport.height - 32)) }}
          className="flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_48px_rgba(23,53,87,0.2)]">
          <header className="flex shrink-0 items-center gap-3 bg-[#07857f] px-4 py-4 text-white">
            <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#173557]"><GraduationCap size={23} /></span>
            <div className="min-w-0 flex-1">
              <h2 id="user-support-title" className="text-sm font-semibold">Trợ lý đăng ký học</h2>
              <p className="mt-1 text-[11px] text-teal-50">Hướng dẫn từng bước · Không cần đăng nhập</p>
            </div>
            <button type="button" disabled={pending || messages.length === 0} onClick={() => { setMessages([]); setError(''); setDraft(''); inputRef.current?.focus(); }} aria-label="Xóa hội thoại" title="Xóa hội thoại" className="rounded-lg p-1.5 hover:bg-white/10 disabled:opacity-30"><Trash2 size={17} /></button>
            <button type="button" onClick={closeChat} aria-label="Đóng hộp chat" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-teal-50 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"><X size={18} /></button>
          </header>

          <div ref={conversationRef} role="log" aria-label="Nội dung trò chuyện" aria-live="polite" aria-relevant="additions"
            className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-slate-50 px-3 py-4">
            <div className="rounded-2xl rounded-bl-sm border border-slate-100 bg-white px-3 py-3 text-xs leading-6 text-slate-700 shadow-sm">
              Chào bạn! Mình sẽ giúp bạn làm quen website và đăng ký học.
              <ol className="mt-1 list-inside list-decimal space-y-0.5"><li>Tìm khóa phù hợp.</li><li>Chọn lớp và kiểm tra lịch.</li><li>Đăng nhập, đăng ký và thanh toán.</li></ol>
              <p className="mt-2 text-[11px] leading-5 text-slate-500">Bạn có thể hỏi ngay bên dưới. Mình là trợ lý tự động, không đọc đơn cá nhân hoặc xử lý thay bạn.</p>
            </div>
            {messages.length === 0 && <div className="space-y-2">
              <p className="text-[11px] font-medium text-slate-500">Chưa biết bắt đầu từ đâu? Chọn một câu hỏi</p>
              {suggestions.map((question) => <button key={question} type="button" disabled={pending} onClick={() => void send(question)} className="block w-full rounded-xl border border-teal-100 bg-white px-3 py-2 text-left text-xs leading-5 text-[#066d69] hover:border-teal-300 hover:bg-teal-50 disabled:opacity-40">{question}</button>)}
            </div>}
            {messages.map((message) => (
              <article key={message.id} className={message.role === 'user' ? 'ml-8' : 'mr-2'}>
                <p className="mb-1 text-[10px] font-medium text-slate-500">{message.role === 'user' ? 'Bạn' : 'Trợ lý · Hướng dẫn website'}</p>
                <p className={`whitespace-pre-wrap rounded-2xl px-3 py-2.5 text-xs leading-6 [overflow-wrap:anywhere] ${message.role === 'user' ? 'rounded-br-sm bg-[#07857f] text-white' : 'rounded-bl-sm border border-slate-100 bg-white text-slate-700 shadow-sm'}`}>{message.content}</p>
                {message.sources?.filter((source) => SOURCE_PATHS.has(source.path)).map((source) => <Link key={source.id} to={source.path} onClick={closeChat} className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-teal-100 bg-white px-3 py-2 text-xs text-[#066d69] hover:bg-teal-50">{source.title}<ArrowUpRight size={14} aria-hidden="true" /></Link>)}
              </article>
            ))}
            {pending && <p role="status" className="flex items-center gap-2 text-xs text-slate-500"><LoaderCircle size={14} className="animate-spin" />Đang tìm hướng dẫn…</p>}
          </div>

          <div className="shrink-0 border-t border-slate-100 bg-white p-3">
            {error && <p role="alert" className="mb-2 text-xs leading-5 text-red-700">{error}</p>}
            <form onSubmit={submit} className="flex items-end gap-2 rounded-2xl bg-slate-100 p-1.5 pl-3">
              <label htmlFor="user-chat-message" className="sr-only">Câu hỏi hướng dẫn đăng ký học</label>
              <textarea ref={inputRef} id="user-chat-message" rows={2} maxLength={2000} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ví dụ: Tôi mới bắt đầu, đăng ký học thế nào?"
                onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) submit(event); }}
                className="max-h-24 min-h-9 min-w-0 flex-1 resize-none overflow-x-hidden overflow-y-auto rounded-lg border-0 bg-transparent py-2 text-xs leading-5 text-slate-700 outline-none placeholder:text-slate-400 focus:ring-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" />
              <button type="submit" disabled={pending || !draft.trim()} aria-label="Gửi câu hỏi" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#07857f] text-white transition-colors hover:bg-[#066d69] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-40">{pending ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />}</button>
            </form>
            <p className="mt-2 text-center text-[10px] leading-4 text-slate-500">Không gửi mật khẩu, OTP hoặc thông tin ngân hàng vào chat.</p>
          </div>
        </section>
      ) : (
        <button ref={launcherRef} type="button" onClick={() => setIsOpen(true)} aria-label="Mở trợ lý đăng ký học" aria-expanded={isOpen} aria-controls="user-support-chat" aria-haspopup="dialog"
          className="flex items-center gap-2 rounded-full border-4 border-white bg-[#07857f] px-4 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-[#066d69] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
          <MessageCircle size={23} /><span>Hỏi cách đăng ký</span>
        </button>
      )}
      </div>
    </div>
  );
}

export default function UserChatbox() {
  const { authUser } = useAccountData();
  return <Conversation key={authUser?.username || 'guest'} />;
}
