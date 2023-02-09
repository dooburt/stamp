import avatar from '../../resources/avatars/sakura.png';

function Avatar() {
  return (
    <div className="relative w-24 h-24">
      <img
        className="rounded-full border border-gray-100 shadow-sm"
        src={avatar}
        alt="Your avatar"
      />
    </div>
  );
}

export default Avatar;
