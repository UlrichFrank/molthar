interface PlayerNameDisplayProps {
  playerName: string;
}

export function PlayerNameDisplay({ playerName }: PlayerNameDisplayProps) {
  return (
    <div className="absolute top-[80px] left-[20px] text-base font-semibold text-white bg-slate-800/85 px-4 py-2 rounded-md border border-slate-600 shadow-[0_2px_8px_rgba(0,0,0,0.3)] z-[99] min-w-[150px] text-center pointer-events-none whitespace-nowrap overflow-hidden text-ellipsis">
      <span className="block tracking-[0.3px]">
        Player: {playerName}
      </span>
    </div>
  );
}
