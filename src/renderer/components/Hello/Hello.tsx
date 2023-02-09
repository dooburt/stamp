import Avatar from '../Avatar/Avatar';
import SetMasterPassword from '../SetMasterPassword/SetMasterPassword';

function Hello() {
  return (
    <div className="flex items-stretch min-h-screen">
      <div className="flex-none w-64 bg-slate-100 border-r-2 border-slate-200">
        &nbsp;
      </div>
      <div className="flex grow justify-center items-center w-full space-y-6">
        <div>
          <div className="flex justify-center items-center mb-6">
            <Avatar />
          </div>
          <div>
            <h1 className="mb-6 text-4xl tracking-tight font-bold text-center">
              <span role="img">👋</span> Hello
            </h1>
          </div>
          <SetMasterPassword />
        </div>
      </div>
    </div>
  );
}

export default Hello;
