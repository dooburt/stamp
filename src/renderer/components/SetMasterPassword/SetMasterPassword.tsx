function SetMasterPassword() {
  return (
    <div>
      <form className="mt-8 space-y-6" action="#" method="POST">
        <input
          type="password"
          name="masterPassword"
          id="masterPassword"
          className="block w-full rounded-md border-2 p-2 border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Enter a new password"
        />
      </form>
    </div>
  );
}

export default SetMasterPassword;
