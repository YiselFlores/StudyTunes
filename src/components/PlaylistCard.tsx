// components/PlaylistCard.tsx
type Track = {
  id: string;
  name: string;
  artists: string;
  url?: string; // https://open.spotify.com/track/{id}
};

type Props = {
  provider: "spotify" | "youtube_search";
  tracks: Track[];
  url?: string;           // youtube search url (fallback)
  reason?: string;        // debug: reason for fallback
  seedGenres?: string[];  // debug: seeds used
  error?: string;         // debug: server error message
  flags?: Record<string, any>; // debug flags
};

export default function PlaylistCard({
  provider,
  tracks,
  url,
  reason,
  seedGenres,
  error,
  flags
}: Props) {
  if (provider === "youtube_search") {
    return (
      <div className="rounded-xl border p-4 shadow-sm">
        <p className="mb-2">Couldn’t fetch Spotify (dev mode). Try this playlist search:</p>
        <a className="underline" href={url} target="_blank" rel="noreferrer">
          Open YouTube results
        </a>

        {/* (Optional) Dev debug – safe to remove once Spotify is working perfectly */}
        {(reason || error || (seedGenres && seedGenres.length) || flags) && (
          <div className="mt-2 text-xs text-gray-500 space-y-1">
            {reason && <p>reason: {reason}</p>}
            {error && <p>error: {error}</p>}
            {seedGenres?.length ? <p>seedGenres: {seedGenres.join(", ")}</p> : null}
            {flags ? (
              <pre className="whitespace-pre-wrap break-words">
                {JSON.stringify(flags, null, 2)}
              </pre>
            ) : null}
          </div>
        )}
      </div>
    );
  }

  // Provider is Spotify — render embedded players
  const display = tracks.slice(0, 5); // show top 5 players (tweak as you like)

  return (
    <div className="rounded-xl border p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">
        Recommended tracks
      </div>

      {display.length === 0 ? (
        <p className="text-sm text-gray-600">No tracks found for this vibe yet.</p>
      ) : (
        <ul className="space-y-4">
          {display.map((t) => (
            <li key={t.id} className="text-sm">
              <div className="font-medium">{t.name}</div>
              <div className="text-xs text-gray-500 mb-1">{t.artists}</div>

              {/* Spotify mini player embed */}
              <iframe
                src={`https://open.spotify.com/embed/track/${t.id}?utm_source=generator`}
                width="100%"
                height="80"
                frameBorder={0}
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                title={`spotify-player-${t.id}`}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

