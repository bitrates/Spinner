import { useState, useEffect } from "react";
import { Save, Trash2, FolderOpen, Maximize2 } from "lucide-react";

interface SavedList {
  name: string;
  items: string[];
}

interface WheelSidebarProps {
  items: string[];
  setItems: (items: string[]) => void;
  onToggleFullscreen: () => void;
  result: string | null;
}

const STORAGE_KEY = "wheel-spinner-lists";

const loadLists = (): SavedList[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveLists = (lists: SavedList[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
};

const WheelSidebar = ({ items, setItems, onToggleFullscreen, result }: WheelSidebarProps) => {
  const [text, setText] = useState(items.join("\n"));
  const [savedLists, setSavedLists] = useState<SavedList[]>(loadLists);
  const [listName, setListName] = useState("");
  const [showSaved, setShowSaved] = useState(false);

  // Sync text -> items
  useEffect(() => {
    const parsed = text
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    setItems(parsed);
  }, [text, setItems]);

  const handleSave = () => {
    if (!listName.trim() || items.length === 0) return;
    const updated = [
      ...savedLists.filter((l) => l.name !== listName.trim()),
      { name: listName.trim(), items },
    ];
    setSavedLists(updated);
    saveLists(updated);
    setListName("");
  };

  const handleLoad = (list: SavedList) => {
    setText(list.items.join("\n"));
    setShowSaved(false);
  };

  const handleDelete = (name: string) => {
    const updated = savedLists.filter((l) => l.name !== name);
    setSavedLists(updated);
    saveLists(updated);
  };

  return (
    <aside className="w-full h-full flex flex-col bg-card border-r border-border p-5 gap-4 overflow-y-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Wheel Spinner</h1>
        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-md hover:bg-accent transition-colors duration-100"
          title="Full Screen"
        >
          <Maximize2 size={18} className="text-muted-foreground" />
        </button>
      </div>

      {result && (
        <div className="animate-fade-in rounded-lg bg-primary/10 border border-primary/20 p-3 text-center">
          <span className="text-sm text-muted-foreground">Winner</span>
          <p className="text-lg font-bold text-primary">{result}</p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Items (one per line)</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder={"Alice\nBob\nCharlie\nDiana"}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-y"
        />
        <span className="text-xs text-muted-foreground">{items.length} item{items.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Save */}
      <div className="flex gap-2">
        <input
          value={listName}
          onChange={(e) => setListName(e.target.value)}
          placeholder="List name"
          className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
        <button
          onClick={handleSave}
          disabled={!listName.trim() || items.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-orange-accent text-orange-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity duration-100 disabled:opacity-50"
        >
          <Save size={14} />
          Save
        </button>
      </div>

      {/* Saved Lists */}
      {savedLists.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => setShowSaved(!showSaved)}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-100"
          >
            <FolderOpen size={14} />
            Saved Lists ({savedLists.length})
          </button>
          {showSaved && (
            <div className="flex flex-col gap-1 animate-fade-in">
              {savedLists.map((list) => (
                <div
                  key={list.name}
                  className="flex items-center justify-between rounded-md px-3 py-2 bg-accent hover:bg-accent/80 transition-colors duration-100"
                >
                  <button
                    onClick={() => handleLoad(list)}
                    className="text-sm font-medium text-foreground text-left flex-1"
                  >
                    {list.name}
                    <span className="text-muted-foreground ml-1.5">({list.items.length})</span>
                  </button>
                  <button
                    onClick={() => handleDelete(list.name)}
                    className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors duration-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

export default WheelSidebar;
