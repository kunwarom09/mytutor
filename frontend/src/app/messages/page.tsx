'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { 
  MessageSquare, 
  Send, 
  ShieldAlert, 
  Check, 
  CheckCheck, 
  ShieldCheck, 
  Clock, 
  Search, 
  AlertCircle, 
  X, 
  Sparkles, 
  User, 
  ArrowLeft 
} from 'lucide-react';

interface Conversation {
  id: number;
  parent_id: number;
  teacher_id: number;
  request_id?: number | null;
  request_subjects?: string | null;
  request_grade?: string | null;
  other_user_id: number;
  other_user_name: string;
  other_user_role: string;
  other_user_avatar?: string | null;
  other_teacher_verification?: string | null;
  last_message_body?: string | null;
  last_message_time?: string | null;
  unread_count: number;
}

interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_name: string;
  sender_role: string;
  body: string;
  is_read: number;
  created_at: string;
  is_mine: boolean;
}

function MessagesComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Report Modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Spam / Unsolicited advertising');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);
  const [reportError, setReportError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch Conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get<{ conversations: Conversation[] }>('/conversations');
      if (res.data?.conversations) {
        setConversations(res.data.conversations);
        return res.data.conversations;
      }
    } catch (err: any) {
      if (err.status === 401) {
        router.push('/login');
      }
    } finally {
      setIsLoadingConvs(false);
    }
    return [];
  }, [router]);

  // 2. Fetch Messages for Active Conversation
  const fetchMessages = useCallback(async (convId: number) => {
    try {
      const res = await api.get<{ messages: Message[] }>(`/conversations/${convId}/messages`);
      if (res.data?.messages) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }, []);

  // Initialize and handle URL query parameters
  useEffect(() => {
    async function init() {
      const convList = await fetchConversations();

      const teacherIdParam = searchParams.get('teacher_id');
      const parentIdParam = searchParams.get('parent_id');
      const convIdParam = searchParams.get('conversation_id');

      if (convIdParam) {
        const found = convList.find((c) => c.id === Number(convIdParam));
        if (found) {
          setActiveConversation(found);
          return;
        }
      }

      if (teacherIdParam || parentIdParam) {
        try {
          const res = await api.post<{ conversation_id: number }>('/conversations', {
            teacher_id: teacherIdParam ? Number(teacherIdParam) : undefined,
            parent_id: parentIdParam ? Number(parentIdParam) : undefined,
          });

          if (res.data?.conversation_id) {
            const updated = await fetchConversations();
            const found = updated.find((c) => c.id === res.data!.conversation_id);
            if (found) {
              setActiveConversation(found);
            }
          }
        } catch (err: any) {
          alert(err.message || 'Could not initiate conversation.');
        }
      } else if (convList.length > 0 && !activeConversation) {
        setActiveConversation(convList[0]);
      }
    }

    init();
  }, [searchParams, fetchConversations]);

  // Load messages whenever activeConversation changes
  useEffect(() => {
    if (!activeConversation) return;

    setIsLoadingMsgs(true);
    fetchMessages(activeConversation.id).then(() => {
      setIsLoadingMsgs(false);
      setTimeout(scrollToBottom, 100);
    });

    // Short Polling every 3.5 seconds
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(() => {
      fetchMessages(activeConversation.id);
    }, 3500);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeConversation, fetchMessages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeConversation || !inputText.trim() || isSending) return;

    const messageText = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      const res = await api.post<{ message: Message }>(
        `/conversations/${activeConversation.id}/messages`,
        { body: messageText }
      );

      if (res.data?.message) {
        setMessages((prev) => [...prev, res.data!.message]);
        setTimeout(scrollToBottom, 100);
        fetchConversations();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to send message.');
      setInputText(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConversation) return;

    setReportError(null);
    try {
      await api.post(`/conversations/${activeConversation.id}/report`, {
        reason: reportReason,
        details: reportDetails,
      });

      setReportSuccess('Thank you. The conversation has been reported to administration.');
      setTimeout(() => {
        setIsReportModalOpen(false);
        setReportSuccess(null);
        setReportDetails('');
      }, 2000);
    } catch (err: any) {
      setReportError(err.message || 'Failed to submit report.');
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.other_user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.request_subjects && c.request_subjects.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const quickMessages = [
    'Namaste! Are you available for a demo class this weekend?',
    'What is your preferred teaching schedule?',
    'Which topics from the syllabus are we starting with?',
    'Looking forward to our scheduled session.',
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#f7f9fc] p-3 sm:p-6 lg:p-8 flex flex-col justify-center relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-[#dbe8ff]/30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-64 h-64 rounded-full bg-[#fff1a8]/30 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full bg-white rounded-2xl border border-[#e8ecf2] shadow-[0_4px_20px_rgba(20,40,90,0.07)] overflow-hidden flex flex-col h-[82vh] relative z-10">
        
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Column: Conversations List */}
          <div className="w-full md:w-80 lg:w-96 border-r border-[#e8ecf2] flex flex-col bg-[#f7f9fc]/50">
            
            {/* Header & Search */}
            <div className="p-4 border-b border-[#e8ecf2] bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="eyebrow-label block mb-0.5">DIRECT CHAT</span>
                  <h1 className="text-xl font-extrabold text-[#111318] tracking-tight flex items-center gap-2 font-heading">
                    <MessageSquare className="w-5 h-5 text-[#0a5cff]" />
                    Messages
                  </h1>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#dbe8ff] text-[#0a5cff]">
                  {conversations.length} Chats
                </span>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5b6270]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-9 pr-3 py-2 rounded-full border border-[#e8ecf2] text-xs bg-[#f7f9fc] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] transition-all"
                />
              </div>
            </div>

            {/* Conversation Items */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#e8ecf2]">
              {isLoadingConvs ? (
                <div className="p-6 text-center text-xs text-[#5b6270]">Loading chats...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#5b6270] space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-[#dbe8ff] text-[#0a5cff] flex items-center justify-center mx-auto">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <p>No conversations found.</p>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = activeConversation?.id === conv.id;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConversation(conv)}
                      className={`w-full text-left p-4 transition-colors flex items-start gap-3 relative ${
                        isSelected
                          ? 'bg-[#dbe8ff]/40 border-r-4 border-[#0a5cff]'
                          : 'hover:bg-white'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-2xl bg-[#0a5cff] text-white font-bold flex items-center justify-center text-base shrink-0 shadow-sm font-heading">
                        {conv.other_user_name.charAt(0)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h2 className="text-sm font-bold text-[#111318] truncate font-heading">
                            {conv.other_user_name}
                          </h2>
                          {conv.last_message_time && (
                            <span className="text-[10px] text-[#5b6270] shrink-0 font-medium">
                              {new Date(conv.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 mt-0.5">
                          {conv.other_user_role === 'teacher' ? (
                            <span className="text-[10px] font-bold text-[#1e6b22] bg-[#d9f5c9] px-2 py-0.5 rounded-full flex items-center gap-0.5">
                              <ShieldCheck className="w-3 h-3 text-[#1e6b22]" /> Tutor
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-[#0a5cff] bg-[#dbe8ff] px-2 py-0.5 rounded-full">
                              Parent
                            </span>
                          )}

                          {conv.request_subjects && (
                            <span className="text-[10px] text-[#5b6270] truncate font-medium">
                              • {conv.request_subjects}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#5b6270] truncate mt-1">
                          {conv.last_message_body || 'No messages yet.'}
                        </p>
                      </div>

                      {conv.unread_count > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#0a5cff] text-white text-[10px] font-extrabold flex items-center justify-center shrink-0">
                          {conv.unread_count}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

          </div>

          {/* Right Column: Chat View */}
          <div className="hidden md:flex flex-1 flex-col bg-white">
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="px-6 py-4 border-b border-[#e8ecf2] flex items-center justify-between bg-white z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#0a5cff] text-white font-bold flex items-center justify-center text-sm shadow-sm font-heading">
                      {activeConversation.other_user_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-extrabold text-[#111318] font-heading">
                          {activeConversation.other_user_name}
                        </h2>
                        {activeConversation.other_user_role === 'teacher' && (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#d9f5c9] text-[#1e6b22] border border-[#b2e896] flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#1e6b22]" /> Verified Tutor
                          </span>
                        )}
                      </div>
                      {activeConversation.request_subjects && (
                        <p className="text-xs text-[#5b6270] font-medium">
                          Regarding: {activeConversation.request_subjects} ({activeConversation.request_grade})
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="p-2.5 rounded-full text-[#5b6270] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Report Conversation"
                  >
                    <ShieldAlert className="w-5 h-5" />
                  </button>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f7f9fc]">
                  {isLoadingMsgs ? (
                    <div className="py-12 text-center text-xs text-[#5b6270]">Loading messages...</div>
                  ) : messages.length === 0 ? (
                    <div className="py-16 text-center space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-[#dbe8ff] text-[#0a5cff] mx-auto flex items-center justify-center">
                        <Sparkles className="w-7 h-7" />
                      </div>
                      <h4 className="text-sm font-bold text-[#111318] font-heading">Start the conversation!</h4>
                      <p className="text-xs text-[#5b6270] max-w-sm mx-auto">
                        Say hello and discuss student requirements, syllabus, schedule, and hourly rates.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${msg.is_mine ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-2.5 text-sm leading-relaxed ${
                            msg.is_mine
                              ? 'bg-[#0a5cff] text-white rounded-2xl rounded-br-none shadow-sm'
                              : 'bg-white text-[#111318] border border-[#e8ecf2] rounded-2xl rounded-bl-none shadow-sm'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.body}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-[#5b6270]">
                          <span>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {msg.is_mine && (
                            <span>
                              {msg.is_read ? (
                                <CheckCheck className="w-3.5 h-3.5 text-[#0a5cff]" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-[#5b6270]" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Prompts */}
                <div className="px-6 py-2.5 bg-white border-t border-[#e8ecf2] flex items-center gap-2 overflow-x-auto text-[11px]">
                  <span className="text-[#5b6270] font-bold uppercase tracking-wider shrink-0 text-[10px]">
                    Quick:
                  </span>
                  {quickMessages.map((prompt, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setInputText(prompt)}
                      className="px-3 py-1 rounded-full bg-[#f7f9fc] hover:bg-[#dbe8ff] hover:text-[#0a5cff] text-[#5b6270] border border-[#e8ecf2] shrink-0 transition-colors font-medium"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>

                {/* Input Bar */}
                <div className="p-4 border-t border-[#e8ecf2] bg-white">
                  <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                    <div className="flex-1 relative">
                      <textarea
                        rows={2}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message (Press Enter to send)..."
                        maxLength={1000}
                        className="w-full px-4 py-2.5 rounded-2xl border border-[#e8ecf2] text-sm focus:outline-none focus:ring-2 focus:ring-[#0a5cff]/20 focus:border-[#0a5cff] text-[#111318] resize-none transition-all"
                      />
                      <span className="absolute right-3 bottom-2 text-[10px] text-[#5b6270]">
                        {inputText.length}/1000
                      </span>
                    </div>

                    <button
                      type="submit"
                      disabled={!inputText.trim() || isSending}
                      className="p-3.5 rounded-full bg-[#0a5cff] hover:bg-[#084ecf] text-white shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#5b6270] space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-[#dbe8ff] text-[#0a5cff] flex items-center justify-center">
                  <MessageSquare className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-[#111318] font-heading">No chat selected</h3>
                <p className="text-xs text-[#5b6270]">
                  Select a conversation from the left to start messaging.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Report Modal */}
      {isReportModalOpen && activeConversation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#111318]/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#e8ecf2] space-y-5 relative">
            <button
              onClick={() => setIsReportModalOpen(false)}
              className="absolute right-5 top-5 p-2 text-[#5b6270] hover:text-[#111318] rounded-full hover:bg-[#f7f9fc]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#111318] font-heading">
                Report Conversation
              </h3>
              <p className="text-xs text-[#5b6270] mt-1 font-sans">
                Report inappropriate messages or policy violations with {activeConversation.other_user_name}. Our admin team will investigate.
              </p>
            </div>

            {reportSuccess && (
              <div className="p-3.5 rounded-xl bg-[#d9f5c9] text-[#1e6b22] text-xs font-semibold">
                {reportSuccess}
              </div>
            )}

            {reportError && (
              <div className="p-3.5 rounded-xl bg-rose-50 text-rose-800 text-xs font-semibold">
                {reportError}
              </div>
            )}

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111318] uppercase tracking-wider mb-1.5">
                  Reason for Report *
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#e8ecf2] text-xs bg-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 text-[#111318]"
                >
                  <option value="Spam / Unsolicited advertising">Spam / Unsolicited advertising</option>
                  <option value="Inappropriate or rude behavior">Inappropriate or rude behavior</option>
                  <option value="Asking for off-platform payment">Asking for off-platform payment</option>
                  <option value="Harassment or safety concern">Harassment or safety concern</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#111318] uppercase tracking-wider mb-1.5">
                  Additional Details
                </label>
                <textarea
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Describe the issue..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#e8ecf2] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-600 text-[#111318]"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="flex-1 py-2.5 rounded-full border border-[#e8ecf2] text-[#5b6270] text-xs font-bold hover:bg-[#f7f9fc] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading Messages...</div>}>
      <MessagesComponent />
    </Suspense>
  );
}
