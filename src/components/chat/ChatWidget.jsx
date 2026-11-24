import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Bot, LoaderCircle, MessageCircle, Send, Trash2, X } from 'lucide-react';
import { chatApi } from '../../services/chatApi';
import { useAccountData } from '../../features/accounts/hooks/useAccountData';

function Conversation({ role }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const input = useRef(null);
  const launcher = useRef(null);
  const end = useRef(null);
  const request = useRef(null);
  const busy = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; request.current?.abort(); };
  }, []);

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const controller = new AbortController();
    chatApi.status(controller.signal).then((result) => {
      if (!controller.signal.aborted) setStatus(result);
    }).catch(() => {
      // Sending a question can still recover if the initial status request fails.
    });
    function onKey(event) {
      if (event.key === 'Escape') {
        setOpen(false);
        launcher.current?.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      controller.abort();
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) end.current?.scrollIntoView({ block: 'nearest' });
  }, [messages, pending, open]);

  async function send(value) {
    const question = value.trim();
    if (!question || question.length > 2000 || busy.current) return;
    busy.current = true;
    setPending(true);
    setError('');
    setDraft('');
    const history = messages.filter((message) => message.mode !== 'data').slice(-8)
      .map(({ role: messageRole, content }) => ({ role: messageRole, content: content.slice(0, 4000) }));
    setMessages((previous) => [...previous, { role: 'user', content: question }].slice(-39));
    const controller = new AbortController();
    request.current = controller;
    const timer = setTimeout(() => controller.abort(), 35000);
    try {
      const result = await chatApi.send(question, history, controller.signal);
      if (!controller.signal.aborted) {
        setMessages((previous) => [...previous, { role: 'assistant', content: result.answer,
          sources: result.sources, mode: result.mode, notice: result.notice }].slice(-40));
      }
    } catch (failure) {
      if (!mounted.current) return;
      setError(controller.signal.aborted ? 'Yêu cầu đã hết thời gian chờ. Bạn có thể gửi lại.' : failure.message);
      setDraft(question);
      // Remove the failed turn so retrying does not duplicate it in history.
      setMessages((previous) => previous.slice(0, -1));
    } finally {
      clearTimeout(timer);
      busy.current = false;
      if (mounted.current) setPending(false);
    }
  }

  function close() {
    setOpen(false);
    launcher.current?.focus();
  }

  return (
    <div className="fixed bottom-5 right-4 z-40 sm:right-6">
      {open && (
        <section id="system-assistant" role="dialog" aria-labelledby="assistant-title"
          className="mb-3 flex h-[min(640px,calc(100dvh-110px))] w-[calc(100vw-32px)] max-w-[410px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <header className="flex items-center gap-3 bg-[#173557] px-4 py-4 text-white">
            <div className="rounded-xl bg-white/15 p-2"><Bot size={22} aria-hidden="true" /></div>
            <div className="min-w-0 flex-1">
              <h2 id="assistant-title" className="text-sm font-semibold">Trợ lý công việc</h2>
              <p className="mt-0.5 text-xs text-blue-100">Hỗ trợ {role.label} · {status ? status.aiEnabled ? 'AI đã bật' : 'Hướng dẫn có sẵn' : 'Hướng dẫn sử dụng'}</p>
            </div>
            <button type="button" disabled={pending || messages.length === 0} title="Xóa hội thoại" aria-label="Xóa hội thoại"
              onClick={() => { setMessages([]); setError(''); setDraft(''); input.current?.focus(); }}
              className="rounded-lg p-2 hover:bg-white/10 disabled:opacity-30"><Trash2 size={17} /></button>
            <button type="button" onClick={close} aria-label="Đóng trợ lý" className="rounded-lg p-2 hover:bg-white/10"><X size={19} /></button>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4" role="log" aria-label="Hội thoại với trợ lý" aria-live="polite" aria-relevant="additions">
            <div className="rounded-xl rounded-tl-sm border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700">
              {role.key === 'ADMIN'
                ? 'Chào bạn! Mình có thể giải thích nghiệp vụ và tra cứu dữ liệu quản trị theo quyền ADMIN.'
                : `Chào bạn! Mình chỉ hướng dẫn các chức năng dành cho ${role.label}. Mình không tra cứu dữ liệu thực tế, thống kê hoặc hướng dẫn chức năng của vai trò khác.`}
              <p className="mt-2 text-xs text-slate-500">Mình chỉ đọc dữ liệu, không thay đổi hay phê duyệt thay bạn. Không gửi mật khẩu hoặc khóa API vào chat.</p>
            </div>

            {messages.length === 0 && status?.suggestions?.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-slate-500">Bạn có thể hỏi</p>
                {status.suggestions.map(({ question }) => (
                  <button type="button" key={question} onClick={() => send(question)} disabled={pending}
                    className="block w-full rounded-xl border border-blue-100 bg-white px-3 py-2.5 text-left text-xs leading-5 text-[#173557] transition hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50">
                    {question}
                  </button>
                ))}
              </div>
            )}

            {messages.map((message, index) => (
              <article key={index} className={message.role === 'user' ? 'ml-7' : 'mr-3'}>
                <p className="mb-1 text-[11px] font-medium text-slate-500">{message.role === 'user' ? 'Bạn' : `Trợ lý · ${message.mode === 'data' ? 'Dữ liệu hệ thống' : message.mode === 'ai' ? 'AI' : 'Hướng dẫn'}`}</p>
                <div className={`whitespace-pre-wrap break-words rounded-xl px-3 py-2.5 text-sm leading-6 ${message.role === 'user' ? 'rounded-tr-sm bg-[#173557] text-white' : 'rounded-tl-sm border border-slate-200 bg-white text-slate-700'}`}>
                  {message.content}
                </div>
                {message.notice && <p className="mt-1.5 text-[11px] leading-5 text-amber-800">{message.notice}</p>}
                {message.sources?.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    <p className="text-[11px] text-slate-500">{message.mode === 'data' ? 'Kiểm tra dữ liệu · mở màn hình' : 'Hướng dẫn tham khảo · mở màn hình'}</p>
                    {message.sources.filter((source) => source.path.startsWith(`/${role.key.toLowerCase()}/`) && !source.path.includes('..')).map((source) => (
                      <Link key={source.id} to={source.path} onClick={close}
                        className="flex items-center justify-between gap-2 rounded-lg border border-blue-100 bg-white px-2.5 py-2 text-xs text-blue-800 hover:bg-blue-50">
                        {source.title}<ArrowUpRight size={14} aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                )}
              </article>
            ))}
            {pending && <p className="flex items-center gap-2 text-xs text-slate-500" role="status"><LoaderCircle size={15} className="animate-spin" />Đang tra cứu hệ thống…</p>}
            <div ref={end} />
          </div>

          <form className="border-t border-slate-200 bg-white p-3" onSubmit={(event) => { event.preventDefault(); send(draft); }}>
            {error && <p role="alert" className="mb-2 text-xs leading-5 text-red-700">{error}</p>}
            <label htmlFor="assistant-question" className="sr-only">Câu hỏi cho trợ lý</label>
            <div className="flex items-end gap-2 rounded-xl border border-slate-300 bg-white p-2 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
              <textarea id="assistant-question" ref={input} value={draft} maxLength={2000} rows={2}
                onChange={(event) => setDraft(event.target.value)} placeholder="Hỏi cách làm hoặc tra cứu dữ liệu…"
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault(); send(draft);
                  }
                }}
                className="max-h-28 min-w-0 flex-1 resize-none bg-transparent p-1 text-sm text-slate-800 outline-none" />
              <button type="submit" disabled={pending || !draft.trim()} aria-label="Gửi câu hỏi"
                className="rounded-lg bg-[#173557] p-2.5 text-white hover:bg-blue-900 disabled:opacity-40">
                {pending ? <LoaderCircle size={17} className="animate-spin" /> : <Send size={17} />}
              </button>
            </div>
            <p className="mt-1.5 text-right text-[10px] text-slate-400">{draft.length}/2000 · Shift + Enter để xuống dòng</p>
          </form>
        </section>
      )}
      <button ref={launcher} type="button" onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open} aria-controls="system-assistant" aria-label={open ? 'Thu gọn trợ lý công việc' : 'Mở trợ lý công việc'}
        className="ml-auto flex items-center gap-2 rounded-full bg-[#173557] px-4 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
        {open ? <X size={21} /> : <MessageCircle size={21} />}<span>Trợ lý công việc</span>
      </button>
    </div>
  );
}

export default function ChatWidget({ role }) {
  const { authUser } = useAccountData();
  if (!authUser) return null;
  // A different account/role always gets a new in-memory conversation.
  return <Conversation key={`${authUser.username}:${role.key}`} role={role} />;
}
