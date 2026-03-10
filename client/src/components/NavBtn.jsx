export default function NavBtn({ label, bool, onClick }) {
  return (
    <button disabled={bool} onClick={onClick}>
      {label}
    </button>
  );
}
