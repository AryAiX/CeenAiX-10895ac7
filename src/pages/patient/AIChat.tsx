import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Bot, CheckCircle2, Loader2, MessageSquarePlus, PanelLeftClose, PanelLeftOpen, Paperclip, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../../components/Navigation';
import { PageHeader } from '../../components/PageHeader';
import { usePatientPreVisitAssessments } from '../../hooks';
import { usePatientAiChat } from '../../hooks/use-patient-ai-chat';
import { useQuery } from '../../hooks/use-query';
import {
  type AiChatAssistantMetadata,
  invokeAiChat,
  type AiChatFileAttachment,
  type AiChatStoredAttachment,
  uploadAiChatAttachment,
} from '../../lib/ai';
import { useAuth } from '../../lib/auth-context';
import { dateTimeFormatWithNumerals, resolveLocale } from '../../lib/i18n-ui';
import {
  applyCanonicalUpdateRequests,
  dismissCanonicalUpdateRequests,
  fetchCanonicalUpdateRequests,
  formatCanonicalValueForReview,
} from '../../lib/canonical-record-updates';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  attachments: AiChatStoredAttachment[];
}

const PATIENT_AI_STARTER_ID = 'patient-ai-starter';

const formatTimestamp = (value: string, language: string) => {
  const locale = resolveLocale(language);
  return new Date(value).toLocaleString(
    locale,
    dateTimeFormatWithNumerals(language, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  );
};

const formatSessionTimestamp = (value: string, language: string) => {
  const locale = resolveLocale(language);
  return new Date(value).toLocaleDateString(
    locale,
    dateTimeFormatWithNumerals(language, {
      month: 'short',
      day: 'numeric',
    })
  );
};

const getFileAttachments = (message: ChatMessage) =>
  message.attachments.filter((attachment) => attachment.type === 'uploaded_file') as AiChatFileAttachment[];

const getAssistantMetadata = (message: ChatMessage) =>
  message.attachments.find((attachment) => attachment.type === 'response_metadata') as
    | AiChatAssistantMetadata
    | undefined;

const getHistoryBadges = (message: ChatMessage) => {
  const metadata = getAssistantMetadata(message);

  if (!metadata?.usedPatientContext || metadata.evidence.length === 0) {
    return [];
  }

  return Array.from(new Set(metadata.evidence.map((evidence) => evidence.title.trim()).filter(Boolean))).slice(0, 3);
};

const getSuggestedActions = (message: ChatMessage) => getAssistantMetadata(message)?.suggestedActions ?? [];

export const PatientAIChat: React.FC = () => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const starterMessage = useMemo<ChatMessage>(
    () => ({
      id: PATIENT_AI_STARTER_ID,
      role: 'assistant',
      content: t('patient.aiChat.starterContent'),
      createdAt: new Date(0).toISOString(),
      attachments: [],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- include i18n.language so greeting updates on locale switch
    [t, i18n.language]
  );

  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const { data, loading, error, refetch } = usePatientAiChat(user?.id, selectedSessionId);
  const { data: preVisitAssessmentsData } = usePatientPreVisitAssessments(user?.id);
  const preVisitAssessments = preVisitAssessmentsData ?? [];
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [recordUpdateFeedback, setRecordUpdateFeedback] = useState<string | null>(null);
  const [isApplyingRecordUpdates, setIsApplyingRecordUpdates] = useState(false);
  const sessions = data?.sessions ?? [];
  const { data: pendingCanonicalUpdatesData, refetch: refetchCanonicalUpdates } = useQuery(
    async () => {
      if (!user?.id) {
        return [];
      }

      return fetchCanonicalUpdateRequests({
        patientId: user.id,
        sourceKind: 'ai_chat_message',
        status: 'pending',
      });
    },
    [user?.id ?? '', selectedSessionId ?? '']
  );
  const pendingCanonicalUpdates = (pendingCanonicalUpdatesData ?? []).filter((update) => {
    if (!selectedSessionId) {
      return false;
    }

    return typeof update.metadata.sessionId === 'string' && update.metadata.sessionId === selectedSessionId;
  });

  useEffect(() => {
    if (loading || isSending) {
      return;
    }

    if (selectedSessionId === null) {
      setMessages([starterMessage]);
      return;
    }

    if (data?.sessionId !== selectedSessionId) {
      return;
    }

    setMessages(data.messages.length > 0 ? data.messages : []);
  }, [data, isSending, loading, selectedSessionId, starterMessage]);

  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  const outstandingPreVisitAssessment =
    preVisitAssessments.find(
      (assessment) => assessment.status === 'not_started' || assessment.status === 'in_progress'
    ) ?? null;
  const showStarterOptions =
    !loading &&
    !error &&
    messages.length === 1 &&
    messages[0]?.id === PATIENT_AI_STARTER_ID &&
    !isSending;

  const startNewSession = () => {
    setSelectedSessionId(null);
    setMessages([starterMessage]);
    setInput('');
    setPendingFiles([]);
    setSendError(null);
  };

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    setPendingFiles((currentFiles) => [...currentFiles, ...selectedFiles].slice(0, 4));
    event.target.value = '';
  };

  const handleRemovePendingFile = (fileName: string) => {
    setPendingFiles((currentFiles) => currentFiles.filter((file) => file.name !== fileName));
  };

  const handleSendMessage = async (options?: {
    submittedMessage?: string;
  }) => {
    const nextMessage = (options?.submittedMessage ?? input).trim();

    if (!user) {
      setSendError(t('patient.aiChat.signInError'));
      return;
    }

    if (!nextMessage || isSending) {
      return;
    }

    try {
      setSendError(null);
      setIsSending(true);

      const uploadedAttachments =
        pendingFiles.length > 0
          ? await Promise.all(pendingFiles.map((file) => uploadAiChatAttachment(user.id, file)))
          : [];

      const optimisticUserMessage: ChatMessage = {
        id: `temp-user-${Date.now()}`,
        role: 'user',
        content: nextMessage,
        createdAt: new Date().toISOString(),
        attachments: uploadedAttachments,
      };

      setMessages((currentMessages) => {
        const nextMessages =
          selectedSessionId === null
            ? currentMessages.filter((message) => message.id !== PATIENT_AI_STARTER_ID)
            : currentMessages;
        return [...nextMessages, optimisticUserMessage];
      });
      setInput('');
      setPendingFiles([]);

      const response = await invokeAiChat({
        message: nextMessage,
        sessionId: selectedSessionId,
        attachments: uploadedAttachments,
        usePatientContext: true,
        mode: 'chat',
      });

      setSelectedSessionId(response.sessionId);
      setRecordUpdateFeedback(null);
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: response.assistantMessage.id,
          role: 'assistant',
          content: response.assistantMessage.content,
          createdAt: response.assistantMessage.createdAt,
          attachments: response.assistantMessage.attachments,
        },
      ]);

      if (selectedSessionId !== null) {
        await refetch();
      }

      await refetchCanonicalUpdates();
    } catch (sendFailure) {
      setSendError(sendFailure instanceof Error ? sendFailure.message : t('patient.aiChat.sendError'));
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleSendMessage();
  };

  const handleApplyPendingUpdates = async () => {
    try {
      setIsApplyingRecordUpdates(true);
      setRecordUpdateFeedback(null);
      await applyCanonicalUpdateRequests(pendingCanonicalUpdates.map((update) => update.id));
      setRecordUpdateFeedback(t('patient.aiChat.recordUpdateOk'));
      await refetchCanonicalUpdates();
      await refetch();
    } catch (error) {
      setRecordUpdateFeedback(error instanceof Error ? error.message : t('patient.aiChat.recordUpdateFail'));
    } finally {
      setIsApplyingRecordUpdates(false);
    }
  };

  const handleDismissPendingUpdates = async () => {
    try {
      setIsApplyingRecordUpdates(true);
      setRecordUpdateFeedback(null);
      await dismissCanonicalUpdateRequests(pendingCanonicalUpdates.map((update) => update.id));
      setRecordUpdateFeedback(t('patient.aiChat.dismissed'));
      await refetchCanonicalUpdates();
    } catch (error) {
      setRecordUpdateFeedback(error instanceof Error ? error.message : t('patient.aiChat.dismissFail'));
    } finally {
      setIsApplyingRecordUpdates(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50">
      <Navigation role="patient" />
      <PageHeader
        title={t('patient.aiChat.title')}
        subtitle={t('patient.aiChat.subtitle')}
        backTo="/patient/dashboard"
        icon={<Bot className="h-6 w-6 text-white" />}
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section
          className={`grid h-[calc(100vh-11rem)] min-h-[720px] overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm transition-[grid-template-columns] duration-200 ${
            isSidebarCollapsed ? 'grid-cols-[72px_minmax(0,1fr)]' : 'grid-cols-[280px_minmax(0,1fr)]'
          }`}
        >
          <aside className="flex min-h-0 flex-col border-r border-gray-100 bg-slate-50/80">
            <div className="border-b border-gray-100 px-5 py-5">
              <div className="flex items-center justify-between gap-3">
                {isSidebarCollapsed ? null : (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{t('patient.aiChat.chats')}</h2>
                    <p className="mt-1 text-sm text-gray-500">{t('patient.aiChat.chatsSub')}</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setIsSidebarCollapsed((currentValue) => !currentValue)}
                  aria-label={isSidebarCollapsed ? t('patient.aiChat.expandHistory') : t('patient.aiChat.collapseHistory')}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50"
                >
                  {isSidebarCollapsed ? (
                    <PanelLeftOpen className="h-4 w-4" />
                  ) : (
                    <PanelLeftClose className="h-4 w-4" />
                  )}
                </button>
              </div>

              <div className={`${isSidebarCollapsed ? 'mt-3' : 'mt-4'}`}>
                <button
                  type="button"
                  onClick={startNewSession}
                  aria-label={t('patient.aiChat.startNew')}
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-xs font-semibold transition ${
                    selectedSessionId === null
                      ? 'bg-ceenai-blue text-white shadow-sm'
                      : 'border border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  } ${isSidebarCollapsed ? 'w-full' : ''}`}
                >
                  <MessageSquarePlus className="h-3.5 w-3.5" />
                  {isSidebarCollapsed ? null : t('patient.aiChat.newChatShort')}
                </button>
              </div>
            </div>

            <div className={`min-h-0 overflow-y-auto px-4 py-4 ${isSidebarCollapsed ? 'space-y-2' : 'space-y-3'}`}>
              <button
                type="button"
                onClick={startNewSession}
                aria-label={t('patient.aiChat.openNew')}
                title={t('patient.aiChat.newChat')}
                className={`w-full rounded-2xl border text-left transition ${
                  selectedSessionId === null
                    ? 'border-cyan-200 bg-cyan-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                } ${isSidebarCollapsed ? 'px-3 py-3 text-center' : 'px-4 py-3'}`}
              >
                {isSidebarCollapsed ? (
                  <MessageSquarePlus className="mx-auto h-4 w-4 text-gray-700" />
                ) : (
                  <>
                    <p className="text-sm font-semibold text-gray-900">{t('patient.aiChat.newChat')}</p>
                    <p className="mt-1 text-xs text-gray-500">{t('patient.aiChat.newChatSub')}</p>
                  </>
                )}
              </button>

              {sessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => {
                    setSelectedSessionId(session.id);
                    setSendError(null);
                  }}
                  aria-label={t('patient.aiChat.openChatFrom', {
                    date: formatSessionTimestamp(session.lastMessageAt, lang),
                  })}
                  title={session.preview}
                  className={`w-full rounded-2xl border text-left transition ${
                    selectedSessionId === session.id
                      ? 'border-cyan-200 bg-cyan-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  } ${isSidebarCollapsed ? 'px-3 py-3 text-center' : 'px-4 py-3'}`}
                >
                  {isSidebarCollapsed ? (
                    <p className="text-xs font-semibold text-gray-700">
                      {formatSessionTimestamp(session.lastMessageAt, lang)}
                    </p>
                  ) : (
                    <>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatSessionTimestamp(session.lastMessageAt, lang)}
                        </p>
                        <p className="text-[11px] uppercase tracking-wide text-gray-400">{t('patient.aiChat.previous')}</p>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-600">{session.preview}</p>
                    </>
                  )}
                </button>
              ))}

              {!loading && sessions.length === 0 ? (
                <div
                  className={`rounded-2xl border border-dashed border-gray-300 bg-white text-sm text-gray-500 ${
                    isSidebarCollapsed ? 'px-3 py-4 text-center text-xs' : 'px-4 py-5'
                  }`}
                >
                  {isSidebarCollapsed ? t('patient.aiChat.noneCollapsed') : t('patient.aiChat.noChats')}
                </div>
              ) : null}
            </div>
          </aside>

          <div className="flex min-h-0 flex-col">
            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedSessionId ? t('patient.aiChat.conversationPrevious') : t('patient.aiChat.conversationNew')}
              </h2>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-4">
                {loading ? (
                  <div className="flex h-full items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-ceenai-cyan" />
                  </div>
                ) : null}

                {!loading && error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {t('patient.aiChat.loadHistoryError')}
                  </div>
                ) : null}

                {pendingCanonicalUpdates.length > 0 ? (
                  <section className="mr-auto max-w-3xl rounded-3xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="rounded-2xl bg-white/80 p-3 text-amber-700">
                        <AlertCircle className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold text-gray-900">{t('patient.aiChat.reviewUpdatesTitle')}</h3>
                        <p className="mt-1 text-sm text-gray-700">{t('patient.aiChat.reviewUpdatesBody')}</p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {pendingCanonicalUpdates.map((update) => (
                        <article key={update.id} className="rounded-2xl border border-amber-200 bg-white px-4 py-4">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h4 className="text-sm font-semibold text-gray-900">{update.displayLabel}</h4>
                            <span
                              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                                update.requiresDoctorReview
                                  ? 'bg-violet-50 text-violet-700'
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}
                            >
                              {update.requiresDoctorReview
                                ? t('patient.aiChat.badgeDoctorReview')
                                : t('patient.aiChat.badgeUpdateRecord')}
                            </span>
                          </div>
                          <div className="mt-3 grid gap-3 md:grid-cols-2">
                            <div className="rounded-2xl bg-gray-50 px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                {t('patient.aiChat.fieldCurrent')}
                              </p>
                              <p className="mt-1 text-sm text-gray-700">{formatCanonicalValueForReview(update.currentValue)}</p>
                            </div>
                            <div className="rounded-2xl bg-cyan-50/70 px-4 py-3">
                              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
                                {t('patient.aiChat.fieldNew')}
                              </p>
                              <p className="mt-1 text-sm text-gray-900">{formatCanonicalValueForReview(update.proposedValue)}</p>
                            </div>
                          </div>
                          {typeof update.metadata.messagePreview === 'string' ? (
                            <p className="mt-3 text-xs text-gray-500">
                              {t('patient.aiChat.fromChat', { preview: update.metadata.messagePreview })}
                            </p>
                          ) : null}
                        </article>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => void handleApplyPendingUpdates()}
                        disabled={isApplyingRecordUpdates}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-ceenai-cyan to-ceenai-blue px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
                      >
                        {isApplyingRecordUpdates ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        {isApplyingRecordUpdates ? t('patient.aiChat.applying') : t('patient.aiChat.applyUpdates')}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDismissPendingUpdates()}
                        disabled={isApplyingRecordUpdates}
                        className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        {t('patient.aiChat.notNow')}
                      </button>
                    </div>
                    {recordUpdateFeedback ? (
                      <div className="mt-4 rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-amber-800">
                        {recordUpdateFeedback}
                      </div>
                    ) : null}
                  </section>
                ) : null}

                {!loading &&
                  !error &&
                  messages.map((message) => {
                    const isAssistant = message.role !== 'user';
                    const fileAttachments = getFileAttachments(message);
                    const historyBadges = getHistoryBadges(message);
                    const suggestedActions = getSuggestedActions(message);

                    return (
                      <article
                        key={message.id}
                        className={`max-w-3xl rounded-3xl px-5 py-4 shadow-sm ${
                          isAssistant
                            ? 'mr-auto border border-cyan-100 bg-cyan-50/70'
                            : 'ml-auto bg-gradient-to-r from-ceenai-cyan to-ceenai-blue text-white'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className={`text-xs font-semibold ${isAssistant ? 'text-cyan-700' : 'text-white/80'}`}>
                            {isAssistant ? t('patient.aiChat.agentName') : t('patient.aiChat.youLabel')}
                          </p>
                          <p className={`text-xs ${isAssistant ? 'text-gray-500' : 'text-white/80'}`}>
                            {formatTimestamp(message.createdAt, lang)}
                          </p>
                        </div>
                        {isAssistant ? (
                          <div className="mt-3 text-sm leading-6 text-gray-700">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ children }) => <p className="mt-3 first:mt-0">{children}</p>,
                                ol: ({ children }) => <ol className="mt-3 list-decimal space-y-2 pl-5 first:mt-0">{children}</ol>,
                                ul: ({ children }) => <ul className="mt-3 list-disc space-y-2 pl-5 first:mt-0">{children}</ul>,
                                li: ({ children }) => <li>{children}</li>,
                                strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                                a: ({ children, href }) => (
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-medium text-ceenai-blue underline"
                                  >
                                    {children}
                                  </a>
                                ),
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-white">{message.content}</p>
                        )}
                        {fileAttachments.length > 0 ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {fileAttachments.map((attachment) => (
                              <span
                                key={attachment.path}
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                  isAssistant ? 'bg-white text-gray-700' : 'bg-white/15 text-white'
                                }`}
                              >
                                {attachment.fileName}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        {isAssistant && historyBadges.length > 0 ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {historyBadges.map((badge) => (
                              <span
                                key={badge}
                                className="rounded-full border border-cyan-200 bg-white px-3 py-1 text-xs font-medium text-cyan-800"
                              >
                                {t('patient.aiChat.usedPrefix', { label: badge })}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        {isAssistant && suggestedActions.length > 0 ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {suggestedActions.map((action) => (
                              <button
                                key={`${message.id}-${action.href}`}
                                type="button"
                                onClick={() => navigate(action.href)}
                                className="rounded-full bg-ceenai-blue px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
                              >
                                {action.label}
                              </button>
                            ))}
                          </div>
                        ) : null}
                      </article>
                    );
                  })}

                {showStarterOptions ? (
                  <div className="mr-auto max-w-3xl rounded-3xl border border-dashed border-cyan-200 bg-cyan-50/40 p-5">
                    <p className="text-sm font-semibold text-cyan-900">{t('patient.aiChat.startWithOneTap')}</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {outstandingPreVisitAssessment ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/patient/pre-visit/${outstandingPreVisitAssessment.id}`)}
                          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-cyan-800 shadow-sm transition hover:shadow"
                        >
                          {t('patient.aiChat.continuePreVisit')}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => void handleSendMessage({ submittedMessage: t('patient.aiChat.starterPain') })}
                        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:shadow"
                      >
                        {t('patient.aiChat.starterPain')}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleSendMessage({ submittedMessage: t('patient.aiChat.starterPrepare') })}
                        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:shadow"
                      >
                        {t('patient.aiChat.starterPrepare')}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleSendMessage({ submittedMessage: t('patient.aiChat.starterReviewHistory') })}
                        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:shadow"
                      >
                        {t('patient.aiChat.starterReviewHistory')}
                      </button>
                    </div>
                  </div>
                ) : null}

                {isSending ? (
                  <div className="mr-auto flex max-w-3xl items-center gap-3 rounded-3xl border border-cyan-100 bg-cyan-50/70 px-5 py-4 shadow-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-700" />
                    <p className="text-sm text-gray-700">{t('patient.aiChat.preparingResponse')}</p>
                  </div>
                ) : null}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="border-t border-gray-100 px-6 py-5">
              {sendError ? (
                <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {sendError}
                </div>
              ) : null}

              {recordUpdateFeedback && pendingCanonicalUpdates.length === 0 ? (
                <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {recordUpdateFeedback}
                </div>
              ) : null}

              {pendingFiles.length > 0 ? (
                <div className="mb-4 flex flex-wrap gap-2">
                  {pendingFiles.map((file) => (
                    <button
                      key={`${file.name}-${file.size}`}
                      type="button"
                      onClick={() => handleRemovePendingFile(file.name)}
                      className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-200"
                    >
                      {file.name} x
                    </button>
                  ))}
                </div>
              ) : null}

              <form className="space-y-3" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="sr-only">{t('patient.aiChat.inputSrOnly')}</span>
                  <textarea
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    rows={3}
                    placeholder={t('patient.aiChat.inputPhLong')}
                    className="w-full resize-none rounded-3xl border border-gray-200 px-5 py-4 text-sm text-gray-900 shadow-sm outline-none transition focus:border-ceenai-cyan focus:ring-2 focus:ring-ceenai-cyan/20"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        void handleSendMessage();
                      }
                    }}
                  />
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleFileSelection}
                />

                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    <Paperclip className="h-4 w-4" />
                    {t('patient.aiChat.attach')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSending || !input.trim()}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-ceenai-cyan to-ceenai-blue px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send className="h-4 w-4" />
                    {isSending ? t('patient.aiChat.sending') : t('patient.aiChat.send')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
