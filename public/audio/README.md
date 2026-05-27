# Audio assets (user-provided)

These files are **not** in the repo — drop your own here. The game references them
by path (see `SPEC.md` §8). If you ever need a takedown, just delete the files;
the code degrades gracefully when audio is missing.

```
public/audio/
├── bgm.mp3                 # background music, loops (default volume 30%)
├── sfx/
│   ├── click1.mp3          # click variations (random pick to avoid fatigue)
│   ├── click2.mp3
│   ├── click3.mp3
│   ├── collapse.mp3        # box collapse
│   ├── event_start.mp3     # random event begins
│   ├── achievement.mp3     # milestone reached
│   └── alarm.mp3           # stability > 85%
└── voice/
    ├── normal/             # ambient lines, played randomly while stable
    ├── marah/              # played on collapse
    └── event/              # played on specific events (mapped in event-config)
```

Keep voice lines compressed to < ~500KB each. BGM can be larger but is lazy-loaded.
