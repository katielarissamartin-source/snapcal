# Snapcal

BeReal-style dual-camera app for a closed friend group. Expo (React Native) +
expo-router, backed by Supabase.

## Status

App shell scaffolded: navigation, 4 tabs, and a Supabase client stub are in
place as working screens. Each screen is a placeholder for its Month 1 task —
see below.

## Structure

```
app/
  _layout.tsx          root stack
  (tabs)/
    _layout.tsx         tab bar (Camera, Feed, Friends, Profile)
    index.tsx            Camera — live preview + permission handling
    feed.tsx              Feed — daily posts list (empty until Supabase is wired up)
    friends.tsx            Friends — closed friend-group list
    profile.tsx             Profile — account, blocked users, report history
lib/
  supabase.ts           Supabase client, reads EXPO_PUBLIC_SUPABASE_URL / _ANON_KEY
```

## Month 1 next steps

- [ ] Set up the Supabase project (fill in `.env` from `.env.example`)
- [ ] Build the camera composite flow (sequential back+front capture, composited —
      true simultaneous capture isn't supported in Expo)
- [ ] Build prompt bank v1
- [ ] Build minimal report/block UI (required for App Store approval)
- [x] Build the 4 tabs as working shells
- [ ] Test with the 3 founders, plus up to 2 trusted 16+ friends

## Key decisions

- Dual camera is faked: sequential back+front capture, composited client-side.
- UGC moderation (report, block, 24hr takedown) is non-negotiable for MVP —
  Apple requires it for App Store approval.
- "Offline app" claim reworked to an offline-tolerant capture queue, not
  literal offline-first.
- v1 is scoped to the closed friend group only, everyone 16+ (Australia's
  under-16 social media law).

## Getting started

```
npm install
cp .env.example .env   # fill in Supabase project URL + anon key once it exists
npx expo start
```
