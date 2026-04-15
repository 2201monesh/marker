import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { View, Note, Mill, Fabric } from "./types";

interface MillDetailProps {
  millId: string;
  mills: Mill[];
  fabrics: Fabric[];
  previousView: View;
  onNavigate: (view: View) => void;
}

export function MillDetail({ millId, mills, fabrics, previousView, onNavigate }: MillDetailProps) {
  const mill = mills.find((m) => m.id === millId);
  const [notes, setNotes] = useState<Note[]>(mill?.notes ?? []);
  const [emailCopied, setEmailCopied] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [newNoteText, setNewNoteText] = useState("");
  const [showNewNote, setShowNewNote] = useState(false);

  if (!mill) {
    return (
      <div className="flex-1 p-7">
        <p className="text-muted-foreground">Mill not found.</p>
      </div>
    );
  }

  const allEmails = mill.representatives.map((r) => r.email).join(", ");

  const copyAllEmails = useCallback(() => {
    navigator.clipboard.writeText(allEmails);
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 1500);
  }, [allEmails]);

  const startEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditText(note.text);
  };

  const saveEdit = (noteId: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, text: editText } : n))
    );
    setEditingNoteId(null);
    setEditText("");
  };

  const deleteNote = (noteId: string) => {
    if (!window.confirm("Delete this note?")) return;
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
  };

  const addNote = () => {
    if (!newNoteText.trim()) return;
    const newNote: Note = {
      id: `note-${Date.now()}`,
      text: newNoteText.trim(),
      author: "You",
      date: "Just now",
      type: "manual",
    };
    setNotes((prev) => [...prev, newNote]);
    setNewNoteText("");
    setShowNewNote(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-7">
      {/* Back link */}
      <button
        onClick={() => onNavigate(previousView)}
        className="mb-2 text-[12px] text-primary hover:underline"
      >
        &larr; {previousView.page === "search" ? "Back to Search" : "Back to Mills"}
      </button>

      {/* Mill Name */}
      <h1 className="mb-4 text-[24px] font-bold text-foreground">
        {mill.name}
      </h1>

      {/* Representatives */}
      <div className="mb-4 rounded-lg border border-border bg-white p-4 md:px-[18px]">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Representatives
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={copyAllEmails}
              className="flex items-center gap-1 rounded-[5px] bg-primary px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-primary/90"
            >
              {emailCopied ? "✓ Copied!" : "📋 Copy All Emails"}
            </button>
            <button
              className="text-[11px] text-primary"
              onClick={() => {}}
              title="Coming soon"
            >
              + Add
            </button>
          </div>
        </div>
        <div className="mb-2.5 text-[11px] text-muted-foreground">
          {allEmails}
        </div>
        <div className="flex gap-5">
          {mill.representatives.map((rep) => (
            <div
              key={rep.id}
              className="flex-1 rounded-md border border-border bg-background px-3.5 py-2.5"
            >
              <div className="text-[13px] font-semibold text-foreground">
                {rep.name}
              </div>
              <div className="text-[11px] text-muted-foreground">
                {rep.role}
              </div>
              <div className="mt-0.5 text-[11px] text-primary">{rep.email}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Fabrics */}
      {(() => {
        const millFabrics = fabrics.filter((f) => f.millId === millId);
        if (millFabrics.length === 0) return null;
        return (
          <div className="mb-4 rounded-lg border border-border bg-white p-4 md:px-[18px]">
            <div className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-primary">
              Fabrics ({millFabrics.length})
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="pb-2 pr-4 font-semibold">Art #</th>
                    <th className="pb-2 pr-4 font-semibold">Name</th>
                    <th className="pb-2 pr-4 font-semibold">Composition</th>
                    <th className="pb-2 pr-4 font-semibold">Weight</th>
                    <th className="pb-2 pr-4 font-semibold">Price</th>
                    <th className="pb-2 pr-4 font-semibold">MOQ</th>
                    <th className="pb-2 font-semibold">MOC</th>
                  </tr>
                </thead>
                <tbody>
                  {millFabrics.map((fabric) => (
                    <tr key={fabric.id} className="border-b border-border/50 last:border-b-0">
                      <td className="py-2 pr-4 font-medium">{fabric.artNumber}</td>
                      <td className="py-2 pr-4">{fabric.name}</td>
                      <td className={cn("py-2 pr-4", fabric.composition === "(pending)" && "italic text-muted-foreground")}>
                        {fabric.composition}
                      </td>
                      <td className={cn("py-2 pr-4", fabric.weight === "-" && "text-muted-foreground")}>
                        {fabric.weight}
                      </td>
                      <td className="py-2 pr-4">{fabric.price}</td>
                      <td className="py-2 pr-4">{fabric.moq}</td>
                      <td className="py-2">{fabric.moc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

      {/* Notes */}
      <div className="mb-4 rounded-lg border border-border bg-white p-4 md:px-[18px]">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Notes
          </div>
          <button
            onClick={() => setShowNewNote(true)}
            className="text-[11px] text-primary hover:underline"
          >
            + Add Note
          </button>
        </div>

        {notes.map((note) => (
          <div
            key={note.id}
            className={cn(
              "mb-2 rounded-md bg-background p-2.5 pl-3.5 last:mb-0",
              note.type === "extracted"
                ? "border-l-[3px] border-l-primary"
                : "border-l-[3px] border-l-accent"
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {editingNoteId === note.id ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 rounded border border-border bg-white px-2 py-1 text-[12px] focus:outline-none focus:ring-1 focus:ring-primary"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEdit(note.id);
                        if (e.key === "Escape") setEditingNoteId(null);
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(note.id)}
                      className="text-[11px] text-primary"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingNoteId(null)}
                      className="text-[11px] text-muted-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="text-[12px] text-foreground">
                      &ldquo;{note.text}&rdquo;
                    </div>
                    <div className="mt-1 text-[10px] text-muted-foreground">
                      {note.author} &middot; {note.date}
                    </div>
                  </>
                )}
              </div>
              {editingNoteId !== note.id && (
                <div className="ml-3 flex shrink-0 gap-2">
                  <button
                    onClick={() => startEdit(note)}
                    className="text-[11px] text-muted-foreground hover:text-foreground"
                    title="Edit"
                  >
                    ✏
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-[11px] text-red-600 hover:text-red-800"
                    title="Delete"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Add Note Inline */}
        {showNewNote && (
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="Add a note..."
              className="flex-1 rounded border border-border bg-white px-2 py-1.5 text-[12px] focus:outline-none focus:ring-1 focus:ring-primary"
              onKeyDown={(e) => {
                if (e.key === "Enter") addNote();
                if (e.key === "Escape") setShowNewNote(false);
              }}
              autoFocus
            />
            <button
              onClick={addNote}
              className="rounded bg-primary px-3 py-1.5 text-[11px] font-semibold text-white"
            >
              Save
            </button>
            <button
              onClick={() => {
                setShowNewNote(false);
                setNewNoteText("");
              }}
              className="text-[11px] text-muted-foreground"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Email Threads */}
      <div>
        <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Email Threads ({mill.emailThreads.length})
        </div>

        {mill.emailThreads.map((thread) => (
          <div
            key={thread.id}
            className="mb-2.5 cursor-pointer rounded-lg border border-border bg-white p-4 transition-colors hover:border-primary md:px-[18px]"
          >
            <div className="mb-2 flex items-start justify-between">
              <div className="mr-4 flex-1 text-[13px] font-semibold leading-snug text-foreground">
                {thread.subject}
              </div>
              <div className="shrink-0 whitespace-nowrap text-[10px] text-muted-foreground">
                {thread.messageCount} messages
              </div>
            </div>
            <div className="mb-2 text-[11px] text-muted-foreground">
              {thread.participants.join(", ")}
            </div>
            <div className="mb-2.5 text-[11px] text-muted-foreground">
              {thread.dateRange}
            </div>
            <div className="rounded-md border-l-[3px] border-l-border bg-background px-3 py-2.5 text-[12px] leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">Latest:</span>{" "}
              {thread.preview}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
