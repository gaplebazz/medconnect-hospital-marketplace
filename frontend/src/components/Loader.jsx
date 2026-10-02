export default function Loader({ inline = false }) {
  if (inline) return <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />;
  return (
    <div className="loader-wrap">
      <div className="spinner" />
    </div>
  );
}
