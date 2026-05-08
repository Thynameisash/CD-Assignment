export default function ProgressBar({ current, total }) {
  const pct = (current / total) * 100;

  return (
    <div className="mb-6">
      <p className="mb-2 text-xs font-medium text-gray-500">
        Step {current} of {total}
      </p>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-primary-500 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
