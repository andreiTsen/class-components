function DetailsSkeletonPanel() {
  return (
    <aside
      className="details-pane details-pane-skeleton"
      aria-label="Pokemon details"
    >
      <div className="skeleton-line skeleton-line-short" />
      <div className="skeleton-image" />
      <div className="skeleton-line" />
      <div className="skeleton-line" />
      <div className="skeleton-line skeleton-line-wide" />
      <p>Select a Pokemon to view details.</p>
    </aside>
  );
}

export default DetailsSkeletonPanel;
