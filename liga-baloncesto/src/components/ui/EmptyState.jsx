export default function EmptyState({ icon = "📭", title, message, action }) {
  return (
    <div className="empty">
      <div className="empty__icon" aria-hidden="true">
        {icon}
      </div>
      {title && <h3>{title}</h3>}
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}
