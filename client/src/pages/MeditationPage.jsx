import { useState } from "react";
import GlassCard         from "../components/ui/GlassCard.jsx";
import MeditationTimer   from "../components/meditation/MeditationTimer.jsx";
import SoundMixer        from "../components/meditation/SoundMixer.jsx";
import { useMeditationTimer }    from "../hooks/useMeditationTimer.js";
import { MEDITATION_CATEGORIES } from "../data/meditation.js";
import { meditationApi }         from "../utils/api.js";

export default function MeditationPage() {
  const [selected,         setSelected]         = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [saving,           setSaving]           = useState(false);
  const [savedMsg,         setSavedMsg]         = useState("");

  // Lifted timer hook — shared between MeditationTimer and SoundMixer
  const timerHook = useMeditationTimer();

  const handleSelectCategory = (cat) => {
    setSelected(cat);
    setSelectedDuration(cat.durations[0]);
    setSavedMsg("");
  };

  const handleSelectDuration = (mins) => {
    setSelectedDuration(mins);
    setSavedMsg("");
  };

  const handleSessionComplete = async ({ duration, category }) => {
    setSaving(true);
    setSavedMsg("");
    try {
      await meditationApi.save({ category, duration });
      setSavedMsg(`✅ ${category} session saved!`);
    } catch {
      setSavedMsg("Session complete! (Could not save — check connection)");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Meditation &amp; Mindfulness</h2>
        <p className="text-gray-500 text-sm">Find your inner peace and calm</p>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {MEDITATION_CATEGORIES.map((cat) => (
          <GlassCard
            key={cat.id}
            onClick={() => handleSelectCategory(cat)}
            className={`p-5 cursor-pointer hover:scale-105 transition-all ${
              selected?.id === cat.id ? "ring-2 ring-emerald-400" : ""
            }`}
          >
            <div className="text-3xl mb-3">{cat.icon}</div>
            <div className="font-semibold text-gray-800 text-sm">{cat.name}</div>
            <div className="text-xs text-gray-500 mt-1">{cat.description}</div>
          </GlassCard>
        ))}
      </div>

      {/* Selected category banner + duration chooser */}
      {selected && (
        <div
          className="p-4 rounded-2xl border flex items-center gap-4 flex-wrap"
          style={{ background: `${selected.color}0f`, borderColor: `${selected.color}30` }}
        >
          <div className="text-4xl">{selected.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-gray-800">{selected.name}</div>
            <div className="text-sm text-gray-500">{selected.description}</div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {selected.durations.map((d) => (
                <button
                  key={d}
                  onClick={() => handleSelectDuration(d)}
                  className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all border ${
                    selectedDuration === d ? "text-white border-transparent" : "bg-white text-gray-600"
                  }`}
                  style={
                    selectedDuration === d
                      ? { background: selected.color }
                      : { borderColor: `${selected.color}50` }
                  }
                >
                  {d} min
                </button>
              ))}
            </div>
          </div>
          {(saving || savedMsg) && (
            <div className={`text-xs font-medium px-3 py-1.5 rounded-full ${
              savedMsg.startsWith("✅") ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
            }`}>
              {saving ? "Saving…" : savedMsg}
            </div>
          )}
        </div>
      )}

      {/* Timer + Sound mixer */}
      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard>
          <MeditationTimer
            selectedCategory={selected}
            selectedDuration={selectedDuration}
            timerHook={timerHook}
            onSessionComplete={handleSessionComplete}
          />
        </GlassCard>
        <GlassCard>
          <SoundMixer running={timerHook.running} phase={timerHook.phase} />
        </GlassCard>
      </div>
    </div>
  );
}