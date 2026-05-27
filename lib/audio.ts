import { Howl, Howler } from "howler";

// Howler wrapper (SPEC §8). All audio files are user-provided in /public/audio
// (see public/audio/README.md). Everything no-ops gracefully if a file is
// missing — Howl's load errors are swallowed.

const BGM_SRC = "/audio/bgm.mp3";

const CLICK_SFX = [
  "/audio/sfx/click1.mp3",
  "/audio/sfx/click2.mp3",
  "/audio/sfx/click3.mp3",
];

const SFX_SRC = {
  collapse: "/audio/sfx/collapse.mp3",
  event_start: "/audio/sfx/event_start.mp3",
  achievement: "/audio/sfx/achievement.mp3",
  alarm: "/audio/sfx/alarm.mp3",
} as const;

type SfxKey = keyof typeof SFX_SRC;
type VoiceCategory = "normal" | "marah" | "event";

// Fill these arrays with your uploaded voice filenames, e.g.
// ["/audio/voice/marah/1.mp3", "/audio/voice/marah/2.mp3"].
const VOICE_SRC: Record<VoiceCategory, string[]> = {
  normal: [],
  marah: [],
  event: [],
};

function quietHowl(src: string, opts: { loop?: boolean; volume?: number } = {}) {
  return new Howl({
    src: [src],
    preload: true,
    loop: opts.loop ?? false,
    volume: opts.volume,
    onloaderror: () => {},
    onplayerror: () => {},
  });
}

class AudioManager {
  private bgm: Howl | null = null;
  private clicks: Howl[] = [];
  private sfx: Partial<Record<SfxKey, Howl>> = {};
  private voices: Partial<Record<VoiceCategory, Howl[]>> = {};
  private started = false;
  private muted = false;
  private volume = 0.3;

  init(muted: boolean, volume: number) {
    this.muted = muted;
    this.volume = volume;
    Howler.mute(muted);
  }

  /** Must be called from a user gesture (browser autoplay policy). */
  unlock() {
    if (this.started) return;
    this.started = true;
    this.bgm = quietHowl(BGM_SRC, { loop: true, volume: this.volume });
    if (!this.muted) this.bgm.play();
    this.clicks = CLICK_SFX.map((s) => quietHowl(s, { volume: 0.5 }));
  }

  playClick() {
    if (this.muted || this.clicks.length === 0) return;
    const h = this.clicks[Math.floor(Math.random() * this.clicks.length)];
    h.play();
  }

  private getSfx(key: SfxKey): Howl {
    if (!this.sfx[key]) this.sfx[key] = quietHowl(SFX_SRC[key], { volume: 0.6 });
    return this.sfx[key]!;
  }

  playSfx(key: SfxKey) {
    if (this.muted) return;
    this.getSfx(key).play();
  }

  playVoice(category: VoiceCategory) {
    if (this.muted) return;
    const list = VOICE_SRC[category];
    if (!list || list.length === 0) return;
    if (!this.voices[category]) {
      this.voices[category] = list.map((s) => quietHowl(s, { volume: 0.8 }));
    }
    const arr = this.voices[category]!;
    arr[Math.floor(Math.random() * arr.length)].play();
  }

  playCollapse() {
    this.playSfx("collapse");
    this.playVoice("marah");
  }
  playEventStart() {
    this.playSfx("event_start");
    this.playVoice("event");
  }
  playAlarm() {
    this.playSfx("alarm");
  }
  playAchievement() {
    this.playSfx("achievement");
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    Howler.mute(muted);
    if (this.bgm) {
      if (muted) this.bgm.pause();
      else if (this.started) this.bgm.play();
    }
  }

  setVolume(volume: number) {
    this.volume = volume;
    this.bgm?.volume(volume);
  }
}

export const audio = new AudioManager();
