import Button from '../Button/Button';

function SetMasterPassword() {
  return (
    <div>
      <form className="mt-8 space-y-2" action="#" method="POST">
        <div className="flex flex-row">
          <input
            type="password"
            name="masterPassword"
            id="masterPassword"
            className="block w-full rounded-md border-2 p-2 border-indigo-500 focus:border-indigo-500 focus:ring-indigo-500 h-12"
            placeholder="Enter a new master password"
          />
          <div className="ml-2">
            <Button label="Set" classes={['h-12']} />
          </div>
        </div>
      </form>
    </div>
  );
}

export default SetMasterPassword;
